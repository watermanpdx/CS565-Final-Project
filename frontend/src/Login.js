import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const URL = "http://localhost:3001";

export default function AccountModal({ show, setShow, setUsernameParent }) {
  const [view, setView] = useState("login");
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const handleClose = () => setShow(false);

  const handleLogin = async () => {
    const post = await fetch(`${URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const res = await post.json();

    console.log(res.success, res.username);
    if (res.success && res.username) {
      // successful login
      setUsernameParent(res.username);
      handleClose();
    } else {
      setToastMessage("Username or password incorrect");
      setToast(true);
    }
  };

  const handleNewAccount = async () => {
    if (password === passwordCheck) {
      const post = await fetch(`${URL}/new-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const { success } = await post.json();
      if (success) {
        setView("login");
      } else {
        setToastMessage("Account registration failed. Please retry");
        setToast(true);
      }
    } else {
      setToastMessage("Passwords do not match");
      setToast(true);
    }
  };

  const handleUpdatePassword = async () => {
    if (password === passwordCheck) {
      const post = await fetch(`${URL}/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const { success } = await post.json();
      if (success) {
        setView("login");
      } else {
        setToastMessage("Password update failed. Please retry");
        setToast(true);
      }
    } else {
      setToastMessage("Passwords do not match");
      setToast(true);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} data-bs-theme="dark">
        {view === "login" && (
          <Login
            show={show}
            handleClose={handleClose}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
            setView={setView}
          />
        )}
        {view === "new" && (
          <NewAccount
            show={show}
            handleClose={handleClose}
            setUsername={setUsername}
            setPassword1={setPassword}
            setPassword2={setPasswordCheck}
            handleNewAccount={handleNewAccount}
            setView={setView}
          />
        )}
        {view === "reset" && (
          <ResetPassword
            show={show}
            handleClose={handleClose}
            setUsername={setUsername}
            setPassword1={setPassword}
            setPassword2={setPasswordCheck}
            handleUpdatePassword={handleUpdatePassword}
            setView={setView}
          />
        )}
      </Modal>

      <ToastContainer
        className="p-3"
        position={"top-center"}
        style={{ zIndex: 9999 }}
      >
        <Toast
          onClose={() => setToast(false)}
          show={toast}
          delay={2000}
          autohide
          className="bg-light text-black border-0"
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

function Login({
  show,
  handleClose,
  setUsername,
  setPassword,
  handleLogin,
  setView,
}) {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Log In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => setView("new")}>
          New Account
        </Button>
        <Button variant="secondary" onClick={() => setView("reset")}>
          Reset Password
        </Button>
        <Button variant="primary" onClick={handleLogin}>
          Log In
        </Button>
      </Modal.Footer>
    </>
  );
}

function NewAccount({
  show,
  handleClose,
  setUsername,
  setPassword1,
  setPassword2,
  handleNewAccount,
  setView,
}) {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword1(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Control
              type="password"
              placeholder="Re-enter password"
              onChange={(e) => setPassword2(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setView("login")}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNewAccount}>
          Save
        </Button>
      </Modal.Footer>
    </>
  );
}

function ResetPassword({
  show,
  handleClose,
  setPassword1,
  setPassword2,
  handleUpdatePassword,
  setView,
}) {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword1(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Control
              type="password"
              placeholder="Re-enter password"
              onChange={(e) => setPassword2(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setView("login")}>
          Back
        </Button>
        <Button variant="primary" onClick={handleUpdatePassword}>
          Update
        </Button>
      </Modal.Footer>
    </>
  );
}
