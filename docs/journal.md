# Journal

## Project Initialization Hello World

Branch: `project-setup`
PR: <insert reference here>

In this (basic) branch `project-setup` I initialized the basic project base with the root `README.md`, `docs/` folder for containing `journal.md`, and the initial Node configuration. Installed packages include `nodemon` (dev) to support future development a bit easier (prevent stopping and starting the server manually) and `express` for the server. Placed in `src` is `server.js` which contains a simple "Hello World" GET response to just get the setup working.

I initially debated separating out the folder structure into a backend, frontend, and packages folder structure with a root and recursive `package.json` files for modularity... but decided instead to "keep it simple", at least for the initial implementation. I may revisit this if maintaining the contents in one structure become too difficult to manage. However, considering the scope of the scope of this project should be limited; one shared folder structure may be sufficient.

## Game "Engine"

Branch: [`feature/tetris-engine`](https://github.com/watermanpdx/CS565-Final-Project/tree/feature/tetris-engine)
Commit: [ac9fc39](https://github.com/watermanpdx/CS565-Final-Project/commit/ac9fc398c7e15015450610869017b57e9344cc54)

In this update I chose to first focus on the implementation of the base TETRIS implementation. As the website will be a multi-player TETRIS game, this is a core feature which is foundational to the purpose of the site, and must be available (at least in an initial form) to build the other features off of.

I chose to implement the TETRIS game within its own dedicated JavaScript file `tetris.js` to isolate it as a module for use within other JavaScript/Node components. I believe that this is also necessary to prevent "tangling" of code due to poor separation of concerns. I would like the contents of `tetris.js` to be focused **solely** on the game mechanics, and be abstracted from how the game is actually interacted with and viewed. That is, I want code elsewhere to define and bind what keys/event link to game actions, and "render" game states into a visual tetris game.

I initially linked the implementation of `tetris.js` into the backend code within `./backend/server.js` in an attempt to limit focus to the TETRIS implementation and **not** start on **React**... however, I found very quickly that this was impractical. My initial implementation "rendered" the game board to the terminal via `console.log()`, which helped to get started, but quickly ran into issues. In order to test user-input and special game-states like "a full row", it was too cumbersometo do this by hard-coding states and viewing it in the terminal; I found that I needed user-input and a basic, visual rendering to make progress on the game implementation.

For fear of coding myself "into a corner", I chose to build the basic frontent on [React](https://react.dev/) directly, rather than investing in (even simple) "vanilla" html and JavaScript. I separated out my frontend and backend into dedicated project subfolders `./frontend/` and `./backend/` to prevent confusion and clutter between the two implementations. For this stage of the implementation, I chose not to invest too heavily on React to keep focus on the TETRIS implementation. I built the initial frontend heavily following tutorials and online troubleshooting to "just get it running" ([React Getting Started](https://create-react-app.dev/docs/getting-started/), [Handling Events](https://stackoverflow.com/questions/27827234/how-to-handle-the-onkeypress-event-in-reactjs), [Resolving Issues with "Danlging" Event-Listeners](https://www.pluralsight.com/resources/blog/guides/event-listeners-in-react-components)). I acknowledge at this stage my React code may not be optimal. I intend to focus on this during later stages focusing on the frontend.

Using this, I was able to get an initial, basic TETRIS game up and running, and rendering in the browser. For this stage I chose to move the `tetris.js` implementation from the backend to the frontend to focus on the game-to-browser interaction. In future revisions, I will implement [Socket.IO](https://socket.io/) communication to link the frontend to game "engine", however for this initial step, I added directly to the frontend to reduce complexity. To support my desired separation of rendering and user-input from the game, all events are handled within the React code, and all games states are manages by `testris.js`. The React frontend binds keyboard events into `game` action calls, and the `game` object returns at each iteration an array of the board to be rendered and displayed. The frontend also cyclically calls the `update()` method of `game` to increment it in real-time. This will be removed from the frontend in future implmentations; it should not be in its scope.

In managing the visualization of the TETRIS game, I implemented a dedicated `Tetris.css` style-sheet for the contents of the game. Although I intend on using [https://getbootstrap.com/](Bootstrap) for most of my frontend styling, I think I will likely keep this dedicated style-sheet as its own file, and manually edited ("vanilla" css). Reasoning being, that the styling of the game contents itself, are very different from web-contents; they define specific game object (blocks, etc) colors and relative sizes. I do not expect them to need to (nor want them) to align to stylings for the webpage itself. Keeping this content as its own file keeps it separate from web-contents.

For the TETRIS implementation itself, I chose to implement the game and its contained objects (blocks) as Javascript `classes`. From previous experience, this is a common pattern that I have used in simulated, animated environments like this and choose to reuse this pattern. Again, given that the core game "engine" should be separated from webpage rendering and presentation, I don't believe that this should be an issue; and makes management of the game a bit easier (at least personally). I structured the game into a main `Tetris` `class` which is the sole object exported as a `module` for use externally. It is responsible for the game state, animation methods, and scoring. As the game is composed of many "blocks" which behave very similarly, I chose to implement a `Block` `class` which is contained and managed within `Tetris` containing all of the methods for managing block actions (move, rotate, check for collisions, etc.). Each specific block is a derived class of `Block` defining specific attributes such as it block-type, geometry, and rotations, initial position, etc.

Initially, I considered defining a base "sprite" for each block and implementing a rotation transformation when called... but found quickly that defining where the "center" of rotation was, and dealing with rounding became logically problematic quickly. Instead, I chose to simply reference the [TETRIS rotations](https://tetris.fandom.com/wiki/DTET_Rotation_System) directly and store them as a pre-computed array that gets indexed with rotation. (Likewise, for scoring I referenced the [TETRIS scoring](https://tetris.fandom.com/wiki/Scoring) directly rather than coming up with my own scoring scheme).

Some minor challenges I encountered worth noting. My internal game state (the grid of cells) is a multi-dimensional array; arrays within another array. I needed to distinguish between the current rendering window and a "base" rendering window. This is because the "active" block continually moves down the screen. I wanted to avoid having to constantly "clean up" old renderings of the block's last position, but still keep the "landed" blocks. To do this I implemented a "base" grid which contains all of the "landed" blocks, and a "current" grid which is the "base" grid + the current position of the active block. Since I have an array of arrays, I had to look out for shallow-copying and "leaking" changes to my "current" grid into my "base" grid. [Multi-Dimensional Array Copying](https://stackoverflow.com/questions/13756482/create-copy-of-multi-dimensional-array-not-reference-javascript).

I also learned that `classes` do not "hoist". That is, `classes` cannot be referenced above their implementation. I therefore had to pay attention to both where I implemented by derived and used `classes`, but also had to make sure the `export` declaration for `Tetris` was at the bottom of the file. I'm still not convinced that there may be some clever trick or better practice to bring this to the top... I plan to revisit this later in final code review; it works but I don't like that seeing what is exported requires navigating all the way to the bottom of the file...

Last, I ended this update without implementing rendering of the score, and showing the "next" block. My growing feeling is that these pieces may be their own components in React, and that I may be building too many frontend-to-`tetris.js` dependencies. Rather than continuing development of these features in this update, I've chosen to leave it as-is for now, and instead focus on the Socket.IO separation next. In the next major update I want to split out the frontend and backend concerns over Socket.IO and complete the full game rendering in React.

## Socket-IO Communication

Branch: [`feature/socket-io`](https://github.com/watermanpdx/CS565-Final-Project/tree/feature/socket-io)
Commit: [4bda80f](https://github.com/watermanpdx/CS565-Final-Project/commit/4bda80f345780962bdb2cede665ceb26f0002d79)

In this update I moved the contents of `tetris.js` out of the frontend and back into the backend and passed the game information and envents between the two via Socket.IO. For this pass (remaining single-player) this actually ended up being a lot easier than anticipated. Since the `tetris.js` already exposed interactions with its main Tetris class via methods, it was very straight-forward to simply wrap these in socket.io events. In example, originally where the on-key events in the frontend would wrap calls to the game object methods, they now simply wrap socket.io `emit` calls on the frontend, and the game object method calls are wrapped in the socket `on` events.

I ran into some minor challenges getting the socket.io communication initially set up. However, I found that this was mostly "overthinking" how I expected socket.io to work. I initially was under the impression that the socket port and the webpage port needed to be different, which resulted in overly complicated, non-functional code. What I learned was that the socket.io _protocol_ (above the IP layer) differs http; and can therefore coexist on the same port. This made the code substantially simpler. I likewise learned through inspection of the `socket.id` that the id is not that of the _client_ or of the _server_ but the socket.io connection itself. This didn't cause any issues, but rather was just contrary to my initial understanding.

For the initial setup of socket.io, I relied heavily on a [Socket.IO with React Tutorial](https://socket.io/how-to/use-with-react) for learning how to implement socket.io communication for the frontent.

Although the focus of this update was on implementing Socket.IO, I also made some progress in the React code for the frontend. In including the "next block" mini-screen and the score + "game over" text, I was able to break down the React code into more granular components. The modular "component" approach in React is turning out to be very useful. It allows for the webpage to be broken down into small, digestible pieces, and easily reorderd or duplicated in higher structures. This helped with the game rendering for the main and "next block" mini-screen. It allowed me to build each individually, and once working, easily orient them against one-another in the parent component. I'm really curious to see how fleshing out the rest of the frontend will go using React. In the next step, I intend to focus on structuring the overall frontend webpage in React.

## Frontend Update

https://react-bootstrap.netlify.app/docs/getting-started/introduction

https://react-bootstrap.netlify.app/docs/components/navbar

https://react-bootstrap.netlify.app/docs/components/modal

https://react-bootstrap.netlify.app/docs/forms/overview

React components (including variables) must be uppercase ?! https://legacy.reactjs.org/docs/components-and-props.html

Ping-ponging where to manage states/data; tradeoff of clutter in parents vs control
