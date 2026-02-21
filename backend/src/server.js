const cors = require("cors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const sql = require("better-sqlite3");
const db = new sql("database.db");

const Tetris = require("./tetris.js");

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

class Room {
  constructor(game, twoPlayerMode) {
    this.twoPlayerMode = twoPlayerMode;
    this.slot1 = { game: game, player: game.player, readyStart: false };
    this.slot2 = { game: null, player: null, readyStart: false };
  }

  addGame(game) {
    if (game && this.twoPlayerMode && this.slot1.game === null) {
      this.slot1.game = game;
      this.slot1.player = game.player;
      return true;
    } else {
      return false;
    }
  }

  hasGame(game) {
    return game && (this.slot1.game === game || this.slot2.game === game);
  }

  getGame(username, twoPlayerMode) {
    if (
      this.twoPlayerMode === twoPlayerMode &&
      this.slot1.player === username
    ) {
      return this.slot1.game;
    } else if (
      this.twoPlayerMode === twoPlayerMode &&
      this.slot2.player === username
    ) {
      return this.slot2.game;
    } else {
      return null;
    }
  }

  flagGameReady(game) {
    if (game && this.slot1.game === game) {
      this.slot1.readyStart = true;
    } else {
      this.slot2.readyStart = true;
    }
  }

  readyToStart() {
    // ready if one-player mode, or both games ready
    return (
      !this.twoPlayerMode || (this.slot1.readyStart && this.slot2.readyStart)
    );
  }

  readyForRemoval() {
    // ready if one-player mode, only one game pending, or both games complete
    return (
      !this.twoPlayerMode ||
      !this.slot1.game ||
      !this.slot2.game ||
      (!this.slot1.game.isRunning() && !this.slot2.game.isRunning())
    );
  }
}

class Rooms {
  constructor() {
    this.rooms = [];
  }

  addGame(game, twoPlayerMode) {
    if (!this.getGame(game, twoPlayerMode)) {
      if (twoPlayerMode) {
        // if two-player, try and add to a waiting room first
        for (const room of this.rooms) {
          if (room.addGame(game)) {
            this.rooms.push(room);
            return room;
          }
        }
      }
      // else create a new room
      const room = new Room(game, twoPlayerMode);
      this.rooms.push(room);
      return room;
    } else {
      return null;
    }
  }

  getRoom(username, twoPlayerMode) {
    const room = this.rooms.find((r) => {
      return r.getGame(username, twoPlayerMode) !== null;
    });
    return room;
  }

  getGame(username, twoPlayerMode) {
    const room = this.getRoom(username, twoPlayerMode);
    if (room) {
      return room.getGame(username, twoPlayerMode);
    } else {
      return null;
    }
  }

  cleanup(game) {
    const room = this.rooms.find((r) => {
      return r.hasGame(game);
    });
    if (room && room.readyForRemoval()) {
      const index = this.rooms.indexOf(room);
      if (index !== -1) {
        this.rooms.splice(index, 1);
      }
    }
  }
}

const rooms = new Rooms();

// Socket.IO communication
io.on("connection", (socket) => {
  let game = null;
  let room = null;

  let username = null;
  let primaryPlayer = true;
  let twoPlayerMode = false;

  console.log(`Connected to socket.id: ${socket.id}`);

  socket.on("game-connect", (data) => {
    username = data.username;
    primaryPlayer = data.primaryPlayer;
    twoPlayerMode = data.twoPlayerMode;

    console.log(
      `Connected to user: ${username}, primary-player: ${primaryPlayer}, two-player-mode: ${twoPlayerMode}`,
    );

    room = rooms.getRoom(username, twoPlayerMode);
    game = rooms.getGame(username, twoPlayerMode);

    if (game) {
      // game exists, reattach and update socket reference
      game.attachOnUpdate(onUpdate);
      game.attachOnEnd(onEnd);

      socket.emit("render", game.currentState);
      socket.emit(
        "running-status",
        game.isRunning() ? "running" : "not-started",
      );
    } else {
      // game doesn't exist, create new game
      if (primaryPlayer) {
        game = new Tetris(username);
        game.attachOnUpdate(onUpdate);
        game.attachOnEnd(onEnd);

        // find available room or start new one
        room = rooms.addGame(game, twoPlayerMode);
      }
    }
  });

  socket.on("start", () => {
    console.log("start", !!room, !!game);
    if (game && room) {
      room.flagGameReady(game);

      if (room.readyToStart()) {
        game.init();
        game.run();
        socket.emit(
          "running-status",
          game.isRunning() ? "running" : "not-started",
        );
      }
    }
  });

  socket.on("reset", () => {
    if (game && room && room.readyForRemoval()) {
      // stop game, teardown
      game.stop();
      rooms.cleanup(game);

      // create new game
      game = new Tetris(username);

      // find available room or add to new one
      room = rooms.addGame(game);

      socket.emit("render", game.currentState);
      socket.emit(
        "running-status",
        game.isRunning() ? "running" : "not-started",
      );
    }
  });

  socket.on("moveLeft", () => {
    if (primaryPlayer && game) {
      game.moveLeft();
    }
  });

  socket.on("moveRight", () => {
    if (primaryPlayer && game) {
      game.moveRight();
    }
  });

  socket.on("moveDown", () => {
    if (primaryPlayer && game) {
      game.moveDown();
    }
  });

  socket.on("rotateLeft", () => {
    if (primaryPlayer && game) {
      game.rotateLeft();
    }
  });

  socket.on("rotateRight", () => {
    if (primaryPlayer && game) {
      game.rotateRight();
    }
  });

  socket.on("disconnect", () => {
    if (game) {
      game.removeOnUpdate(onUpdate);
      game.removeOnEnd(onEnd);
    }
  });

  function onUpdate(game) {
    socket.emit("render", game.currentState);
  }

  function onEnd(game) {
    // save score
    if (game.player && game.score > 0) {
      db.prepare(
        "INSERT INTO scores (username, score, durationMs, date) VALUES (?, ?, ?, ?)",
      ).run(game.player, game.score, game.durationMs, new Date().toISOString());
    }

    // remove from rooms array if both complete
    rooms.cleanup(game);

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
