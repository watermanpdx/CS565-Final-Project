// About.jsx

/*
This component is responsible for the "About" modal which contains general
information about the project and Tetris.
*/

// dependencies ---------------------------------------------------------------
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

// About definition (default export) ------------------------------------------
export default function About({ show, setShow }) {
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
            variant of the globally beloved{' '}
            <a href="https://tetris.fandom.com/wiki/History">TETRIS</a>!
          </p>
          <p>
            This implementation is built as a project to explore and demonstrate
            full-stack web technologies as part of the Portland State
            University, CS565 - Full Stack Web-Development course. Source-code
            and implementation details can be found in the{' '}
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
