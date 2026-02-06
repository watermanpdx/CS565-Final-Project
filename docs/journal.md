# Journal

## Project Initialization Hello World

Branch: `project-setup`
PR: <insert reference here>

In this (basic) branch `project-setup` I initialized the basic project base with the root `README.md`, `docs/` folder for containing `journal.md`, and the initial Node configuration. Installed packages include `nodemon` (dev) to support future development a bit easier (prevent stopping and starting the server manually) and `express` for the server. Placed in `src` is `server.js` which contains a simple "Hello World" GET response to just get the setup working.

I initially debated separating out the folder structure into a backend, frontend, and packages folder structure with a root and recursive `package.json` files for modularity... but decided instead to "keep it simple", at least for the initial implementation. I may revisit this if maintaining the contents in one structure become too difficult to manage. However, considering the scope of the scope of this project should be limited; one shared folder structure may be sufficient.

## Game "Engine"

https://tetris.fandom.com/wiki/DTET_Rotation_System

deepcopy https://stackoverflow.com/questions/13756482/create-copy-of-multi-dimensional-array-not-reference-javascript

classes don't hoist?

https://create-react-app.dev/docs/getting-started/
