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

let games = [];

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
  let game = null;

  console.log(`Connected to socket.id: ${socket.id}`);

  socket.on("username", (data) => {
    const username = data.username;
    console.log(`Connected to user: ${username}`);
    game = games.find((g) => {
      return g.player === username;
    });
    if (game) {
      // game exists, reattach and update socket reference
      game.onUpdate((g) => {
        onUpdate(g, socket);
      });
      game.onEnd((g) => {
        onEnd(g, socket);
      });

      socket.emit("render", game.currentState);
      socket.emit("running-status", game.isRunning());
    } else {
      // create new game
      game = new Tetris(
        (onStartHandle = null),
        (onUpdateHandle = (g) => {
          onUpdate(g, socket);
        }),
        (onEndHandle = (g) => {
          onEnd(g, socket);
        }),
        (player = username),
      );
      games.push(game);
    }
  });

  socket.on("start", () => {
    if (game) {
      game.init();
      game.run();
      socket.emit("running-status", game.isRunning());
    }
  });

  socket.on("reset", () => {
    if (game) {
      // stop game, teardown
      game.stop();
      const username = game.player;
      const index = games.indexOf(game);
      if (index !== -1) {
        games.splice(index, 1);
      }

      // create new game
      game = new Tetris(
        (onStartHandle = null),
        (onUpdateHandle = (g) => {
          onUpdate(g, socket);
        }),
        (onEndHandle = (g) => {
          onEnd(g, socket);
        }),
        (player = username),
      );
      games.push(game);

      socket.emit("render", game.currentState);
      socket.emit("running-status", game.isRunning());
    }
  });

  socket.on("moveLeft", () => {
    if (game) {
      game.moveLeft();
    }
  });

  socket.on("moveRight", () => {
    if (game) {
      game.moveRight();
    }
  });

  socket.on("moveDown", () => {
    if (game) {
      game.moveDown();
    }
  });

  socket.on("rotateLeft", () => {
    if (game) {
      game.rotateLeft();
    }
  });

  socket.on("rotateRight", () => {
    if (game) {
      game.rotateRight();
    }
  });
});

function onUpdate(game, socket) {
  socket.emit("render", game.currentState);
}

function onEnd(game, socket) {
  // save score
  if (game.player && game.score > 0) {
    db.prepare(
      "INSERT INTO scores (username, score, durationMs, date) VALUES (?, ?, ?, ?)",
    ).run(game.player, game.score, game.durationMs, new Date().toISOString());
  }

  // remove from games array
  const index = games.indexOf(game);
  if (index !== -1) {
    games.splice(index, 1);
  }

  // inform frontend of state
  socket.emit("running-status", game.isRunning());
}

io.on("disconnect", () => {});

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
