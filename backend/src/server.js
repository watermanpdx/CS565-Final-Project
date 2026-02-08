const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const Tetris = require("./tetris.js");
const game = new Tetris();
const GAME_PERIOD = 20; //ms
let gameRunning = false;
let gameInterval = null;

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.IO communication
const interval = null;
io.on("connection", (socket) => {
  console.log("client connected!");
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

// Hello world
app.get("/", (req, res) => {
  res.status(200);
  res.set({ "Content-Type": "text/html" });
  res.send("Hello world!");
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
