FROM node:20-alpine
WORKDIR /multiplayer-tetris

COPY frontend/package* ./frontend/
RUN cd frontend && npm install

COPY frontend/public/* ./frontend/public/
COPY frontend/src ./frontend/src
RUN cd frontend && npm run build

COPY backend/package* ./backend/
RUN cd backend && npm install

COPY backend/src ./backend/src

EXPOSE 3001
CMD ["node", "backend/src/server.js"]
