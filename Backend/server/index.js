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
    return res.json({ message: "Login successful!", user: username, success: true, token });
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

    // Insert new user and return the created row
    const { data, error } = await supabase
      .from('Users')
      .insert([{ username: username, passwordHash: hash }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Signup failed" });
    }

    const createdUser = Array.isArray(data) ? data[0] : data;

    // Create JWT for the new user
    try {
      const token = jwt.sign({ sub: createdUser.id || createdUser.username, username: createdUser.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: "Signup successful!", user: username, success: true, token });
    } catch (err) {
      console.error('Error creating signup token:', err);
      return res.status(201).json({ message: "Signup successful!", user: username, success: true });
    }
  } catch (err) {
    console.error('Unexpected signup error:', err);
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
