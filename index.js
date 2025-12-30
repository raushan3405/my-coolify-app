const express = require("express");
const app = express();

// Coolify / cloud platforms ke liye PORT env use karna best practice hai
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Frmply World");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
