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

const { Server } = require("socket.io");
const io = new Server(server);

const MAX_SCORE_ENTRIES = 10000;

// Database (setup)
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    durationMs INTEGER,
    date DATETIME,
    FOREIGN KEY (username) REFERENCES users(username)
  )  
`,
).run();

// Socket.IO communication
io.on("connection", (socket) => {
  console.log(`Connected to socket.id: ${socket.id}`);
  if (!game.isRunning()) {
    game.init();
    game.run();
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

  //socket.emit("render", game.init());
});

game.onUpdate((state) => {
  io.emit("render", state);
});

game.onEnd((state, durationMs) => {
  addScore(game.getPlayer(), state.score, durationMs);
});

io.on("disconnect", (socket) => {});

function addScore(username, score, durationMs) {
  if (username && score > 0) {
    db.prepare(
      "INSERT INTO scores (username, score, durationMs, date) VALUES (?, ?, ?, ?)",
    ).run(username, score, durationMs, new Date().toISOString());
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

app.get("/scores", (req, res) => {
  const maxEntries = req.query.maxEntries
    ? req.query.maxEntries
    : MAX_SCORE_ENTRIES;
  try {
    const scores = db
      .prepare("SELECT * FROM scores ORDER BY score DESC LIMIT ?")
      .all(maxEntries);
    res.status(200);
    res.json(scores);
  } catch {}
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const record = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
    if (password === record.password) {
      //Successful login
      res.json({ success: true, username: username });
      game.setPlayer(username);

      return;
    } else {
      res.json({ success: false, username: null });
      return;
    }
  } catch {
    res.json({ success: false, username: null });
    return;
  }
});

app.post("/new-account", (req, res) => {
  const { username, password } = req.body;
  try {
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
      username,
      password,
    );
    res.json({ success: true });
    return;
  } catch {
    res.json({ success: false });
    return;
  }
});

app.post("/password-reset", (req, res) => {
  const { username, password } = req.body;

  try {
    db.prepare("UPDATE users SET password = ? WHERE username = ?").run(
      password,
      username,
    );
    res.json({ success: true });
    return;
  } catch {
    res.json({ success: false });
    return;
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
