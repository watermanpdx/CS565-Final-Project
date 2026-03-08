// utilities.js

/*
This file is responsible for common classes and functions used within the
backend server code. It is primarily responsible for the CallbackList class
definition which is used for managing and calling a list of callbacks.
*/

// Callbacks class ------------------------------------------------------------
class CallbackList {
  /*
    Data-structure for managing a list of callbacks
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
