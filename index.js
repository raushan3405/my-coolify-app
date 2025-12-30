const express = require("express");
const path = require("path");

const app = express();

// Coolify / cloud platforms ke liye PORT env use karna best practice hai
const PORT = process.env.PORT || 3000;

// Static files serve karne ke liye middleware
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
