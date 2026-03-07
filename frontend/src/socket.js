// socket.js

// Manage shared socket (client) connection

import { io } from "socket.io-client";

export const socket = io("", {
  transports: ["websocket"],
});
