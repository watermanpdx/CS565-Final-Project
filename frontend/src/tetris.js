// tetris.js

// Global constants -----------------------------------------------------------
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const START_SPEED = 35; // ticks per drop. Higher = slower
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

  rotateRight() {
    this.shapesIndex = (this.shapesIndex + 1) % this.shapes.length;
    if (this.checkCollision()) {
      this.shapesIndex =
        (this.shapesIndex - 1 + this.shapes.length) % this.shapes.length;
      return false;
    }
    return true;
  }

  rotateLeft() {
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

// Derived, (specific) block classes ------------------------------------------
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

class LineBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ];
    super(environment, BLOCK_ENUM.LINE_BLOCK, 4, shapes, [3, -2]);
  }
}

class SBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ];
    super(environment, BLOCK_ENUM.S_BLOCK, 3, shapes, [3, -1]);
  }
}

class ZBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    ];
    super(environment, BLOCK_ENUM.Z_BLOCK, 3, shapes, [3, -1]);
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
        [0, 0, 0],
        [0, 0, 1],
        [1, 1, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
    ];
    super(environment, BLOCK_ENUM.L_BLOCK, 3, shapes, [3, -1]);
  }
}

class JBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ];
    super(environment, BLOCK_ENUM.J_BLOCK, 3, shapes, [3, -1]);
  }
}

class TBlock extends Block {
  constructor(environment) {
    const shapes = [
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ];
    super(environment, BLOCK_ENUM.T_BLOCK, 3, shapes, [3, -1]);
  }
}

// Core game class ------------------------------------------------------------
const BLOCKS = [SquareBlock, LineBlock, SBlock, ZBlock, LBlock, JBlock, TBlock];
class Tetris {
  constructor() {}

  init() {
    // construct and zero board
    this.grid = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(GRID_WIDTH).fill(0);
      });

    // choose random block and next block
    this.block = this.getRandomBlock();
    this.nextBlock = this.getRandomBlock();

    this.speed = START_SPEED;
    this.speedTick = 0;
    this.score = 0;

    return this.grid;
  }

  getRandomBlock() {
    let i = Math.floor(Math.random() * BLOCKS.length);
    return new BLOCKS[i](this);
  }

  moveLeft() {
    this.block.moveLeft();
  }

  moveRight() {
    this.block.moveRight();
  }

  moveDown() {
    this.block.moveDown();
  }

  rotateLeft() {
    this.block.rotateLeft();
  }

  rotateRight() {
    this.block.rotateRight();
  }

  update() {
    // drop block (gravity)
    this.speedTick += 1;
    let landed = false;
    if (this.speedTick >= this.speed) {
      landed = !this.block.moveDown();
      this.speedTick = 0;
    }

    // calculate new screen
    let grid = this.block.draw();

    // check if block landed. If so, store "base" screen and generate new block
    if (landed) {
      this.grid = grid;
      this.block = this.nextBlock;
      this.nextBlock = this.getRandomBlock();

      // check game-over
      if (this.block.checkCollision()) {
      }
    }

    return grid;
  }
}

// export for use in other files
module.exports = Tetris;
