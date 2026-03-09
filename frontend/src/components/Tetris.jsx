// Tetris.jsx

/*
This component is responsible for rendering the Tetris game. It is closely
aligned with the backend tetris.js, however where tetris.js is responsible
for game states and execution, Tetris.jsx is only responsible for rendering
game graphics and communitating user input to the server.

Tetris.jsx is dependent on Tetris-game specific stylings in Tetris.css
*/

// dependencies ---------------------------------------------------------------
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import './Tetris.css';

import { useState, useEffect } from 'react';
import { socket } from '../socket';

// constants ------------------------------------------------------------------
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const NEXT_WIDTH = 4;
const NEXT_HEIGHT = 4;

const BLOCK_TYPES = [
  'block-none',
  'square-block',
  'line-block',
  's-block',
  'z-block',
  'l-block',
  'j-block',
  't-block',
];

// Tetris definition (default export) -----------------------------------------
export default function Tetris({
  username,
  primaryPlayer,
  twoPlayerMode,
  focus,
  setNewScoreFlag,
  onSetup,
}) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState('not-started');
  const [displayName, setDisplayName] = useState(null);

  const [grid, setGrid] = useState(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(GRID_WIDTH).fill(0);
      }),
  );

  const [nextBlock, setNextBlock] = useState(
    Array(NEXT_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(NEXT_WIDTH).fill(0);
      }),
  );

  useEffect(() => {
    if (gameOver && setNewScoreFlag) {
      setNewScoreFlag(true);
    } else if (setNewScoreFlag) {
      setNewScoreFlag(false);
    }
  }, [gameOver, setNewScoreFlag]);

  useEffect(() => {
    setRunning('not-started');
  }, [twoPlayerMode]);

  // handle socket.io communication
  useEffect(() => {
    if (username) {
      socket.emit('game-connect', {
        username: username,
        primaryPlayer: primaryPlayer,
        twoPlayerMode: twoPlayerMode,
      });
      if (onSetup) {
        onSetup();
      }
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

    socket.on('connect', onConnect);
    socket.on('player-update', onPlayer);
    socket.on('running-status', onRunning);
    if (primaryPlayer) {
      socket.on('render-primary', renderGrid);
    } else {
      socket.on('render-secondary', renderGrid);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('player-update', onPlayer);
      socket.off('running-status', onRunning);
      socket.off('render-primary', renderGrid);
      socket.off('render-secondary', renderGrid);
    };
  }, [username, primaryPlayer, twoPlayerMode]);

  // handle user input
  useEffect(() => {
    const handleEvent = (event) => {
      event.preventDefault();
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          socket.emit('moveLeft');
          break;

        case 'ArrowRight':
        case 'd':
          socket.emit('moveRight');
          break;

        case 'ArrowDown':
        case 's':
          socket.emit('moveDown');
          break;

        case ' ':
        case 'e':
          socket.emit('rotateRight');
          break;

        case 'q':
          socket.emit('rotateLeft');
          break;

        default:
          break;
      }
    };

    // check focus first; else event-handlers override inputs elsewhere
    if (focus && primaryPlayer) {
      window.addEventListener('keydown', handleEvent);
      return () => {
        window.removeEventListener('keydown', handleEvent);
      };
    }
  }, [primaryPlayer, focus]);

  const handleStart = () => {
    socket.emit('start');
  };

  return (
    <>
      <Card className="game-window">
        <p className="player-info d-flex justify-content-between pe-3">
          <span>Player-{primaryPlayer ? '1' : '2'}</span>
          <span>{displayName}</span>
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
      {primaryPlayer && !(twoPlayerMode && running === 'running') && (
        <Card className="game-controls mt-3 border-0">
          {running === 'not-started' && (
            <Button variant="primary" onClick={handleStart}>
              Start
            </Button>
          )}
          {running === 'running' && (
            <Button variant="secondary" onClick={handleStart}>
              Restart
            </Button>
          )}
        </Card>
      )}
    </>
  );
}

// BlockZone sub-component ----------------------------------------------------
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

// ScoreBoard sub-component ---------------------------------------------------
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

// GameOver sub-component -----------------------------------------------------
function GameOver({ gameOver }) {
  let response = '';
  if (gameOver) {
    response = 'GAME OVER';
  }

  return (
    <div className="game-over">
      <b>{response}</b>
    </div>
  );
}
