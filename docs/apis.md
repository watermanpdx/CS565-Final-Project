# About

The following document describes the custom `REST` and `socket.io` APIs defined within this project repository.

## REST

The following describes the supported `REST` paths supported from the server:

## GET

`/scores` — get an array of high-scores from the database. Supports query `?maxEntries=n` for the maximum number of entries to return. Returns: `[{id, username, score, durationms, date}, ...]`

## POST

`/login` — Check login information against database. Post: `{ username, password }` Returns: `{success, username}`
`/new-account` — Create a new account and add to database. Post: `{ username, password }` Returns: `{success, username}`
`/password-reset` — Update the password of an account. Post: `{ username, password }` Returns: `{success, username}`

## Socket.IO

The following describes the supported `socket.io` messages within this project-base:

### Server (sent to client)

`game-connect` - New Tetris object from frontend connects requiring a game reference
`start` - Start or restart the Tetris game
`reset` - Reset the game without auto-restarting (2-player readiness handled on server)
`moveLeft` - Game control: move left
`moveRight` - Game control: move right
`moveDown` - Game control: move down
`rotateLeft` - Game control: rotate left
`rotateRight` - Game control: rotate right

### Client (sent to server)

`player-update` - Player(s) status in a room has changed
`running-status` - Inform frontend of game running state
`render-primary` - New state to render for the primary Tetris game in a room
`render-secondary` - New state to render for the secondary Tetris game in a room

### Shared (connection)

`connection` - New socket connection is made
`disconnect` - Socket connection is closing
