// About.test.jsx

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import About from "../components/About.jsx";

// text constants =============================================================
const ABOUT_TITLE = "About";
const ABOUT_WATERMARK = "Tayte Waterman 2026";

const TETRIS_URL = "https://tetris.fandom.com/wiki/History";
const GITHUB_URL = "https://github.com/watermanpdx/CS565-Final-Project";

// shared functions ===========================================================

// tests ======================================================================
describe("about ", () => {
  it(`should display "${ABOUT_TITLE}" in the title`, () => {
    // Arrange
    render(<About show={true} setShow={() => {}} />);

    // Act (none)

    // Assert
    expect(
      screen.getByText(ABOUT_TITLE, { selector: ".modal-title b" }),
    ).toBeInTheDocument();
  });

  it(`should display "${ABOUT_WATERMARK}" as a watermark in the footer`, () => {
    // Arrange
    render(<About show={true} setShow={() => {}} />);

    // Act (none)

    // Assert
    expect(
      screen.getByText(ABOUT_WATERMARK, { selector: ".modal-footer" }),
    ).toBeInTheDocument();
  });

  it(`should contain a link to the Tetris fan-page [${TETRIS_URL}]`, () => {
    // Arrange
    render(<About show={true} setShow={() => {}} />);

    // Act (none)
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => {
      return link.getAttribute("href");
    });

    // Assert
    expect(hrefs).toContain(TETRIS_URL);
  });

  it(`should contain a link to the project GitHub page [${GITHUB_URL}]`, () => {
    // Arrange
    render(<About show={true} setShow={() => {}} />);

    // Act (none)
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => {
      return link.getAttribute("href");
    });

    // Assert
    expect(hrefs).toContain(GITHUB_URL);
  });
});
