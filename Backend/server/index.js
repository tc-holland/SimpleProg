//FIXME Do I need to declare a PORT
const path = require('path');

const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

//Creating endpoint for route /api, follow similar syntax for retrieving/returning password info
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});


app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});