const express = require("express");
const app = express();
const port = process.env.PORT || 5001;

const Tetris = require("./tetris.js");
game = new Tetris();

// Hello world
app.get("/", (req, res) => {
  res.status(200);
  res.set({ "Content-Type": "text/html" });
  res.send("Hello world!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
