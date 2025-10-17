const supabase = require("../supabaseClient.js");

const path = require('path');

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

//Encryption code for hashing the user passwords before entering the database
const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = process.env.PORT || 3001;
const app = express();

//FIXME Temporary Array as a database
const faux_database = [];

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../client/build')));

//Creating endpoint for route /api, follow similar syntax for retrieving/returning password info
app.post("/api/signup", async (req, res) => {
  const {username, password} = req.body;

  console.log("Received signup data: ", username, password);

  //FIXME Add password hashing and STORE IN THE DATABASE HERE!!!
  faux_database.push(username);

  //FIXME This check may be unnecessary as frontend already checks for empty inputs
  if (!username || !password) {
    return res.status(400).json({message: "Missing username or password"});
  }

  //Hash passwords
  bcrypt.genSalt(saltRounds, (err, salt) => {
  if (err) {
        console.error('Error hashing password:', err);
      return;
  }
  })
  const userPassword = password;
  bcrypt.hash(userPassword, salt, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return;
    }
    console.log("Hashed password:", hash);
  });

  //FIXME Change from users to whatever database logic is created - - - - - - THIS IS WHERE I AM EDITING DATABASE LOGIC. Check for existing users?
  const {data, error} = await supabase
  .from("users")
  .insert([{ username, password }]);

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(400).json({message: "Signup failed", error});
  }

  res.json({message: "Signup successful!", user: username});

  //FIXME Check for 5 elements in array then print here
  if (faux_database.length == 5) {
    console.log("Printing faux database!");
    for (let i = 0;i < 5;i++) {
      console.log(faux_database[i]);
    }
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