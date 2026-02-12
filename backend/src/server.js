const cors = require("cors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const sql = require("better-sqlite3");
const db = new sql("database.db");

const Tetris = require("./tetris.js");
const game = new Tetris();
const GAME_PERIOD = 20; //ms
let gameRunning = false;
let gameInterval = null;

const { Server } = require("socket.io");
const io = new Server(server);

// Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    duration INTEGER,
    date DATETIME,
    FOREIGN KEY (username) REFERENCES users(username)
  )  
`);

db.close();

// Socket.IO communication
const interval = null;
io.on("connection", (socket) => {
  console.log(`Connected to socket.id: ${socket.id}`);
  if (!gameRunning) {
    startGame();
  }

  socket.on("moveLeft", (socket) => {
    game.moveLeft();
  });

  socket.on("moveRight", (socket) => {
    game.moveRight();
  });

  socket.on("moveDown", (socket) => {
    game.moveDown();
  });

  socket.on("rotateLeft", (socket) => {
    game.rotateLeft();
  });

  socket.on("rotateRight", (socket) => {
    game.rotateRight();
  });

  socket.emit("render", game.init());
});

io.on("disconnect", (socket) => {});

function startGame() {
  gameInterval = setInterval(() => {
    io.emit("render", game.update());
  }, GAME_PERIOD);
  gameRunning = true;
}

function stopGame() {
  if (gameInterval) {
    clearInterval(interval);
    gameInterval = null;
    gameRunning = false;
  }
}

// REST and routing
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Hello world
app.get("/", (req, res) => {
  res.status(200);
  res.set({ "Content-Type": "text/html" });
  res.send("Hello world!");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  res.json({ success: true, username: username });
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
