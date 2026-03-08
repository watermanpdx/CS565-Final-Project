// server.js

const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.BACKEND_PORT || 3001;

const { Pool } = require("pg");

const { Server } = require("socket.io");
const io = new Server(server);

const Rooms = require("./rooms.js");
const rooms = new Rooms();
const MAX_SCORE_ENTRIES = 10000;

// Database (setup) -----------------------------------------------------------
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function initDB() {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
  `);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    durationMs INTEGER,
    date TIMESTAMPTZ,
    UNIQUE(username, score, durationMs)
  )  
  `);
}
initDB();

// Socket.IO communication ----------------------------------------------------
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

  async function onEnd(game) {
    // save score
    if (game.player && game.score > 0) {
      await pool.query(
        "INSERT INTO scores (username, score, durationMs, date) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
        [game.player, game.score, game.durationMs, new Date().toISOString()],
      );
    }

    // clean up rooms and handles
    rooms.cleanup();
    game.removeOnEnd(onEnd);

    // inform frontend of state
    socket.emit("running-status", game.isRunning() ? "running" : "not-started");
  }
});

// REST and routing -----------------------------------------------------------
app.use(express.json());

app.get("/scores", async (req, res) => {
  const maxEntries = req.query.maxEntries
    ? req.query.maxEntries
    : MAX_SCORE_ENTRIES;
  try {
    const data = await pool.query(
      "SELECT * FROM scores ORDER BY score DESC LIMIT $1",
      [maxEntries],
    );
    const scores = data.rows;
    res.status(200);
    res.json(scores);
  } catch (e) {
    console.log("score retreival failure", e.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const record = data.rows[0];

    if (record && password === record.password) {
      // successful login
      res.json({ success: true, username: username });
      return;
    } else {
      // unsuccessful login
      res.json({ success: false, username: null });
      return;
    }
  } catch (e) {
    console.log("login failure", e.message);
    res.json({ success: false, username: null });
    return;
  }
});

app.post("/new-account", async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      password,
    ]);

    res.json({ success: true });
    return;
  } catch (e) {
    console.log("account creation failure", e.message);
    res.json({ success: false });
    return;
  }
});

app.post("/password-reset", async (req, res) => {
  const { username, password } = req.body;

  try {
    await pool.query("UPDATE users SET password = $1 WHERE username = $2", [
      username,
      password,
    ]);

    res.json({ success: true });
    return;
  } catch (e) {
    console.log("password-reset failure", e.message);
    res.json({ success: false });
    return;
  }
});

// Start server ---------------------------------------------------------------
app.use(express.static(path.join(__dirname, "../../frontend/build")));
app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
