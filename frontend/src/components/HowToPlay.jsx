// HowToPlay.jsx

import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";

export default function HowToPlay({ show, setShow }) {
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
