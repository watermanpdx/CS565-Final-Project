import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

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
      <Container className="leaderboard-container">
        <h3>Leaderboard</h3>
        {scores.map((score) => (
          <Card key={score.id} className="leaderboard-card mb-2">
            <Card.Body className="d-flex align-items-center justify-content-start">
              <p className="mb-0">
                {score.score}, {score.username},{" "}
                {(score.durationMs / 1000).toFixed(1)} sec,{" "}
                {new Date(score.date).toString()}
              </p>
            </Card.Body>
          </Card>
        ))}
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
      <Container className="leaderboard-container">
        <h3>Leaderboard</h3>
        {scores.map((score) => (
          <Card key={score.id} className="leaderboard-card mb-2">
            <Card.Body className="d-flex align-items-center justify-content-start">
              <p className="mb-0">
                {score.score} {score.username}
              </p>
            </Card.Body>
          </Card>
        ))}
      </Container>
    </>
  );
}
