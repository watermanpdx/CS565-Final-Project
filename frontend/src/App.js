import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Tetris from "./Tetris.js";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import { useState } from "react";
import Modal from "react-bootstrap/Modal";

export default function App() {
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleCloseHowTo = () => setShowHowTo(false);
  const handleShowHowTo = () => setShowHowTo(true);
  const handleCloseAbout = () => setShowAbout(false);
  const handleShowAbout = () => setShowAbout(true);

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">Multi-Player Tetris</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link onClick={handleShowHowTo}>How-to-Play</Nav.Link>
              <Nav.Link>Leaderboard</Nav.Link>
              <Nav.Link onClick={handleShowAbout}>About</Nav.Link>
            </Nav>
            <HowToPlayModal show={showHowTo} handleClose={handleCloseHowTo} />
            <AboutModal show={showAbout} handleClose={handleCloseAbout} />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Tetris />
    </>
  );
}

function HowToPlayModal({ show, handleClose }) {
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

function AboutModal({ show, handleClose }) {
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
