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
    return res.json({ message: "Login successful!", user: username, userId: user.id, success: true, token, classCode: user.classCode || null });
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
      return res.status(201).json({ message: "Signup successful!", user: username, success: true, token, classCode: createdUser.classCode || null });
    } catch (err) {
      console.error('Error creating signup token:', err);
      return res.status(201).json({ message: "Signup successful!", user: username, success: true });
    }
  } catch (err) {
    console.error('Unexpected signup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get the list of students for a given class code
app.get("/api/class/:classCode/students", async (req, res) => {
  const { classCode } = req.params;

  try {
    const { data, error } = await supabase
      .from("Classes")
      .select("studentList")
      .eq("classCode", Number(classCode))
      .maybeSingle();

    if (error) {
      console.error("Fetch students error:", error);
      return res.status(500).json({ message: "Failed to fetch students" });
    }

    if (!data) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.json({ students: data.studentList || [] });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get student progress for a given class
app.get("/api/class/:classCode/progress", async (req, res) => {
  const { classCode } = req.params;

  try {
    //Get students from Classes table
    const { data: classRow, error: classError } = await supabase
      .from("Classes")
      .select("studentList")
      .eq("classCode", Number(classCode))
      .maybeSingle();

    if (classError || !classRow) {
      return res.status(404).json({ message: "Class not found" });
    }

    const students = classRow.studentList || [];
    const usernames = students.map(s => s.username);

    if (usernames.length === 0) {
      return res.json({ students: [] });
    }

    //Get progress from Users table
    const { data: userRows, error: userError } = await supabase
      .from("Users")
      .select("username, completed_puzzles, levelCompleted")
      .in("username", usernames);

    if (userError) {
      console.error("Progress fetch error:", userError);
      return res.status(500).json({ message: "Failed to fetch progress" });
    }

    //Format the response
    const formatted = userRows.map(user => ({
      username: user.username,
      puzzlesCompleted: user.levelCompleted || 0,
      completedPuzzles: user.completed_puzzles
        ? typeof user.completed_puzzles === "string"
          ? JSON.parse(user.completed_puzzles)
          : user.completed_puzzles
        : []
    }));

    return res.json({ students: formatted });

  } catch (err) {
    console.error("Progress route error:", err);
    return res.status(500).json({ message: "Server error" });
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

  // Prefer token auth: Authorization: Bearer <token>
  const authHeader = (req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  let userId = null;

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.sub; // ensure payload.sub contains the DB user id
  } catch (err) {
    console.error('Invalid token in completion endpoint:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Fetch user row
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('completed_puzzles, levelCompleted')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      console.error('Failed to fetch user:', userError);
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse completed_puzzles safely
    let completedPuzzles = [];
    try {
      if (user.completed_puzzles) {
        completedPuzzles = Array.isArray(user.completed_puzzles)
          ? user.completed_puzzles
          : JSON.parse(user.completed_puzzles);
      }
    } catch (e) {
      console.error('Error parsing completed puzzles:', e);
      completedPuzzles = [];
    }

    const alreadyCompleted = completedPuzzles.includes(id);

    // If not yet completed, append and increment
    if (!alreadyCompleted) completedPuzzles.push(id);

    // Prepare update data
    const updateData = { completed_puzzles: completedPuzzles };
    if (!alreadyCompleted) updateData.levelCompleted = (user.levelCompleted || 0) + 1;

    // Update user row
    const { error: updateError } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return res.status(500).json({ message: 'Failed to record completion', error: updateError.message });
    }

    return res.json({
      message: 'Puzzle completion recorded',
      levelIncremented: !alreadyCompleted,
      newLevel: !alreadyCompleted ? (user.levelCompleted || 0) + 1 : user.levelCompleted,
      completed_puzzles: completedPuzzles,
    });
  } catch (err) {
    console.error('Error recording puzzle completion:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Return current user info (requires auth)
app.get('/api/me', async (req, res) => {
  const authHeader = (req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing auth token' });

  let userId = null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.sub;
  } catch (err) {
    console.error('Invalid token on /api/me:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    const { data: user, error } = await supabase
      .from('Users')
      .select('id, username, classCode, adminBit, completed_puzzles, levelCompleted')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      console.error('Failed to fetch user for /api/me:', error);
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure completed_puzzles is an array
    let completed = [];
    try {
      if (user.completed_puzzles) completed = Array.isArray(user.completed_puzzles) ? user.completed_puzzles : JSON.parse(user.completed_puzzles);
    } catch (e) {
      completed = [];
    }

    return res.json({
      id: user.id,
      username: user.username,
      classCode: user.classCode,
      adminBit: user.adminBit,
      levelCompleted: user.levelCompleted || 0,
      completed_puzzles: completed,
    });
  } catch (err) {
    console.error('Error in /api/me:', err);
    return res.status(500).json({ message: 'Internal server error' });
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
