import "bootstrap/dist/css/bootstrap.min.css";
import "./Tetris.css";

import { useState, useEffect } from "react";
import { socket } from "../socket";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export default function Tetris({
  username,
  primaryPlayer = true,
  twoPlayerMode = false,
  focus,
}) {
  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;
  const [grid, setGrid] = useState(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(GRID_WIDTH).fill(0);
      }),
  );

  const NEXT_WIDTH = 4;
  const NEXT_HEIGHT = 4;
  const [nextBlock, setNextBlock] = useState(
    Array(NEXT_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(NEXT_WIDTH).fill(0);
      }),
  );

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState("not-started");
  const [displayName, setDisplayName] = useState(null);

  const BLOCK_TYPES = [
    "block-none",
    "square-block",
    "line-block",
    "s-block",
    "z-block",
    "l-block",
    "j-block",
    "t-block",
  ];

  // handle socket.io communication
  useEffect(() => {
    if (username) {
      socket.emit("game-connect", {
        username: username,
        primaryPlayer: primaryPlayer,
        twoPlayerMode: twoPlayerMode,
      });
    }

    function onConnect() {
      console.log(`Connected to socket.id: ${socket.id}`);
    }

    function onPlayer(data) {
      const { primary, secondary } = data;
      console.log(primary, secondary);
      if (primaryPlayer) {
        setDisplayName(primary);
      } else {
        setDisplayName(secondary);
      }
    }

    function renderGrid(data) {
      setGrid(data.grid);
      setScore(data.score);
      setNextBlock(data.next);
      setGameOver(data.gameOver);
    }

    function onRunning(value) {
      setRunning(value);
    }

    socket.on("connect", onConnect);
    socket.on("player-update", onPlayer);
    socket.on("running-status", onRunning);
    if (primaryPlayer) {
      socket.on("render-primary", renderGrid);
    } else {
      socket.on("render-secondary", renderGrid);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("player-update", onPlayer);
      socket.off("running-status", onRunning);
      socket.off("render-primary", renderGrid);
      socket.off("render-secondary", renderGrid);
    };
  }, [username, primaryPlayer, twoPlayerMode]);

  // handle user input
  useEffect(() => {
    const handleEvent = (event) => {
      event.preventDefault();
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          socket.emit("moveLeft");
          break;

        case "ArrowRight":
        case "d":
          socket.emit("moveRight");
          break;

        case "ArrowDown":
        case "s":
          socket.emit("moveDown");
          break;

        case " ":
        case "e":
          socket.emit("rotateRight");
          break;

        case "q":
          socket.emit("rotateLeft");
          break;

        default:
          break;
      }
    };

    // check focus first; else event-handlers override inputs elsewhere
    if (focus && primaryPlayer) {
      window.addEventListener("keydown", handleEvent);
      return () => {
        window.removeEventListener("keydown", handleEvent);
      };
    }
  }, [primaryPlayer, focus]);

  const handleStart = () => {
    socket.emit("start");
  };

  return (
    <>
      <Card className="game-window">
        <p className="player-info">
          Player-{primaryPlayer ? "1" : "2"}: {displayName}
        </p>
        <Card.Body className="game-body">
          <BlockZone
            className="play-window"
            grid={grid}
            BLOCK_TYPES={BLOCK_TYPES}
          />
          <div className="side-bar">
            <BlockZone grid={nextBlock} BLOCK_TYPES={BLOCK_TYPES} />
            <ScoreBoard score={score} />
            <GameOver gameOver={gameOver} />
          </div>
        </Card.Body>
      </Card>
      {primaryPlayer && !(twoPlayerMode && running === "running") && (
        <Card className="game-controls mt-3">
          {running === "not-started" && (
            <Button variant="primary" onClick={handleStart}>
              Start
            </Button>
          )}
          {running === "running" && (
            <Button variant="secondary" onClick={handleStart}>
              Restart
            </Button>
          )}
        </Card>
      )}
    </>
  );
}

function BlockZone({ className, grid, BLOCK_TYPES }) {
  return (
    <div className={`game-col ${className}`}>
      {grid.map((row, i) => (
        <div key={i} className="game-row">
          {row.map((typeIndex, j) => (
            <div
              key={j}
              className={`game-cell ${BLOCK_TYPES[typeIndex]}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ScoreBoard({ score }) {
  return (
    <>
      <div className="score-board">{score}</div>
      <p className="score-label">
        <b>SCORE</b>
      </p>
    </>
  );
}

function GameOver({ gameOver }) {
  let response = "";
  if (gameOver) {
    response = "GAME OVER";
  }

  return (
    <div className="game-over">
      <b>{response}</b>
    </div>
  );
}
