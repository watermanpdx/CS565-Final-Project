// Home.jsx
/*
This component is responsible for the "Home" page of the website.
It is responsible for rendering the "mini" leaderboard, Tetris
game(s) and managing start/stop and 1/2-player game modes
*/

// dependencies ---------------------------------------------------------------
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import Tetris from '../components/Tetris.jsx';
import { MiniLeaderboard } from '../components/Leaderboard.jsx';

import { socket } from '../socket';
import { useState, useEffect } from 'react';

// Home definition (default export) -------------------------------------------
export default function Home({ username, gameFocus }) {
  const [mode, setMode] = useState(
    sessionStorage.getItem('mode') || '1-player',
  );
  const [newScoreFlag, setNewScoreFlag] = useState(false);

  useEffect(() => {
    console.log(newScoreFlag);
  }, [newScoreFlag]);

  useEffect(() => {
    sessionStorage.setItem('mode', mode);
  }, [mode]);

  const togglePlayerMode = () => {
    if (mode === '1-player') {
      setMode('2-player');
      socket.emit('reset');
    } else if (mode === '2-player') {
      setMode('1-player');
      socket.emit('reset');
    }
  };

  return (
    <>
      <Container className="main-contents-container m-3">
        <Row>
          <Col lg={3} className="d-none d-lg-block">
            <MiniLeaderboard newScoreFlag={newScoreFlag} />
            {mode === '1-player' && (
              <Button
                className="w-100 mt-3"
                variant="primary"
                onClick={togglePlayerMode}
              >
                2-Player Mode
              </Button>
            )}
            {mode !== '1-player' && (
              <Button
                className="w-100 mt-3"
                variant="secondary"
                onClick={togglePlayerMode}
              >
                1-Player Mode
              </Button>
            )}
          </Col>
          <Col xs={8} md={4} lg={3}>
            <Tetris
              username={username}
              twoPlayerMode={mode === '2-player'}
              primaryPlayer={true}
              focus={gameFocus}
              setNewScoreFlag={setNewScoreFlag}
            />
          </Col>
          {mode === '2-player' && (
            <Col md={4} lg={3} className="d-none d-md-block">
              <Tetris
                username={username}
                twoPlayerMode={mode === '2-player'}
                primaryPlayer={false}
                focus={false}
              />
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}
