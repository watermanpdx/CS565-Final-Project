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

let rooms = [];

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

/*
TODO
create "rooms" instead of username for controlling refresh
make it an object that has one or more games
update the tetris handlers to have multiple callbacks
add explicit callback removal on disconnect
*/

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

    room = rooms.find((r) => {
      if (!twoPlayerMode) {
        return r.slot1.game && r.slot1.game.player === username;
      } else {
        return (
          (r.slot1.game && r.slot1.game.player === username) ||
          (r.slot2.game && r.slot2.game.player === username)
        );
      }
    });
    if (room) {
      game =
        room.slot1.game.player === username ? room.slot1.game : room.slot2.game;
    }

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
        room = addToRooms(rooms, game);
      }
    }

    for (const r of rooms) {
      console.log(r.twoPlayerMode, !!r.slot1.game, !r.slot2.game);
    }
  });

  socket.on("start", () => {
    if (game && room) {
      if (primaryPlayer) {
        room.slot1.ready = true;
      } else {
        room.slot2.ready = true;
      }

      // only start
      if (readyToStart(room)) {
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
    if (game && readyToRemove(room)) {
      // stop game, teardown
      game.stop();
      cleanupRooms(rooms, game);

      // create new game
      game = new Tetris(username);

      // find available room or add to new one
      room = addToRooms(rooms, game);

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
    cleanupRooms(rooms, game);

    // inform frontend of state
    socket.emit("running-status", game.isRunning() ? "running" : "not-started");
  }

  function readyToStart(room) {
    // ready to start if either one-player mode, or both players ready
    if (room) {
      return !room.twoPlayerMode || (room.slot1.ready && room.slot2.ready);
    } else {
    }
  }

  function readyToRemove(room) {
    // ready to start if either one-player mode, only one game present, or both games finished
    if (room) {
      return (
        !room.twoPlayerMode ||
        !room.slot1.game ||
        !room.slot2.game ||
        (!room.slot1.game.isRunning() && !room.slot2.game.isRunning())
      );
    } else {
      return false;
    }
  }

  function addToRooms(rooms, game, twoPlayerMode) {
    let room = rooms.find((r) => {
      return r.slot2.game === null;
    });
    if (room) {
      room.slot2.game = game;
      room.slot2.ready = false;
    } else {
      room = {
        twoPlayerMode: twoPlayerMode,
        slot1: {
          game: game,
          ready: false,
        },
        slot2: {
          game: null,
          ready: false,
        },
      };
      rooms.push(room);
    }
    return room;
  }

  function cleanupRooms(rooms, game) {
    const room = rooms.find((r) => {
      return r.slot1.game === game || r.slot2.game === game;
    });
    if (readyToRemove(room)) {
      const index = rooms.indexOf(room);
      if (index !== -1) {
        rooms.splice(index, 1);
      }
    }
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
