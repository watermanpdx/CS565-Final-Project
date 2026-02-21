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
  constructor(twoPlayerMode, username = null) {
    this.id = Math.floor(Math.random() * 1000000);
    this.twoPlayerMode = twoPlayerMode;
    this.slot1 = {
      game: new Tetris(),
      readyStart: false,
    };
    this.slot2 = {
      game: new Tetris(),
      readyStart: false,
    };

    if (username) {
      this.registerPlayer(username);
    }
  }

  isAvailable() {
    return this.slot1.game.player === null || this.slot2.game.player === null;
  }

  registerPlayer(username) {
    if (this.slot1.game.player === null) {
      this.slot1.game.player = username;
      return true;
    } else if (this.slot2.game.player === null) {
      this.slot2.game.player = username;
      return true;
    } else {
      return false;
    }
  }

  isActiveRoom(username, twoPlayerMode) {
    return (
      this.twoPlayerMode === twoPlayerMode &&
      (this.slot1.game.player === username ||
        this.slot2.game.player === username)
    );
  }

  getPrimaryGame(username) {
    if (this.slot1.game.player === username) {
      return this.slot1.game;
    } else if (this.slot2.game.player === username) {
      return this.slot2.game;
    } else {
      return null;
    }
  }

  getSecondaryGame(username) {
    if (this.slot1.game.player === username) {
      return this.slot2.game;
    } else if (this.slot2.game.player === username) {
      return this.slot1.game;
    } else {
      return null;
    }
  }

  start(username) {
    if (!this.twoPlayerMode) {
      // if one-player no need to wait, just start
      this.slot1.readyStart = true;
      this.slot1.game.init();
      this.slot1.game.run();
    } else {
      // if two-player, only start when both are ready
      if (this.slot1.game.player === username) {
        this.slot1.readyStart = true;
      } else if (this.slot2.game.player === username) {
        this.slot2.readyStart = true;
      }

      if (this.slot1.readyStart && this.slot2.readyStart) {
        this.slot1.game.init();
        this.slot1.game.run();
        this.slot2.game.init();
        this.slot2.game.run();
      }
    }
  }

  stop() {
    if (!this.twoPlayerMode) {
      this.slot1.game.stop();
    }
  }

  isRunning() {
    if (!this.twoPlayerMode) {
      return this.slot1.game.isRunning();
    } else {
      return this.slot1.game.isRunning() && this.slot2.game.isRunning();
    }
  }
}

class Rooms {
  constructor() {
    this.rooms = [];
  }

  joinRoom(username, twoPlayerMode) {
    // check if already in room
    let room = this.findActiveRoom(username, twoPlayerMode);
    // check for available room
    if (!room) {
      room = this.rooms.find((r) => {
        return r.isAvailable();
      });
      if (room) {
        room.registerPlayer(username);
      }
    }
    // create new room
    if (!room) {
      room = new Room(twoPlayerMode, username);
      this.rooms.push(room);
    }

    console.log(
      `Room id-${room.id}, mode: ${this.twoPlayerMode ? "2-player" : "1-player"}`,
    );
    console.log(
      `  Players: ${room.slot1.game.player}, ${room.slot2.game.player}`,
    );

    return room;
  }

  findActiveRoom(username, twoPlayerMode) {
    const room = this.rooms.find((r) => {
      return r.isActiveRoom(username, twoPlayerMode);
    });
    return room;
  }

  cleanup() {
    for (const room of this.rooms) {
      if (!room.isRunning()) {
        const index = this.rooms.indexOf(room);
        if (index !== -1) {
          this.rooms.splice(index, 1);
        }
      }
    }
  }
}

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

    let game = null;
    if (primaryPlayer) {
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

    socket.emit("running-status", room.isRunning() ? "running" : "not-started");
  });

  socket.on("start", () => {
    if (room) {
      room.start(username);
      socket.emit(
        "running-status",
        room.isRunning() ? "running" : "not-started",
      );
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
      socket.emit(
        "running-status",
        room.isRunning() ? "running" : "not-started",
      );
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
  });

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
        "INSERT INTO scores (username, score, durationMs, date) VALUES (?, ?, ?, ?)",
      ).run(game.player, game.score, game.durationMs, new Date().toISOString());
    }

    // remove from rooms array if both complete
    rooms.cleanup();

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
