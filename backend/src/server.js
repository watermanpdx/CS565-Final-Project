const cors = require("cors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const sql = require("better-sqlite3");
const db = new sql("database.db");

const Rooms = require("./rooms.js");

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
    UNIQUE(username, score, durationMs)
  )  
`,
).run();

const rooms = new Rooms();

// Socket.IO communication
io.on("connection", (socket) => {
  let room = null;
  let primaryGame = null;
  let secondaryGame = null;
  let username = null;

  console.log(`Connected to socket.id: ${socket.id}`);

  socket.on("game-connect", (data) => {
    username = data.username;
    const primaryPlayer = data.primaryPlayer;
    const twoPlayerMode = data.twoPlayerMode;

    console.log(
      `Connecting ${twoPlayerMode ? "2-player" : "1-player"} game for: ${username}`,
    );

    room = rooms.joinRoom(username, twoPlayerMode);
    room.attachOnRunning(onRunning);

    if (primaryPlayer) {
      room.attachOnPlayer(onPlayer);
      onPlayer(room);

      primaryGame = room.getPrimaryGame(username);
      primaryGame.attachOnUpdate(onUpdate);
      primaryGame.attachOnEnd(onEnd);

      socket.emit("render-primary", primaryGame.currentState);
    } else {
      secondaryGame = room.getSecondaryGame(username);
      secondaryGame.attachOnUpdate(onUpdate);
      secondaryGame.attachOnEnd(onEnd);

      socket.emit("render-secondary", secondaryGame.currentState);
    }
  });

  socket.on("start", () => {
    if (room) {
      room.start(username);
    }
  });

  socket.on("reset", () => {
    if (room) {
      room.stop();

      if (primaryGame) {
        socket.emit("render-primary", primaryGame.currentState);
      }
      if (secondaryGame) {
        socket.emit("render-secondary", secondaryGame.currentState);
      }
      /*
      socket.emit(
        "running-status",
        room.isRunning() ? "running" : "not-started",
      );
      */
    }
  });

  socket.on("moveLeft", () => {
    if (primaryGame) {
      primaryGame.moveLeft();
    }
  });

  socket.on("moveRight", () => {
    if (primaryGame) {
      primaryGame.moveRight();
    }
  });

  socket.on("moveDown", () => {
    if (primaryGame) {
      primaryGame.moveDown();
    }
  });

  socket.on("rotateLeft", () => {
    if (primaryGame) {
      primaryGame.rotateLeft();
    }
  });

  socket.on("rotateRight", () => {
    if (primaryGame) {
      primaryGame.rotateRight();
    }
  });

  socket.on("disconnect", () => {
    if (primaryGame) {
      primaryGame.removeOnUpdate(onUpdate);
      primaryGame.removeOnEnd(onEnd);
    }
    if (secondaryGame) {
      secondaryGame.removeOnUpdate(onUpdate);
      secondaryGame.removeOnEnd(onEnd);
    }

    if (room) {
      room.removeOnPlayer(onPlayer);
      room.removeOnRunning(onRunning);
    }
  });

  function onPlayer() {
    if (room) {
      socket.emit("player-update", {
        primary: room.getPrimaryGame(username)
          ? room.getPrimaryGame(username).player
          : null,
        secondary: room.getSecondaryGame(username)
          ? room.getSecondaryGame(username).player
          : null,
      });
    }
  }

  function onRunning() {
    if (room) {
      socket.emit(
        "running-status",
        room.isRunning() ? "running" : "not-started",
      );
    }
  }

  function onUpdate(game) {
    if (primaryGame) {
      socket.emit("render-primary", primaryGame.currentState);
    }
    if (secondaryGame) {
      socket.emit("render-secondary", secondaryGame.currentState);
    }
  }

  function onEnd(game) {
    // save score
    if (game.player && game.score > 0) {
      db.prepare(
        "INSERT OR IGNORE INTO scores (username, score, durationMs, date) VALUES (?, ?, ?, ?)",
      ).run(game.player, game.score, game.durationMs, new Date().toISOString());
    }

    // clean up rooms and handles
    rooms.cleanup();
    game.removeOnEnd(onEnd);

    // inform frontend of state
    socket.emit("running-status", game.isRunning() ? "running" : "not-started");
  }
});

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
