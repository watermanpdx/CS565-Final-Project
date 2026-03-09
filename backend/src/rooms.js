// rooms.js

/*
This file is responsible for defining Room objects used to contain and manage
1-player and 2-player tetris games. Players can be added to and use the room
objects to view and play against other players.
*/

// dependencies ---------------------------------------------------------------
const CallbackList = require('./utilities.js');
const Tetris = require('./tetris.js');

// functions ------------------------------------------------------------------
const generateId = function generateRandomId(maxValue = 1000000) {
  return Math.floor(Math.random() * 1000000);
};

// Room/Rooms classes ---------------------------------------------------------
class Room {
  constructor(twoPlayerMode, username = null) {
    this.id = generateId();
    this.twoPlayerMode = twoPlayerMode;
    this.slot1 = {
      game: new Tetris(),
      readyStart: false,
    };
    this.slot2 = {
      game: new Tetris(),
      readyStart: false,
    };

    this.onPlayerHandle = new CallbackList(this);
    this.onRunningHandle = new CallbackList(this);

    if (username) {
      this.registerPlayer(username);
    }
  }

  isAvailable() {
    return (
      this.twoPlayerMode &&
      (this.slot1.game.player === null || this.slot2.game.player === null)
    );
  }

  hasPlayer(username) {
    return (
      this.slot1.game.player === username || this.slot2.game.player === username
    );
  }

  registerPlayer(username) {
    let result = false;
    if (this.slot1.game.player === null) {
      this.slot1.game.player = username;
      result = true;
    } else if (this.slot2.game.player === null) {
      this.slot2.game.player = username;
      result = true;
    }

    this.onPlayerHandle.call();
    return result;
  }

  attachOnPlayer(handle) {
    this.onPlayerHandle.attach(handle);
  }

  removeOnPlayer(handle) {
    this.onPlayerHandle.remove(handle);
  }

  isActiveRoom(username, twoPlayerMode) {
    return (
      this.twoPlayerMode === twoPlayerMode &&
      (this.slot1.game.player === username ||
        this.slot2.game.player === username)
    );
  }

  getPrimaryGame(username) {
    if (this.slot1.game.player === username) {
      return this.slot1.game;
    } else if (this.slot2.game.player === username) {
      return this.slot2.game;
    } else {
      return null;
    }
  }

  getSecondaryGame(username) {
    if (this.slot1.game.player === username) {
      return this.slot2.game;
    } else if (this.slot2.game.player === username) {
      return this.slot1.game;
    } else {
      return null;
    }
  }

  start(username) {
    if (!this.twoPlayerMode) {
      // if one-player no need to wait, just start
      this.slot1.game.init();
      this.slot1.game.run();
    } else {
      // if two-player, only start when both are ready
      if (this.slot1.game.player === username) {
        this.slot1.readyStart = true;
      } else if (this.slot2.game.player === username) {
        this.slot2.readyStart = true;
      }

      if (this.slot1.readyStart && this.slot2.readyStart) {
        this.slot1.game.init();
        this.slot1.game.run();
        this.slot2.game.init();
        this.slot2.game.run();

        this.slot1.readyStart = false;
        this.slot2.readyStart = false;
      }
    }

    this.onRunningHandle.call();
  }

  stop() {
    if (!this.twoPlayerMode) {
      this.slot1.game.stop();
      this.slot1.game.init();
    }

    this.onRunningHandle.call();
  }

  isRunning() {
    if (!this.twoPlayerMode) {
      return this.slot1.game.isRunning();
    } else {
      return this.slot1.game.isRunning() && this.slot2.game.isRunning();
    }
  }

  attachOnRunning(handle) {
    this.onRunningHandle.attach(handle);
  }

  removeOnRunning(handle) {
    this.onRunningHandle.remove(handle);
  }
}

class Rooms {
  constructor() {
    this.rooms = [];
  }

  joinRoom(username, twoPlayerMode) {
    // check if already in room
    let room = this.findActiveRoom(username, twoPlayerMode);

    // check for available room
    if (!room) {
      room = this.rooms.find((r) => {
        return twoPlayerMode === r.twoPlayerMode && r.isAvailable();
      });
      if (room) {
        if (!room.hasPlayer(username)) {
          room.registerPlayer(username);
        }
      }
    }
    // create new room
    if (!room) {
      room = new Room(twoPlayerMode, username);
      this.rooms.push(room);
    }

    console.log(
      `Room id-${room.id}, mode: ${room.twoPlayerMode ? '2-player' : '1-player'}`,
    );
    console.log(
      `  Players: ${room.slot1.game.player}, ${room.slot2.game.player}`,
    );

    return room;
  }

  findActiveRoom(username, twoPlayerMode) {
    const room = this.rooms.find((r) => {
      return r.isActiveRoom(username, twoPlayerMode);
    });
    return room;
  }

  cleanup() {
    for (const room of this.rooms) {
      if (!room.isRunning()) {
        const index = this.rooms.indexOf(room);
        if (index !== -1) {
          this.rooms.splice(index, 1);
        }
      }
    }
  }
}

// export for use in other files
module.exports = Rooms;
