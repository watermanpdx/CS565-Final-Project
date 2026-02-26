# CS565-Final-Project

## About

The following repository contains the implementation and documentation for the Portland State University CS565 final project. It implements a browser-based multi-player [TETRIS](https://en.wikipedia.org/wiki/Tetris) game, in which two players are able to compete against one-another in real-time. It is used to explore and demonstrate frontend and backend web technologies.

A journal of the design process, decisions, and major commits/branches is retained within this codebase in [`docs/journal.md`](./docs/journal.md)

### Author

Tayte Waterman
[watermanpdx](https://github.com/watermanpdx), [TayticusPrime](https://github.com/watermanpdx)
[Portland State University](https://www.pdx.edu/) (Student)
CS656 - Full Stack Web Development
Winter 2026

## Usage

See [How to Run](#how-to-run) for how to launch the application.

### Login

On initial page-load, the user will be prompted to log-in. Log-in is mandatory in order to manage player scores.

### 1-Player Mode

1. Select "1-Player" mode on the main-page.
2. Click the "Start" button below the game-area to begin playing.
3. Use the keyboard to control the Tetris game. Controls informatoin can be found in the "How to Play" link in the navigation banner.
4. On game-end (assuming non-zero score) the player username and score can be seen in the "Leaderboard" page, or in the main-page summary if in the top high-scores.

### 2-Player Mode

1. Select "2-Player" mode on the main-page.
2. Click the "Start" button below the game-area to start a game. It will not start until a second player is available.
3. In another tab, reopen web-page [http://localhost:3000](http://localhost:3000) and log-in.
4. Repleat steps 1 and 2 from the new tab.
5. A 2-player game will start in real-time for both participants.
6. On game-end (both players) the player username and score will be added to the "Leaderboard" page, or in the main-page summary if in the top high-scores.

## How to Run

Note: The following describes how to run the current state of the codebase. It utilizes the React development server for hosting the front-end. In future revisions the frontend contents will be fully served by the backend, however in the current state this is not yet supported.

Both the frontend and backend applications must be launched independently (at this time).

### Backend

1. Install dependencies

```bash
cd backend
npm install
```

2. Run

```bash
node src/server.js
```

3. Expected output

```bash
$ node src/server.js
Server running at http://localhost:3001
```

### Frontend

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run

```bash
npm start
```

3. Expected output

```bash
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://<your ip>:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```
