import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Tetris from "./Tetris.js";
import AccountModal from "./Login.js";

import { useState, useEffect } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";

const URL = "http://localhost:3001";

export default function App() {
  const [view, setView] = useState("home");
  const [username, setUsername] = useState("username");
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Prevent game from overtaking keyboard for modals
  // TODO narrow focus to prevent other effects
  const gameFocus = !(showHowTo || showAbout || showLogin);

  return (
    <>
      <Navbar expand="md" className="bg-body-tertiary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">Multi-Player Tetris</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                onClick={() => {
                  setView("home");
                }}
              >
                Home
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  setShowHowTo(true);
                }}
              >
                How-To-Play
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  setView("leaderboard");
                }}
              >
                Leaderboard
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  setShowAbout(true);
                }}
              >
                About
              </Nav.Link>

              <NavDropdown title={username} id="basic-nav-dropdown">
                <NavDropdown.Item
                  onClick={() => {
                    setShowLogin(true);
                  }}
                >
                  Change Account
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <HowToPlayModal show={showHowTo} setShow={setShowHowTo} />
      <AboutModal show={showAbout} setShow={setShowAbout} />
      <AccountModal
        show={showLogin}
        setShow={setShowLogin}
        setUsernameParent={setUsername}
      />

      {view === "home" && (
        <Container className="main-contents-container m-3">
          <Row>
            <Col lg={3} className="d-none d-lg-block">
              <MiniLeaderboard />
            </Col>
            <Col xs={8} md={4} lg={3}>
              <Tetris playerInfo={`Player 1: ${username}`} focus={gameFocus} />
            </Col>
            <Col md={4} lg={3} className="d-none d-md-block">
              <Tetris playerInfo="Player 2: username" focus={false} />
            </Col>
          </Row>
        </Container>
      )}
      {view === "leaderboard" && <Leaderboard />}
    </>
  );
}

function MiniLeaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch(`${URL}/scores?maxEntries=3`, {
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

function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function getScores() {
      const res = await fetch(`${URL}/scores`, {
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

function HowToPlayModal({ show, setShow }) {
  const handleClose = () => setShow(false);
  return (
    <>
      <Modal show={show} onHide={handleClose} data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>
            <b>How To Play</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Controls</h4>
          <ul>
            <li>
              <b>Move Left</b> - A, Left-Arrow
            </li>
            <li>
              <b>Move Right</b> - D, Right-Arrow
            </li>
            <li>
              <b>Move Down</b> - S, Down-Arrow
            </li>
            <li>
              <b>Rotate Left</b> - Q
            </li>
            <li>
              <b>Rotate Right</b> - E, Space-Bar
            </li>
          </ul>
          <h4>Scoring</h4>
          <ul>
            <li>
              <b>1 Row </b> - 40
            </li>
            <li>
              <b>2 Rows</b> - 100
            </li>
            <li>
              <b>3 Rows</b> - 300
            </li>
            <li>
              <b>4 Rows</b> - 1200
            </li>
          </ul>
        </Modal.Body>
      </Modal>
    </>
  );
}

function AboutModal({ show, setShow }) {
  const handleClose = () => setShow(false);
  return (
    <>
      <Modal show={show} onHide={handleClose} data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>
            <b>About</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The following project implements a browser-based, multi-player
            variant of the globally beloved{" "}
            <a href="https://tetris.fandom.com/wiki/History">TETRIS</a>!
          </p>
          <p>
            This implementation is built as a project to explore and demonstrate
            full-stack web technologies as part of the Portland State
            University, CS565 - Full Stack Web-Development course. Source-code
            and implementation details can be found in the{" "}
            <a href="https://github.com/watermanpdx/CS565-Final-Project">
              source GitHub repository
            </a>
            .
          </p>
        </Modal.Body>
        <Modal.Footer>Tayte Waterman 2026</Modal.Footer>
      </Modal>
    </>
  );
}
