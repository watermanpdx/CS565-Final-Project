import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { useState, useEffect } from "react";

import { BACKEND_URL } from "../config.js";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch(`${BACKEND_URL}/scores`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
              <h4>High-Scores</h4>
            </Card>
            <Card className="leaderboard-card mt-2 mb-3 border-0">
              <div className="d-flex align-items-end justify-content-start px-4 py-1">
                <span style={{ width: "100px" }}>Rank</span>
                <span style={{ width: "100px" }}>Player</span>
                <span style={{ width: "100px" }}>Score</span>
                <span style={{ width: "100px" }}>Duration</span>
                <span>Date</span>
              </div>
            </Card>
            {scores.map((score, i) => (
              <Card key={score.id} className="leaderboard-card mt-2 border-0">
                <div className="d-flex align-items-end justify-content-start px-4 py-1">
                  <span style={{ width: "100px" }}>{i + 1}</span>
                  <span style={{ width: "100px" }}>{score.username}</span>
                  <span style={{ width: "100px" }}>{score.score}</span>
                  <span style={{ width: "100px" }}>
                    {(score.durationMs / 1000).toFixed(1)} sec
                  </span>
                  <span>
                    {new Date(score.date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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

export function MiniLeaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch(`${BACKEND_URL}/scores?maxEntries=3`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setScores(data);
    }

    getScores();
  }, []);

  return (
    <>
      <div className="h-50" data-bs-theme="dark">
        <Card className="d-flex align-items-center justify-content-center p-1 border-0">
          <h4>Leaderboard</h4>
        </Card>
        <Card className="leaderboard-card mt-2 mb-3 border-0">
          <div className="d-flex align-items-center justify-content-start px-4 py-1">
            <span style={{ width: "75px" }}>Rank</span>
            <span style={{ width: "125px" }}>Player</span>
            <span style={{ width: "125px" }}>Score</span>
          </div>
        </Card>
        {scores.map((score, i) => (
          <Card key={score.id} className="leaderboard-card mt-2 border-0">
            <div className="d-flex align-items-center justify-content-start px-4 py-1">
              <span style={{ width: "75px" }}>{i + 1}</span>
              <span style={{ width: "125px" }}>{score.username}</span>
              <span style={{ width: "125px" }}>{score.score}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
