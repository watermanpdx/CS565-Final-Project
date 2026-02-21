// tetris.js

// Global constants -----------------------------------------------------------
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const NEXT_WIDTH = 4;
const NEXT_HEIGHT = 4;
const GAME_PERIOD = 20; // ms
const START_SPEED = 30; // ticks per drop. Higher = slower
const SCORE_MULTIPLIER = [0, 40, 100, 300, 1200];
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

// Callbacks class ------------------------------------------------------------
class CallbackList {
  constructor(context) {
    this.context = context;
    this.callHandles = [];
  }

  attach(handle) {
    this.callHandles.push(handle);
  }

  remove(handle) {
    const index = this.callHandles.indexOf(handle);
    if (index !== -1) {
      this.callHandles.splice(index, 1);
    }
  }

  call() {
    for (const handle of this.callHandles) {
      if (handle) {
        handle(this.context);
      }
    }
  }
}

// Block (base) class ---------------------------------------------------------
class Block {
  constructor(
    environment,
    blockType,
    size,
    shapes,
    initPosition = [0, 0],
    nextPosition = [0, 0],
  ) {
    this.env = environment;
    this.blockType = blockType;
    this.size = size;
    this.shapes = shapes;
    this.shapesIndex = 0;
    this.x = initPosition[0];
    this.y = initPosition[1];
    this.nextX = nextPosition[0];
    this.nextY = nextPosition[1];

    this.miniGrid = this.drawMiniGrid();
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

  drawMiniGrid() {
    const grid = Array(NEXT_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(NEXT_WIDTH).fill(0);
      });
    const shape = this.shapes[0];
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (
          shape[j][i] > 0 &&
          this.nextY + j >= 0 &&
          this.nextY + j < GRID_HEIGHT &&
          this.nextX + i >= 0 &&
          this.nextX + i < GRID_WIDTH
        ) {
          grid[this.nextY + j][this.nextX + i] = this.blockType;
        }
      }
    }

    return grid;
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
    super(environment, BLOCK_ENUM.SQUARE_BLOCK, 2, shapes, [4, 0], [1, 1]);
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
    super(environment, BLOCK_ENUM.LINE_BLOCK, 4, shapes, [3, -2], [0, 0]);
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
    super(environment, BLOCK_ENUM.S_BLOCK, 3, shapes, [3, -1], [0, 0]);
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
    super(environment, BLOCK_ENUM.Z_BLOCK, 3, shapes, [3, -1], [0, 0]);
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
    super(environment, BLOCK_ENUM.L_BLOCK, 3, shapes, [3, -1], [0, 0]);
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
    super(environment, BLOCK_ENUM.J_BLOCK, 3, shapes, [3, -1], [0, 0]);
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
    super(environment, BLOCK_ENUM.T_BLOCK, 3, shapes, [3, -1], [0, 0]);
  }
}

// Core game class ------------------------------------------------------------
const BLOCKS = [SquareBlock, LineBlock, SBlock, ZBlock, LBlock, JBlock, TBlock];
class Tetris {
  constructor(player = null) {
    this.player = player;

    this.onStartHandles = new CallbackList(this);
    this.onUpdateHandles = new CallbackList(this);
    this.onEndHandles = new CallbackList(this);

    this.block = null;
    this.nextBlock = null;

    this.speed = START_SPEED;
    this.speedTick = 0;

    this.level = 0;
    this.score = 0;
    this.durationMs = 0;
    this.gameOver = false;

    this.grid = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => {
        return Array(GRID_WIDTH).fill(0);
      });

    this.blankState = {
      grid: this.grid,
      score: this.score,
      next: Array(NEXT_HEIGHT)
        .fill(null)
        .map(() => {
          return Array(NEXT_WIDTH).fill(0);
        }),
      gameOver: this.gameOver,
    };

    this.init();
  }

  init() {
    this.stop();

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

    this.level = 0;
    this.score = 0;
    this.durationMs = 0;
    this.gameOver = false;

    this.currentState = {
      grid: this.grid,
      score: this.score,
      next: this.nextBlock.miniGrid,
      gameOver: this.gameOver,
    };

    this.onUpdateHandles.call();

    return this.currentState;
  }

  getRandomBlock() {
    let i = Math.floor(Math.random() * BLOCKS.length);
    return new BLOCKS[i](this);
  }

  moveLeft() {
    if (this.isRunning) {
      this.block.moveLeft();
    }
  }

  moveRight() {
    if (this.isRunning) {
      this.block.moveRight();
    }
  }

  moveDown() {
    if (this.isRunning) {
      this.block.moveDown();
    }
  }

  rotateLeft() {
    if (this.isRunning) {
      this.block.rotateLeft();
    }
  }

  rotateRight() {
    if (this.isRunning) {
      this.block.rotateRight();
    }
  }

  update() {
    let grid = this.grid;

    if (!this.gameOver) {
      // drop block (gravity)
      let landed = false;
      this.speedTick += 1;
      if (this.speedTick >= this.speed) {
        landed = !this.block.moveDown();
        this.speedTick = 0;
      }

      // calculate new screen
      grid = this.block.draw();

      // check if block landed. If so, store "base" screen and generate new block
      if (landed) {
        this.grid = grid;
        this.block = this.nextBlock;
        this.nextBlock = this.getRandomBlock();

        this.clearLines();

        // check game-over (block "landed" and colliding)
        if (this.block.checkCollision()) {
          // draw last colliding block (so user sees what happened)
          grid = this.block.draw();
          this.grid = grid;

          this.gameOver = true;
        }
      }
    }

    // return full game state
    this.currentState = {
      grid: grid,
      next: this.nextBlock.miniGrid,
      score: this.score,
      gameOver: this.gameOver,
    };

    this.onUpdateHandles.call();

    return this.currentState;
  }

  clearLines() {
    let count = 0;

    // check for completed lines
    for (let j = 0; j < GRID_HEIGHT; j++) {
      let complete = true;
      for (let i = 0; i < GRID_WIDTH; i++) {
        if (this.grid[j][i] <= 0) {
          complete = false;
          break;
        }
      }

      // if complete clear and increment count
      if (complete) {
        count += 1;
        this.grid.splice(j, 1);
        this.grid.unshift(Array(GRID_WIDTH).fill(0));
      }
    }

    // update score
    if (count < 5) {
      this.score += SCORE_MULTIPLIER[count] * (this.level + 1);
    }
  }

  isRunning() {
    return this.running;
  }

  run() {
    this.onStartHandles.call();
    this.startTime = Date.now();

    this.running = true;
    this.interval = setInterval(() => {
      const state = this.update();

      if (state.gameOver) {
        this.stop();
      }
    }, GAME_PERIOD);
  }

  stop() {
    if (this.running) {
      clearInterval(this.interval);
      this.running = false;
      this.durationMs = Date.now() - this.startTime;

      this.onEndHandles.call();
    }
  }

  attachOnStart(handle) {
    this.onStartHandles.attach(handle);
  }

  removeOnStart(handle) {
    this.onStartHandles.remove(handles);
  }

  attachOnUpdate(handle) {
    this.onUpdateHandles.attach(handle);
  }

  removeOnUpdate(handle) {
    this.onUpdateHandles.remove(handle);
  }

  attachOnEnd(handle) {
    this.onEndHandles.attach(handle);
  }

  removeOnEnd(handle) {
    this.onEndHandles.remove(handle);
  }
}

// export for use in other files
module.exports = Tetris;
