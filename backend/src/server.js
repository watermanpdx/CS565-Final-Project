// server.js

/*
This file contains the main backend server code for the multi-player web-page.
It is responsible for serving the frontend (React-built) assets, hosting tetris
instances (communicating via socket.io), and forwarding database information
via REST to the frontend
*/

// dependencies ---------------------------------------------------------------
const path = require('path');
const http = require('http');
const express = require('express');

const { Pool } = require('pg');
const { Server } = require('socket.io');
const Rooms = require('./rooms.js');

// shared server/address information ------------------------------------------
const app = express();
const server = http.createServer(app);
const port = process.env.BACKEND_PORT || 80;

// Database (setup) -----------------------------------------------------------
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
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
const io = new Server(server);
// rooms entities for game sessions management
const rooms = new Rooms();
const MAX_SCORE_ENTRIES = 10000;

io.on('connection', (socket) => {
  // shared connection variables
  let room = null;
  let primaryGame = null;
  let secondaryGame = null;
  let username = null;

  console.log(`Connected to socket.id: ${socket.id}`);

  // new game connect event from frontend
  socket.on('game-connect', (data) => {
    // init/re-init game variables
    username = data.username;
    const primaryPlayer = data.primaryPlayer;
    const twoPlayerMode = data.twoPlayerMode;

    console.log(
      `Connecting ${twoPlayerMode ? '2-player' : '1-player'} game for: ${username}`,
    );

    // connect to a room
    room = rooms.joinRoom(username, twoPlayerMode);
    room.attachOnRunning(onRunning);

    // refresh running state to frontend
    socket.emit('running-status', room.isRunning() ? 'running' : 'not-started');

    // detect primary and secondary game connections and setup accordingly
    if (primaryPlayer) {
      room.attachOnPlayer(onPlayer);
      onPlayer(room);

      primaryGame = room.getPrimaryGame(username);
      primaryGame.attachOnUpdate(onUpdate);
      primaryGame.attachOnEnd(onEnd);

      socket.emit('render-primary', primaryGame.currentState);
    } else {
      secondaryGame = room.getSecondaryGame(username);
      secondaryGame.attachOnUpdate(onUpdate);
      secondaryGame.attachOnEnd(onEnd);

      socket.emit('render-secondary', secondaryGame.currentState);
    }
  });

  // start the game
  socket.on('start', () => {
    if (room) {
      room.start(username);
    }
  });

  // reset the current room/game
  socket.on('reset', () => {
    if (room) {
      room.stop();

      if (primaryGame) {
        socket.emit('render-primary', primaryGame.currentState);
      }
      if (secondaryGame) {
        socket.emit('render-secondary', secondaryGame.currentState);
      }
    }
  });

  // game-control event: left
  socket.on('moveLeft', () => {
    if (primaryGame) {
      primaryGame.moveLeft();
    }
  });

  // game-control event: right
  socket.on('moveRight', () => {
    if (primaryGame) {
      primaryGame.moveRight();
    }
  });

  // game-control event: down
  socket.on('moveDown', () => {
    if (primaryGame) {
      primaryGame.moveDown();
    }
  });

  // game-control event: rotate-left
  socket.on('rotateLeft', () => {
    if (primaryGame) {
      primaryGame.rotateLeft();
    }
  });

  // game-control event: rotate-right
  socket.on('rotateRight', () => {
    if (primaryGame) {
      primaryGame.rotateRight();
    }
  });

  // socket.io disconnection
  socket.on('disconnect', () => {
    cleanupCallbacks();
  });

  // disconnect callbacks
  function cleanupCallbacks() {
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
  }

  // communicate player status of current room
  function onPlayer() {
    if (room) {
      socket.emit('player-update', {
        primary: room.getPrimaryGame(username)
          ? room.getPrimaryGame(username).player
          : null,
        secondary: room.getSecondaryGame(username)
          ? room.getSecondaryGame(username).player
          : null,
      });
    }
  }

  // communicate running status
  function onRunning() {
    if (room) {
      socket.emit(
        'running-status',
        room.isRunning() ? 'running' : 'not-started',
      );
    }
  }

  // send render information to frontend on game update
  function onUpdate(game) {
    if (primaryGame) {
      socket.emit('render-primary', primaryGame.currentState);
    }
    if (secondaryGame) {
      socket.emit('render-secondary', secondaryGame.currentState);
    }
  }

  // save results (score) to database at game end
  async function onEnd(game) {
    // save score
    if (game.player && game.score > 0) {
      await pool.query(
        'INSERT INTO scores (username, score, durationMs, date) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [game.player, game.score, game.durationMs, new Date().toISOString()],
      );
    }

    // clean up rooms and handles
    rooms.cleanup();
    game.removeOnEnd(onEnd);

    // inform frontend of state
    socket.emit('running-status', game.isRunning() ? 'running' : 'not-started');
  }
});

// REST and routing -----------------------------------------------------------
app.use(express.json());

// return scores information from the database
app.get('/scores', async (req, res) => {
  const maxEntries = req.query.maxEntries
    ? req.query.maxEntries
    : MAX_SCORE_ENTRIES;
  try {
    const data = await pool.query(
      'SELECT * FROM scores ORDER BY score DESC LIMIT $1',
      [maxEntries],
    );
    const scores = data.rows;
    res.status(200);
    res.json(scores);
  } catch (e) {
    console.log('score retreival failure', e.message);
  }
});

// assess user login (username + password)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await pool.query('SELECT * FROM users WHERE username = $1', [
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
    console.log('login failure', e.message);
    res.json({ success: false, username: null });
    return;
  }
});

// add new account to database
app.post('/new-account', async (req, res) => {
  const { username, password } = req.body;
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      username,
      password,
    ]);

    res.json({ success: true });
    return;
  } catch (e) {
    console.log('account creation failure', e.message);
    res.json({ success: false });
    return;
  }
});

// update account with new password
app.post('/password-reset', async (req, res) => {
  const { username, password } = req.body;

  try {
    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [
      username,
      password,
    ]);

    res.json({ success: true });
    return;
  } catch (e) {
    console.log('password-reset failure', e.message);
    res.json({ success: false });
    return;
  }
});

// Start server ---------------------------------------------------------------
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
