// tetris.js

// Global constants -----------------------------------------------------------
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_ENUM = {
  NONE: 0,
  SQUARE_BLOCK: 1,
  LINE_BLOCK: 2,
  S_BLOCK: 3,
  Z_BLOCK: 4,
  L_BLOCK: 5,
  J_BLOCK: 6,
  T_BLOCK: 7,
};

// Block (base) class ---------------------------------------------------------
class Block {
  constructor(environment, blockType, size, shapes, initPosition = [0, 0]) {
    this.env = environment;
    this.blockType = blockType;
    this.size = size;
    this.shapes = shapes;
    this.shapesIndex = 0;
    this.x = initPosition[0];
    this.y = initPosition[1];
  }

  draw() {
    const gridCopy = this.env.grid.map((row) => [...row]);
    const shape = this.shapes[this.shapesIndex];
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (
          shape[j][i] > 0 &&
          this.y + j >= 0 &&
          this.y + j < GRID_HEIGHT &&
          this.x + i >= 0 &&
          this.x + i < GRID_WIDTH
        ) {
          gridCopy[this.y + j][this.x + i] = this.blockType;
        }
      }
    }
    return gridCopy;
  }

  rotateClockwise() {
    this.shapesIndex = (this.shapesIndex + 1) % this.shapes.length;
    console.log(this.shapesIndex);
    if (this.checkCollision()) {
      this.shapesIndex =
        (this.shapesIndex - 1 + this.shapes.length) % this.shapes.length;
      return false;
    }
    return true;
  }

  rotateCounterClockwise() {
    this.shapesIndex =
      (this.shapesIndex - 1 + this.shapes.length) % this.shapes.length;
    if (this.checkCollision()) {
      this.shapesIndex = (this.shapesIndex + 1) % this.shapes.length;
      return false;
    }
    return true;
  }

  moveLeft() {
    this.x -= 1;
    if (this.checkCollision()) {
      this.x += 1;
      return false;
    }
    return true;
  }

  moveRight() {
    this.x += 1;
    if (this.checkCollision()) {
      this.x -= 1;
      return false;
    }
    return true;
  }

  moveDown() {
    this.y += 1;
    if (this.checkCollision()) {
      this.y -= 1;
      return false;
    }
    return true;
  }

  checkCollision() {
    let shape = this.shapes[this.shapesIndex];
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (
          shape[j][i] > 0 &&
          (this.y + j < 0 ||
            this.y + j >= GRID_HEIGHT ||
            this.x + i < 0 ||
            this.x + i >= GRID_WIDTH ||
            this.env.grid[this.y + j][this.x + i] > BLOCK_ENUM.NONE)
        ) {
          return true;
        }
      }
    }
    return false;
  }
}

// Derived, specific block classes --------------------------------------------
class SquareBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [1, 1],
        [1, 1],
      ],
    ];
    super(environment, BLOCK_ENUM.SQUARE_BLOCK, 2, shapes, [4, 0]);
  }
}
class LBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
    ];
    super(environment, BLOCK_ENUM.L_BLOCK, 3, shapes, [4, -1]);
  }
}

class Tetris {
  constructor() {
    this.grid = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(GRID_WIDTH).fill(0);
      });
    this.block = new LBlock(this, 0, 0);
    this.render();
  }

  update() {}

  render() {
    let grid = this.block.draw();

    for (let j = 0; j < GRID_HEIGHT; j++) {
      let string = "";
      for (let i = 0; i < GRID_WIDTH; i++) {
        string += `${grid[j][i]} `;
      }
      console.log(string);
    }
  }
}

module.exports = Tetris;
