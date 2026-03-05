// NavigationBar.jsx

import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

import HowToPlay from "../components/HowToPlay.jsx";
import About from "../components/About.jsx";
import Login from "../components/Login.jsx";

import logo from "../assets/logo.png";

import { useState, useEffect } from "react";

export default function NavigationBar({
  username,
  setUsername,
  setView,
  setGameFocus,
}) {
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(username === null);

  useEffect(() => {
    setGameFocus(!(showHowTo || showAbout || showLogin));
  }, [showHowTo, showAbout, showLogin, setGameFocus]);

  return (
    <>
      <Navbar expand="md" className="bg-body-tertiary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img src={logo} height="30" width="30" alt="tetris logo" />{" "}
            Multi-Player Tetris
          </Navbar.Brand>
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
                High-Scores
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  setShowAbout(true);
                }}
              >
                About
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <NavDropdown
                title={username ? username : "username"}
                id="basic-nav-dropdown"
                align="end"
              >
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

      <HowToPlay show={showHowTo} setShow={setShowHowTo} />
      <About show={showAbout} setShow={setShowAbout} />
      <Login
        show={showLogin}
        setShow={setShowLogin}
        usernameParent={username}
        setUsernameParent={setUsername}
      />
    </>
  );
}
