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
  return countCompletedLines(board, calledNumbers) >= 5;
};

export const socketHandler = (io) => {
  const games = {};
  const socketToGame = {};
  const socketToUser = {};

  console.log("Socket handler initialized");

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinGame", ({ gameId, userId, board }) => {
      if (!gameId || !userId) return;

      socket.join(gameId);
      socketToGame[socket.id] = gameId;
      socketToUser[socket.id] = userId;

      if (!games[gameId]) {
        games[gameId] = {
          players: [],
          boards: {},
          turn: 0,
          started: false,
          calledNumbers: [],
        };
      }

      const game = games[gameId];
      const isExistingPlayer = game.players.includes(userId);

      if (!isExistingPlayer && game.players.length >= 2) {
        socket.emit("roomFull", { message: "Game room is full" });
        return;
      }

      if (board && Array.isArray(board) && board.length === 25) {
        game.boards[userId] = board;
      }

      if (!isExistingPlayer) {
        game.players.push(userId);
      }

      console.log(`User ${userId} joined game ${gameId}`);
      console.log("Players:", game.players);

      io.to(gameId).emit("playersUpdate", game.players);

      if (game.started) {
        socket.emit("gameState", {
          calledNumbers: game.calledNumbers,
          turn: game.players[game.turn],
        });
        return;
      }

      if (game.players.length === 2) {
        io.to(gameId).emit("readyToStart");
      }
    });

    socket.on("startGame", ({ gameId }) => {
      const game = games[gameId];
      if (!game) return;

      if (game.players.length < 2) {
        socket.emit("errorMessage", { message: "Need 2 players to start" });
        return;
      }

      if (game.started) return;

      game.started = true;
      game.turn = 0;

      io.to(gameId).emit("gameStarted", {
        turn: game.players[game.turn],
      });

      console.log(`Game started in ${gameId}, first turn: ${game.players[game.turn]}`);
    });

    socket.on("callNumber", ({ gameId, number, userId }) => {
      const game = games[gameId];
      if (!game) return;

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
      io.to(gameId).emit("numberCalled", number);

      for (const playerId of game.players) {
        const playerBoard = game.boards[playerId];
        if (playerBoard && checkBingo(playerBoard, game.calledNumbers)) {
          io.to(gameId).emit("bingoWinner", { winner: playerId });
          game.started = false;
          console.log(`${playerId} won game ${gameId}`);
          return;
        }
      }

      game.turn = game.turn === 0 ? 1 : 0;
      io.to(gameId).emit("turnChanged", {
        turn: game.players[game.turn],
      });

      console.log(
        `Number ${number} called by ${userId} in game ${gameId}. Next turn: ${game.players[game.turn]}`
      );
    });

    socket.on("disconnect", () => {
      const gameId = socketToGame[socket.id];
      const userId = socketToUser[socket.id];

      if (gameId && games[gameId]) {
        const game = games[gameId];

        if (!game.started) {
          game.players = game.players.filter((p) => p !== userId);
          delete game.boards[userId];
          io.to(gameId).emit("playersUpdate", game.players);
        } else {
          io.to(gameId).emit("errorMessage", {
            message: `${userId} disconnected. Waiting for them to reconnect...`,
          });
        }

        if (game.players.length === 0) {
          delete games[gameId];
          console.log(`Game ${gameId} deleted`);
        } else {
          console.log(`User ${userId} disconnected from game ${gameId}`);
        }
      }

      delete socketToGame[socket.id];
      delete socketToUser[socket.id];

      console.log("Client disconnected:", socket.id);
    });
  });
};