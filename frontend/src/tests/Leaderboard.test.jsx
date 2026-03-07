// Leaderboard.test.jsx

import "@testing-library/jest-dom";

import { render, screen, waitFor, act } from "@testing-library/react";

import Leaderboard, { MiniLeaderboard } from "../components/Leaderboard.jsx";

// constants ==================================================================
const LEADERBOARD_TITLE = "High-Scores";
const LEADERBOARD_HEADER_CONTENTS = [
  "Rank",
  "Player",
  "Score",
  "Duration",
  "Date",
];

const MINI_LEADERBOARD_TITLE = "Leaderboard";
const MINI_LEADERBOARD_HEADER_CONTENTS = ["Rank", "Player", "Score"];

const mockScores = [
  {
    id: 1,
    username: "player 1",
    score: 1000,
    durationMs: 10000,
    date: "2026-03-07T14:30:00Z",
  },
  {
    id: 2,
    username: "player 2",
    score: 500,
    durationMs: 5000,
    date: "2026-03-01T09:15:00Z",
  },
  {
    id: 3,
    username: "player 3",
    score: 250,
    durationMs: 500,
    date: "2026-03-06T20:45:00Z",
  },
  {
    id: 4,
    username: "player 4",
    score: 100,
    durationMs: 200,
    date: "2026-02-21T18:27:00Z",
  },
];

// shared functions ===========================================================
const setBackendResponse = (data) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(data),
    }),
  );
};

// tests ======================================================================
// leaderboard ----------------------------------------------------------------
describe("leaderboard", () => {
  beforeEach(() => {
    setBackendResponse([]);
  });

  it(`should display "${LEADERBOARD_TITLE}" in the title`, async () => {
    // Arrange
    await act(async () => {
      render(<Leaderboard />);
    });

    // Act (none)

    // Assert
    expect(
      screen.getByText(LEADERBOARD_TITLE, { selector: ".leaderboard-title" }),
    ).toBeInTheDocument();
  });

  it(`should display ${LEADERBOARD_HEADER_CONTENTS} in the header`, async () => {
    // Arrange
    await act(async () => {
      render(<Leaderboard />);
    });

    // Act (none)

    // Assert
    for (let column of LEADERBOARD_HEADER_CONTENTS) {
      expect(screen.getByText(column)).toBeInTheDocument();
    }
  });

  it("an element should contain an entry for each column", async () => {
    // Arrange
    setBackendResponse(mockScores);
    const { container } = render(<Leaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const item = container.querySelector(".leaderboard-item");
      const fields = item.querySelectorAll("span");
      expect(fields).toHaveLength(LEADERBOARD_HEADER_CONTENTS.length);
    });
  });

  it("should display all elements in backend response", async () => {
    // Arrange
    setBackendResponse(mockScores);
    const { container } = render(<Leaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const entries = container.querySelectorAll(".leaderboard-item");
      expect(entries).toHaveLength(mockScores.length);
    });
  });

  it("should display no elements if none in data", async () => {
    // Arrange
    const { container } = render(<Leaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const entries = container.querySelectorAll(".leaderboard-item");
      expect(entries).toHaveLength(0);
    });
  });
});

// mini-leaderboard -----------------------------------------------------------
describe("mini leaderboard", () => {
  beforeEach(() => {
    setBackendResponse([]);
  });

  it(`should display "${MINI_LEADERBOARD_TITLE}" in the title`, async () => {
    // Arrange
    await act(async () => {
      render(<MiniLeaderboard />);
    });

    // Act (none)

    // Assert
    expect(
      screen.getByText(MINI_LEADERBOARD_TITLE, {
        selector: ".leaderboard-title",
      }),
    ).toBeInTheDocument();
  });

  it(`should display ${MINI_LEADERBOARD_HEADER_CONTENTS} in the header`, async () => {
    // Arrange
    await act(async () => {
      render(<MiniLeaderboard />);
    });

    // Act (none)

    // Assert
    for (let column of MINI_LEADERBOARD_HEADER_CONTENTS) {
      expect(screen.getByText(column)).toBeInTheDocument();
    }
  });

  it("an element should contain an entry for each column", async () => {
    // Arrange
    setBackendResponse(mockScores);
    const { container } = render(<MiniLeaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const item = container.querySelector(".leaderboard-item");
      const fields = item.querySelectorAll("span");
      expect(fields).toHaveLength(MINI_LEADERBOARD_HEADER_CONTENTS.length);
    });
  });

  it("should display all elements in backend response", async () => {
    // Arrange
    setBackendResponse(mockScores);
    const { container } = render(<MiniLeaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const entries = container.querySelectorAll(".leaderboard-item");
      expect(entries).toHaveLength(mockScores.length);
    });
  });

  it("should display no elements if none in data", async () => {
    // Arrange
    const { container } = render(<MiniLeaderboard />);

    // Act (none)

    // Assert
    await waitFor(() => {
      const entries = container.querySelectorAll(".leaderboard-item");
      expect(entries).toHaveLength(0);
    });
  });
});
