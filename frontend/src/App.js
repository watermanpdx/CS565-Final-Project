import { useState, useEffect } from "react";
import { socket } from "./socket";
import "./App.css";
import "./Tetris.css";

function App() {
  return (
    <div>
      <GameWindow />
    </div>
  );
}

function GameWindow() {
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
    function onConnect() {
      console.log("connected!");
    }

    function renderGrid(data) {
      setGrid(data.grid);

      if (score !== data.score) {
        setScore(data.score);
      }

      if (nextBlock !== data.next) {
        setNextBlock(data.next);
      }
    }

    socket.on("connect", onConnect);
    socket.on("render", renderGrid);

    return () => {
      socket.off("connect", onConnect);
      socket.off("render", renderGrid);
    };
  }, []);

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

    window.addEventListener("keydown", handleEvent);
    return () => {
      window.removeEventListener("keydown", handleEvent);
    };
  }, []);

  return (
    <>
      <div className="game-window">
        <BlockZone grid={grid} BLOCK_TYPES={BLOCK_TYPES} />
        <div>
          <BlockZone grid={nextBlock} BLOCK_TYPES={BLOCK_TYPES} />
          <ScoreBoard score={score} />
        </div>
      </div>
    </>
  );
}

function BlockZone({ grid, BLOCK_TYPES }) {
  return (
    <div className="game-grid">
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
  return <div className="score-board">Score: {score}</div>;
}

export default App;
