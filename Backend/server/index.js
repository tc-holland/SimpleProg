const supabase = require("../supabaseClient.js");

const path = require('path');

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// JSON Web Token for issuing auth tokens
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

//Encryption code for hashing the user passwords before entering the database
const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../client/build')));

//Creating endpoint for route /api/login, follow similar syntax for retrieving/returning password info
app.post("/api/login", async (req, res) => {
  const {username, password} = req.body;

  console.log("Received login data: ", username, password);

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({message: "Missing username or password"});
  }

  // Compare username and password with database entries
  const{data: user, error} = await supabase
    .from('Users')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  
  if (error) {
    console.error("Supabase login error:", error);
    return res.status(400).json({message: "Login failed", error});
  }
  if (!user) {
    return res.status(400).json({message: "Invalid username or password"});
  }

  // Compare hashed password
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return res.status(400).json({message: "Invalid username or password"});
  }

  // Create JWT token (expires in 7 days)
  try {
    const token = jwt.sign({ sub: user.id || user.username, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    console.log(user.classCode);
    return res.json({ message: "Login successful!", user: username, userId: user.id, success: true, token, classCode: user.classCode || null, studentList: user.studentList || null });
  } catch (err) {
    console.error('Error creating token:', err);
    return res.status(500).json({ message: 'Login succeeded but token creation failed' });
  }
});

//Creating endpoint for route /api/signup, follow similar syntax for retrieving/returning password info
app.post("/api/signup", async (req, res) => {
  const {username, password} = req.body;

  console.log("Received signup data: ", username, password);

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({message: "Missing username or password"});
  }

  try {
    // Check for existing users
    const { data: existingUser, error: errCheck } = await supabase
      .from('Users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (errCheck) {
      console.error("Supabase check error:", errCheck);
      return res.status(500).json({ message: "Signup failed" });
    }

    if (existingUser) {
      // User already exists
      console.error("User already exists:", existingUser);
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password (async)
    const hash = await bcrypt.hash(password, saltRounds);

    // Determine user role, validate it, and generate class code if necessary
    const role = req.body.userRole || 'student';
    if (role !== 'teacher' && role !== 'student') {
      console.error('Invalid userRole provided:', req.body.userRole);
      return res.status(400).json({ message: 'Invalid user role' });
    }
    const admin = role === 'teacher' ? 1 : 0;
    let code = null;

    // Behavior for teacher signups
    if (admin) {
      let unique = false;

      while (!unique) {
        let min = 100000;
        let max = 999999;
        code = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log("Generating class code:", code);

        // check that code is unique in database and is added
        const { data: generated, error: genError } = await supabase
          .from('Classes')
          .select('classCode')
          .eq('classCode', code)
          .maybeSingle();
        
        if (genError) {
          console.error("Supabase class code generation error:", genError);
          return res.status(500).json({ message: "Signup failed" });
        }

        if (generated) {
          console.error("Generated class code already exists, regenerating:", code);
        }
        else {
          unique = true;
          // Insert new class into Classes table
          const { data, error } = await supabase
            .from('Classes')
            .insert([{ classCode: code, studentList: [] }])
            .select();
          
          if (error) {
            console.error("Supabase insert class error:", error);
            return res.status(500).json({ message: "Signup failed" });
          }
        }
      }
    }
    else {
      // Behavior for student signups
      code = req.body.classCode;

      // Validate presence of classCode
      if (!code) {
        console.error('Missing classCode in signup request');
        return res.status(400).json({ message: 'Missing class code' });
      }

      // Fetch the class row and its studentList
      const { data: classRow, error: classErr } = await supabase
        .from('Classes')
        .select('classCode, studentList')
        .eq('classCode', code)
        .maybeSingle();

      if (classErr) {
        console.error('Supabase class code check error:', classErr);
        return res.status(500).json({ message: 'Signup failed' });
      }

      if (!classRow) {
        console.error('Class code does not exist:', code);
        return res.status(400).json({ message: 'Invalid class code' });
      }

      // Add student to target class
      const newStudent = { username };
      const updatedstudentList = [...(classRow.studentList || []), newStudent];

      const { error: updateError } = await supabase
        .from('Classes')
        .update({ studentList: updatedstudentList })
        .eq('classCode', code);

      if (updateError) {
        console.error('Supabase update studentList error:', updateError);
        return res.status(500).json({ message: 'Signup failed' });
      }
    }

    // Insert new user and return the created row
    const { data, error } = await supabase
      .from('Users')
      .insert([{ username: username, passwordHash: hash, adminBit: admin, classCode: code }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Signup failed" });
    }

    const createdUser = Array.isArray(data) ? data[0] : data;

    // Create JWT for the new user
    try {
      const token = jwt.sign({ sub: createdUser.id || createdUser.username, username: createdUser.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: "Signup successful!", user: username, success: true, token, classCode: createdUser.classCode || null, studentList: createdUser.studentList || null });
    } catch (err) {
      console.error('Error creating signup token:', err);
      return res.status(201).json({ message: "Signup successful!", user: username, success: true });
    }
  } catch (err) {
    console.error('Unexpected signup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Puzzle endpoints
app.get("/api/puzzles/:id", async (req, res) => {
  const { id } = req.params;
  
  // Default puzzle data as fallback
  const defaultPuzzles = {
    puzzle1: {
      sentences: [
        {
          id: 1,
          parts: [
            { id: 1, correctWord: 'def' },
            'fib(n):\n\tif ',
            { id: 2, correctWord: 'n' },
            '== 0:\n\t\treturn 0\n\telif n ',
            { id: 3, correctWord: '==' },
            ' 1:\n\t\treturn 1\n\telse:\n\t\treturn ',
            { id: 4, correctWord: 'fib' },
            '(n-1) + fib(n-2)',
          ],
        },
      ],
      words: ['def', 'fib', 'n', '=='],
    },
    puzzle2: {
      sentences: [
        {
          id: 1,
          parts: [
            'Line 1: ',
            { id: 1, correctWord: 'def add(a, b)' },
            '\nLine 2: \t',
            { id: 2, correctWord: 'c = a + b' },
            '\nLine 3: \t',
            { id: 3, correctWord: 'return c' },
          ],
        },
      ],
      words: ['return c', 'def add(a, b)', 'c = a + b'],
    },
    puzzle3: {
      sentences: [
        {
          id: 1,
          parts: [
            'Line 1: ',
            { id: 1, correctWord: 'def isPalindrome(str):' },
            '\nLine 2: \t',
            { id: 2, correctWord: 'cleaned = ""' },
            '\nLine 3: \t',
            { id: 3, correctWord: 'for c in str.lower():' },
            '\nLine 4: \t\t',
            { id: 4, correctWord: 'if c.isalnum():' },
            '\nLine 5: \t\t\t',
            { id: 5, correctWord: 'cleaned += c' },
            '\nLine 6: \t',
            { id: 6, correctWord: 'return cleaned == cleaned[::-1]' },
          ],
        },
      ],
      words: [
        'def isPalindrome(str):',
        'cleaned = ""',
        'for c in str.lower():',
        'if c.isalnum():',
        'cleaned += c',
        'return cleaned == cleaned[::-1]',
      ],
    },
  };
  
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase fetch error:", error);
      // Return default data on error
      const defaultData = defaultPuzzles[id];
      if (defaultData) {
        return res.json({ data: defaultData });
      }
      return res.status(500).json({ message: "Failed to fetch puzzle", error });
    }
    
    if (!data) {
      // Return default data if not in database
      const defaultData = defaultPuzzles[id];
      if (defaultData) {
        return res.json({ data: defaultData });
      }
      return res.status(404).json({ message: "Puzzle not found" });
    }
    
    res.json({ data: JSON.parse(data.data) });
  } catch (err) {
    console.error("Error fetching puzzle:", err);
    // Return default data on exception
    const defaultData = defaultPuzzles[id];
    if (defaultData) {
      return res.json({ data: defaultData });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/puzzles/:id", async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  
  if (!data) {
    return res.status(400).json({ message: "Missing puzzle data" });
  }
  
  try {
    const { data: existing } = await supabase
      .from('puzzles')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    let result;
    if (existing) {
      result = await supabase
        .from('puzzles')
        .update({ data: JSON.stringify(data) })
        .eq('id', id)
        .select();
    } else {
      result = await supabase
        .from('puzzles')
        .insert([{ id, data: JSON.stringify(data) }])
        .select();
    }
    
    if (result.error) {
      console.error("Supabase update error:", result.error);
      return res.status(500).json({ message: "Failed to save puzzle", error: result.error });
    }
    
    res.json({ message: "Puzzle saved", success: true });
  } catch (err) {
    console.error("Error saving puzzle:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark a puzzle as completed and increment levelCompleted if first completion
app.post("/api/puzzles/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }
  
  try {
    // Get user's completed puzzles
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('completed_puzzles, levelCompleted')
      .eq('id', userId)
      .maybeSingle();
    
    if (userError || !user) {
      console.error("Failed to fetch user:", userError);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Parse completed puzzles (assume it's stored as JSON string or array)
    let completedPuzzles = [];
    try {
      if (user.completed_puzzles) {
        completedPuzzles = typeof user.completed_puzzles === 'string' 
          ? JSON.parse(user.completed_puzzles) 
          : user.completed_puzzles;
      }
    } catch (e) {
      console.error("Error parsing completed puzzles:", e);
      completedPuzzles = [];
    }
    
    // Check if puzzle was already completed
    const alreadyCompleted = completedPuzzles.includes(id);
    
    // Add puzzle to completed list
    if (!alreadyCompleted) {
      completedPuzzles.push(id);
    }
    
    // Update user with new completed puzzles and increment levelCompleted if first time
    let updateData = { completed_puzzles: JSON.stringify(completedPuzzles) };
    if (!alreadyCompleted) {
      updateData.levelCompleted = (user.levelCompleted || 0) + 1;
    }
    
    const { error: updateError } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', userId);
    
    if (updateError) {
      console.error("Failed to update user:", updateError);
      return res.status(500).json({ message: "Failed to record completion", error: updateError.message });
    }
    
    res.json({ 
      message: "Puzzle completion recorded", 
      levelIncremented: !alreadyCompleted,
      newLevel: alreadyCompleted ? user.levelCompleted : (user.levelCompleted || 0) + 1,
      levelCompleted: alreadyCompleted ? user.levelCompleted : (user.levelCompleted || 0) + 1,
      completed_puzzles: completedPuzzles
    });
  } catch (err) {
    console.error("Error recording puzzle completion:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});


app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
