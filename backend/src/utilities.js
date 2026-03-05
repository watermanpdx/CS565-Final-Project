// utilities.js

// Callbacks class ------------------------------------------------------------
class CallbackList {
  /*
    Datastructure for managing a list of callbacks
  */
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

// export for use in other files
module.exports = CallbackList;
