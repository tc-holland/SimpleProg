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

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../client/build')));

//Creating endpoint for route /api, follow similar syntax for retrieving/returning password info
app.post("/api/signup", async (req, res) => {
  const {username, password} = req.body;

  console.log("Received signup data: ", username, password);

  // Check for missing fields
  if (!username || !password) {
    return res.status(400).json({message: "Missing username or password"});
  }

  //Hash passwords
  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) {
      console.error("Error salting password");
      return -1;
    }
    bcrypt.hash(password, salt, async function(err, hash) {
      if (err) {
        console.error("Error hashing password");
        return -1;
      }
      
      // Check for existing users
      const{data: user, error: errCheck} = await supabase
        .from('Users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (errCheck) {
        console.error("Supabase check error:", errCheck);
        return res.status(400).json({message: "Signup failed", errCheck});
      }
      if (user) {
        // User already exists
        console.error("User already exists:", user);
        return res.status(400).json({message: "User already exists"});
      }
      else {
        //FIXME adminBit value necessary still
        const {data, error} = await supabase
        .from("Users")
        .insert([{username: username, passwordHash: hash}]);
        if (error) {
          console.error("Supabase insert error:", error);
          return res.status(400).json({message: "Signup failed", error});
        }

        res.json({message: "Signup successful!", user: username});
      }

      console.log(hash);
    });
  });
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