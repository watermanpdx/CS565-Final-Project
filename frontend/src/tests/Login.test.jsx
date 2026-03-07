// Login.test.jsx

import "@testing-library/jest-dom";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import Login from "../components/Login.jsx";

// text constants =============================================================
const LOGIN_TITLE = "Log In";
const NEW_ACCOUNT_TITLE = "New Account";
const RESET_PASSWORD_TITLE = "Reset Password";

const USERNAME_INPUT = "Enter username";
const PASSWORD_INPUT = "Enter password";
const PASSWORD_VERIFICATION_INPUT = "Re-enter password";

const LOGIN_BUTTON = "Log In";
const NEW_ACCOUNT_BUTTON = "New Account";
const RESET_PASSWORD_BUTTON = "Reset Password";
const CANCEL_BUTTON = "Cancel";
const BACK_BUTTON = "Back";
const SAVE_BUTTON = "Save";

const LOGIN_REQUIRED_TOAST = "User log-in required";
const LOGIN_FAILURE_TOAST = "Username or password incorrect";

const UPDATE_MISSING_USERNAME_TOAST = "Please enter a username";
const UPDATE_PASSWORD_MISSING_TOAST = "Please complete password fields";
const UPDATE_PASSWORD_MISMATCH_TOAST = "Passwords do not match";
const UPDATE_FAILURE_TOAST = "Account update failed. Please retry";

// shared functions ===========================================================
const setShow = jest.fn();

const setBackendSuccessResponse = async (success) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ success: success, username: "user" }),
    }),
  );
};

const renderLogin = (usernameParent = "user") => {
  render(
    <Login
      show={true}
      setShow={setShow}
      usernameParent={usernameParent}
      setUsernameParent={() => {}}
      username=""
      password=""
      passwordCheck=""
    />,
  );
};

const renderNewAccount = () => {
  renderLogin();
  fireEvent.click(screen.getByRole("button", { name: NEW_ACCOUNT_BUTTON }));
};

const renderPasswordReset = () => {
  renderLogin();
  fireEvent.click(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON }));
};

// tests ======================================================================
// login menu -----------------------------------------------------------------
describe("log-in menu", () => {
  describe("contents", () => {
    it(`should display "${LOGIN_TITLE}" in the title`, () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(
        screen.getByText(LOGIN_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
    });

    it("should have a username input field", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(USERNAME_INPUT)).toBeInTheDocument();
    });

    test("should have a password input field", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(PASSWORD_INPUT)).toBeInTheDocument();
    });

    it("should have a log-in button", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: LOGIN_BUTTON }),
      ).toBeInTheDocument();
    });

    it("should have a reset-password button", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: RESET_PASSWORD_BUTTON }),
      ).toBeInTheDocument();
    });

    it("should have a new-account button", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: NEW_ACCOUNT_BUTTON }),
      ).toBeInTheDocument();
    });

    it("should have a cancel button", () => {
      // Arrange
      renderLogin();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: CANCEL_BUTTON }),
      ).toBeInTheDocument();
    });
  });

  describe("functionality", () => {
    it("should dismiss if there is a valid user on cancel", () => {
      // Arrange
      renderLogin();

      // Act
      fireEvent.click(screen.getByRole("button", { name: CANCEL_BUTTON }));

      // Assert
      expect(setShow).toHaveBeenCalledWith(false);
    });

    it("should alert if there is an invalid user on cancel", async () => {
      // Arrange
      renderLogin(null);

      // Act
      fireEvent.click(screen.getByRole("button", { name: CANCEL_BUTTON }));

      // Assert
      expect(await screen.findByText(LOGIN_REQUIRED_TOAST)).toBeInTheDocument();
    });

    it("should dismiss with a successful login", async () => {
      // Arrange
      renderLogin();
      setBackendSuccessResponse(true);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.click(screen.getByRole("button", { name: LOGIN_BUTTON }));

      // Assert
      await waitFor(() => expect(setShow).toHaveBeenCalledWith(false));
    });

    it("should alert if login failure", async () => {
      // Arrange
      renderLogin();
      setBackendSuccessResponse(false);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.click(screen.getByRole("button", { name: LOGIN_BUTTON }));

      // Assert
      expect(await screen.findByText(LOGIN_FAILURE_TOAST)).toBeInTheDocument();
    });
  });
});

// new-account menu -----------------------------------------------------------
describe("new-account menu", () => {
  describe("contents", () => {
    it(`should display "${NEW_ACCOUNT_TITLE}" in the title`, () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(
        screen.getByText(NEW_ACCOUNT_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
    });

    it("should have a username input field", () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(USERNAME_INPUT)).toBeInTheDocument();
    });

    it("should have a primary password input field", () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(PASSWORD_INPUT)).toBeInTheDocument();
    });

    it("should have a secondary password input field", () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
      ).toBeInTheDocument();
    });

    it("should have a save button", () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: SAVE_BUTTON }),
      ).toBeInTheDocument();
    });

    it("should have a cancel button", () => {
      // Arrange
      renderNewAccount();

      // Act (none)

      // Assert
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });
  });

  describe("functionality", () => {
    it("should return to login after back", () => {
      // Arrange
      renderNewAccount();

      // Act (and assert. ensure that transistion actually happened first)
      expect(
        screen.getByText(NEW_ACCOUNT_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: BACK_BUTTON }));

      // Assert
      expect(
        screen.getByText(LOGIN_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
    });

    it("should return to login screen if update successful", async () => {
      // Arrange
      renderNewAccount();
      setBackendSuccessResponse(true);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "password" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      await waitFor(() =>
        expect(
          screen.getByText(LOGIN_TITLE, { selector: ".modal-title" }),
        ).toBeInTheDocument(),
      );
    });

    it("should alert if username is missin", async () => {
      // Arrange
      renderNewAccount();

      // Act
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_MISSING_USERNAME_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if password missing", async () => {
      // Arrange
      renderNewAccount();

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_PASSWORD_MISSING_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if passwords dont match", async () => {
      // Arrange
      renderNewAccount();

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "passwort" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_PASSWORD_MISMATCH_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if backend negative response", async () => {
      // Arrange
      renderNewAccount();
      setBackendSuccessResponse(false);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "password" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(await screen.findByText(UPDATE_FAILURE_TOAST)).toBeInTheDocument();
    });
  });
});

// reset-password menu --------------------------------------------------------
describe("reset-password menu", () => {
  describe("contents", () => {
    it(`should display "${RESET_PASSWORD_TITLE}" in the title`, () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(
        screen.getByText(RESET_PASSWORD_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
    });

    it("should have a username input field", () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(USERNAME_INPUT)).toBeInTheDocument();
    });

    it("should have a primary password input field", () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(screen.getByPlaceholderText(PASSWORD_INPUT)).toBeInTheDocument();
    });

    it("should have a secondary password input field", () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
      ).toBeInTheDocument();
    });

    it("should have a save button", () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(
        screen.getByRole("button", { name: SAVE_BUTTON }),
      ).toBeInTheDocument();
    });

    it("should have a cancel button", () => {
      // Arrange
      renderPasswordReset();

      // Act (none)

      // Assert
      expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    });
  });

  describe("functionality", () => {
    it("should return to login after back", () => {
      // Arrange
      renderPasswordReset();

      // Act (and assert. ensure that transistion actually happened first)
      expect(
        screen.getByText(RESET_PASSWORD_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: BACK_BUTTON }));

      // Assert
      expect(
        screen.getByText(LOGIN_TITLE, { selector: ".modal-title" }),
      ).toBeInTheDocument();
    });

    it("should return to login screen if update successful", async () => {
      // Arrange
      renderPasswordReset();
      setBackendSuccessResponse(true);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "password" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      await waitFor(() =>
        expect(
          screen.getByText(LOGIN_TITLE, { selector: ".modal-title" }),
        ).toBeInTheDocument(),
      );
    });

    it("should alert if username is missin", async () => {
      // Arrange
      renderPasswordReset();

      // Act
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_MISSING_USERNAME_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if password missing", async () => {
      // Arrange
      renderPasswordReset();

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_PASSWORD_MISSING_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if passwords dont match", async () => {
      // Arrange
      renderPasswordReset();

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "passwort" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(
        await screen.findByText(UPDATE_PASSWORD_MISMATCH_TOAST),
      ).toBeInTheDocument();
    });

    it("should alert if backend negative response", async () => {
      // Arrange
      renderPasswordReset();
      setBackendSuccessResponse(false);

      // Act
      fireEvent.change(screen.getByPlaceholderText(USERNAME_INPUT), {
        target: { value: "user" },
      });
      fireEvent.change(screen.getByPlaceholderText(PASSWORD_INPUT), {
        target: { value: "password" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(PASSWORD_VERIFICATION_INPUT),
        {
          target: { value: "password" },
        },
      );
      fireEvent.click(screen.getByRole("button", { name: SAVE_BUTTON }));

      // Assert
      expect(await screen.findByText(UPDATE_FAILURE_TOAST)).toBeInTheDocument();
    });
  });
});
