import { useState, useEffect } from "react";
import "./App.css";
import "./Tetris.css";
const Tetris = require("./tetris.js");

function App() {
  return (
    <div>
      <GameWindow />
    </div>
  );
}

function GameWindow() {
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

  const game = new Tetris();
  const [grid, setGrid] = useState(game.init());
  const [score, setScore] = useState(0);
  const [nextBlock, setNextBlock] = useState();

  // handle user input
  useEffect(() => {
    const handleEvent = (event) => {
      event.preventDefault();
      switch (event.key) {
        case "ArrowLeft":
          game.moveLeft();
          break;

        case "ArrowRight":
          game.moveRight();
          break;

        case "ArrowDown":
          game.moveDown();
          break;

        case " ":
          game.rotateRight();
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

  // (temporary) call game update()
  useEffect(() => {
    setInterval(() => {
      setGrid(game.update());
    }, 20);
  }, []);

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

export default App;
