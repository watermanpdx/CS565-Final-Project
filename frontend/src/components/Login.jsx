import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

import { useState, useEffect } from "react";

export default function Login({
  show,
  setShow,
  usernameParent,
  setUsernameParent,
}) {
  const [view, setView] = useState("login");
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [dismissable, setDismissable] = useState(false);

  useEffect(() => {
    if (usernameParent) {
      setDismissable(true);
    }
  }, [usernameParent]);

  const handleClose = () => {
    if (dismissable || username) {
      setShow(false);
      setView("login");
    } else {
      setToastMessage("User log-in required");
      setToast(true);
    }
  };

  const changeView = (view) => {
    setUsername("");
    setPassword("");
    setPasswordCheck("");
    setView(view);
  };

  const handleLogin = async () => {
    const post = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const res = await post.json();

    if (res.success && res.username) {
      // successful login
      setUsernameParent(res.username);
      handleClose();
    } else {
      setToastMessage("Username or password incorrect");
      setToast(true);
    }
  };

  const handleAccountUpdate = async (url) => {
    if (!username || username === "") {
      setToastMessage("Please enter a username");
      setToast(true);
      return false;
    }
    if (
      !password ||
      password === "" ||
      !passwordCheck ||
      passwordCheck === ""
    ) {
      setToastMessage("Please complete password fields");
      setToast(true);
      return false;
    }

    if (password === passwordCheck) {
      const post = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const { success } = await post.json();
      if (success) {
        setView("login");
        return true;
      }
    } else {
      setToastMessage("Passwords do not match");
      setToast(true);
      return false;
    }

    // Defaul failure message
    setToastMessage("Account update failed. Please retry");
    setToast(true);
    return false;
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        data-bs-theme="dark"
      >
        {view === "login" && (
          <EnterPassword
            show={show}
            handleClose={handleClose}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
            changeView={changeView}
          />
        )}
        {view === "new" && (
          <UpdateAccount
            title={"New Account"}
            setUsername={setUsername}
            setPassword1={setPassword}
            setPassword2={setPasswordCheck}
            handleAccountUpdate={() => handleAccountUpdate("/new-account")}
            changeView={changeView}
          />
        )}
        {view === "reset" && (
          <UpdateAccount
            title={"Reset Password"}
            setUsername={setUsername}
            setPassword1={setPassword}
            setPassword2={setPasswordCheck}
            handleAccountUpdate={() => handleAccountUpdate("/password-reset")}
            changeView={changeView}
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

function EnterPassword({
  handleClose,
  setUsername,
  setPassword,
  handleLogin,
  changeView,
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
        <Button variant="secondary" onClick={() => changeView("new")}>
          New Account
        </Button>
        <Button variant="secondary" onClick={() => changeView("reset")}>
          Reset Password
        </Button>
        <Button variant="primary" onClick={handleLogin}>
          Log In
        </Button>
      </Modal.Footer>
    </>
  );
}

function UpdateAccount({
  title,
  setUsername,
  setPassword1,
  setPassword2,
  handleAccountUpdate,
  changeView,
}) {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
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
        <Button variant="secondary" onClick={() => changeView("login")}>
          Back
        </Button>
        <Button variant="primary" onClick={handleAccountUpdate}>
          Save
        </Button>
      </Modal.Footer>
    </>
  );
}
