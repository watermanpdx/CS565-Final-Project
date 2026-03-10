// Leaderboard.jsx

/*
These components are responsible for rendering player scores to the "High-Scores"
page and the "mini" leaderboard on the "Home" page

Leaderboard.jsx is dependent on leaderboard content-specific styling in
Leaderboard.css
*/

// dependencies ---------------------------------------------------------------
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Leaderboard.css';

import { useState, useEffect } from 'react';

// Leaderboard definition (default export) ------------------------------------
export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch('/scores', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setScores(data);
    }

    getScores();
  }, []);

  return (
    <>
      <Container className="leaderboard-container" data-bs-theme="dark">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="d-flex align-items-center justify-content-center mt-3 p-1 border-0">
              <h4 className="leaderboard-title">High-Scores</h4>
            </Card>
            <Card className="leaderboard-header leaderboard-card mt-2 mb-3 border-0">
              <div className="d-flex align-items-end justify-content-start px-4 py-1">
                <span className="leaderboard-entry">Rank</span>
                <span className="leaderboard-entry">Player</span>
                <span className="leaderboard-entry">Score</span>
                <span className="leaderboard-entry">Duration</span>
                <span>Date</span>
              </div>
            </Card>
            {scores.map((score, i) => (
              <Card
                key={score.id}
                className="leaderboard-item leaderboard-card mt-2 border-0"
              >
                <div className="d-flex align-items-end justify-content-start px-4 py-1">
                  <span className="leaderboard-entry">{i + 1}</span>
                  <span className="leaderboard-entry">{score.username}</span>
                  <span className="leaderboard-entry">{score.score}</span>
                  <span className="leaderboard-entry">
                    {(Number(score.durationms) / 1000).toFixed(1)} sec
                  </span>
                  <span>
                    {new Date(score.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    </>
  );
}

// MiniLeaderboard definition (must be explicitly included) -------------------
export function MiniLeaderboard({ newScoreFlag }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch('/scores?maxEntries=3', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setScores(data);
    }

    getScores();
  }, [newScoreFlag]);

  return (
    <>
      <div data-bs-theme="dark">
        <Card className="d-flex align-items-center justify-content-center p-1 border-0">
          <h4 className="leaderboard-title">Leaderboard</h4>
        </Card>
        <Card className="leaderboard-header leaderboard-card mt-2 mb-3 border-0">
          <div className="d-flex align-items-center justify-content-start px-4 py-1">
            <span className="mini-leaderboard-rank">Rank</span>
            <span className="mini-leaderboard-entry">Player</span>
            <span className="mini-leaderboard-entry">Score</span>
          </div>
        </Card>
        {scores.map((score, i) => (
          <Card
            key={score.id}
            className="leaderboard-item leaderboard-card mt-2 border-0"
          >
            <div className="d-flex align-items-center justify-content-start px-4 py-1">
              <span className="mini-leaderboard-rank">{i + 1}</span>
              <span className="mini-leaderboard-entry">{score.username}</span>
              <span className="mini-leaderboard-entry">{score.score}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
