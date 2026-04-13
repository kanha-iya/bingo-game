import { persistGameResult as saveGameResult } from "../modules/game/game.service.js";

const countCompletedLines = (board, calledNumbers) => {
  const called = new Set(calledNumbers);
  const SIZE = 5;
  const idx = (row, col) => board[row * SIZE + col];
  let lines = 0;

  for (let r = 0; r < SIZE; r++) {
    if ([0, 1, 2, 3, 4].every((c) => called.has(idx(r, c)))) lines++;
  }

  for (let c = 0; c < SIZE; c++) {
    if ([0, 1, 2, 3, 4].every((r) => called.has(idx(r, c)))) lines++;
  }

  if ([0, 1, 2, 3, 4].every((i) => called.has(idx(i, i)))) lines++;

  if ([0, 1, 2, 3, 4].every((i) => called.has(idx(i, SIZE - 1 - i)))) lines++;

  return lines;
};

const checkBingo = (board, calledNumbers) => {
  return countCompletedLines(board, calledNumbers) >= 3;
};

/**
 * In-memory game state: requires all players to use the same Socket.IO server
 * process. If you run multiple Node instances behind a load balancer, enable
 * sticky sessions or use @socket.io/redis-adapter so rooms are shared.
 */

const normalizeGameId = (gameId) => String(gameId ?? "").trim();

export const socketHandler = (io) => {
  const games = {};
  const socketToGame = {};
  const socketToUser = {};

  console.log("Socket handler initialized");

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinGame", ({ gameId, userId, board }) => {
      const gid = normalizeGameId(gameId);
      if (!gid || !userId) return;

      socket.join(gid);
      socketToGame[socket.id] = gid;
      socketToUser[socket.id] = userId;

      if (!games[gid]) {
        games[gid] = {
          players: [],
          boards: {},
          turn: 0,
          started: false,
          calledNumbers: [],
        };
      }

      const game = games[gid];
      const isExistingPlayer = game.players.includes(userId);

      if (!isExistingPlayer && game.players.length >= 2) {
        socket.emit("roomFull", { message: "Game room is full" });
        socket.leave(gid);
        return;
      }

      if (board && Array.isArray(board) && board.length === 25) {
        game.boards[userId] = board;
      }

      if (!isExistingPlayer) {
        game.players.push(userId);
      }

      console.log(`User ${userId} joined game ${gid}`);
      console.log("Players:", game.players);

      io.to(gid).emit("playersUpdate", game.players);

      if (game.started) {
        socket.emit("gameState", {
          calledNumbers: game.calledNumbers,
          turn: game.players[game.turn],
        });
        return;
      }

      if (game.players.length === 2) {
        io.to(gid).emit("readyToStart");
        game.started = true;
        game.turn = 0;
        io.to(gid).emit("gameStarted", {
          turn: game.players[game.turn],
        });
        console.log(
          `Game auto-started in ${gid}, first turn: ${game.players[game.turn]}`
        );
      }
    });

    socket.on("startGame", ({ gameId }) => {
      const gid = normalizeGameId(gameId);
      const game = games[gid];
      if (!game) {
        socket.emit("errorMessage", {
          message:
            "Game session not found. Refresh the page or rejoin the room. If this persists, the server may have restarted — both players should re-open the lobby.",
        });
        return;
      }

      if (game.players.length < 2) {
        socket.emit("errorMessage", { message: "Need 2 players to start" });
        return;
      }

      if (game.started) return;

      game.started = true;
      game.turn = 0;

      io.to(gid).emit("gameStarted", {
        turn: game.players[game.turn],
      });

      console.log(`Game started in ${gid}, first turn: ${game.players[game.turn]}`);
    });

    socket.on("callNumber", ({ gameId, number, userId }) => {
      const gid = normalizeGameId(gameId);
      const game = games[gid];
      if (!game) {
        socket.emit("errorMessage", {
          message: "Game session not found. Try refreshing the lobby.",
        });
        return;
      }

      if (!game.started) {
        socket.emit("errorMessage", { message: "Game has not started yet" });
        return;
      }

      if (game.players[game.turn] !== userId) {
        socket.emit("errorMessage", { message: "Not your turn" });
        return;
      }

      if (!Number.isInteger(number) || number < 1 || number > 25) {
        socket.emit("errorMessage", { message: "Invalid number" });
        return;
      }

      if (game.calledNumbers.includes(number)) {
        socket.emit("errorMessage", { message: "Number already called" });
        return;
      }

      game.calledNumbers.push(number);
      io.to(gid).emit("numberCalled", number);

      for (const playerId of game.players) {
        const playerBoard = game.boards[playerId];
        if (playerBoard && checkBingo(playerBoard, game.calledNumbers)) {
          io.to(gid).emit("bingoWinner", { winner: playerId });
          game.started = false;
          console.log(`${playerId} won game ${gid}`);
          saveGameResult(gid, playerId, [...game.calledNumbers]).catch(
            (err) => console.error("Failed to persist game result:", err)
          );
          return;
        }
      }

      game.turn = game.turn === 0 ? 1 : 0;
      io.to(gid).emit("turnChanged", {
        turn: game.players[game.turn],
      });

      console.log(
        `Number ${number} called by ${userId} in game ${gid}. Next turn: ${game.players[game.turn]}`
      );
    });

    socket.on("disconnect", () => {
      const gid = socketToGame[socket.id];
      const userId = socketToUser[socket.id];

      if (gid && games[gid]) {
        const game = games[gid];

        if (!game.started) {
          game.players = game.players.filter((p) => p !== userId);
          delete game.boards[userId];
          io.to(gid).emit("playersUpdate", game.players);
        } else {
          io.to(gid).emit("errorMessage", {
            message: `${userId} disconnected. Waiting for them to reconnect...`,
          });
        }

        if (game.players.length === 0) {
          delete games[gid];
          console.log(`Game ${gid} deleted`);
        } else {
          console.log(`User ${userId} disconnected from game ${gid}`);
        }
      }

      delete socketToGame[socket.id];
      delete socketToUser[socket.id];

      console.log("Client disconnected:", socket.id);
    });
  });
};