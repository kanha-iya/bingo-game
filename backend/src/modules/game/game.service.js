import Game from "./game.model.js";
import User from "../user/user.model.js";

// Generate random Bingo board
const generateBoard = () => {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  return numbers.sort(() => Math.random() - 0.5);
};

// Create new Game
export const createGame = async (userId) => {
  const gameId = Math.random().toString(36).substring(2, 8);

  const game = await Game.create({
    gameId,
    players: [
      {
        userId,
        board: generateBoard(), 
        markedNumbers: [],
      },
    ],
  });

  return game;
};

// Join existing Game
export const joinGame = async (gameId, userId) => {
  const game = await Game.findOne({ gameId });

  if (!game ) {
    throw new Error("Game not found");
  }

  if (game.players.length >= 2) {
    throw new Error("Game already full");
  }

  const existingPlayer = game.players.find(
    (p) => p.userId.toString() === userId
  );

  if (existingPlayer) {
    throw new Error("Player already joined");
  }

  game.players.push({
    userId,
    board: generateBoard(),
    markedNumbers: [],
  });

  if (game.players.length === 2) {
    game.status = "playing";
  }

  await game.save();

  return game;
};

// Play number
export const playNumber = async (gameId, userId, number) => {
  const game = await Game.findOne({ gameId });

  if (!game) {
    throw new Error("Game not found");
  }

  const player = game.players.find(
    (p) => p.userId.toString() === userId
  );

  if (!player) {
    throw new Error("Player not in Game");
  }

  if (!player.board.includes(number)) {
    throw new Error("Invalid number");
  }

  if (player.markedNumbers.includes(number)) {
    throw new Error("Number already marked");
  }

  player.markedNumbers.push(number);

  await game.save();

  return {
    markedNumbers: player.markedNumbers,
  };
};

// Swap two numbers (premium feature)
export const swapNumbers = async (gameId, userId) => {
  const game = await Game.findOne({ gameId });

  if (!game) {
    throw new Error("Game not found");
  }

  const player = game.players.find(
    (p) => p.userId.toString() === userId
  );

  if (!player) {
    throw new Error("Player not in Game");
  }

  const board = [...player.board];

  const i = Math.floor(Math.random() * 25);
  const j = Math.floor(Math.random() * 25);

  [board[i], board[j]] = [board[j], board[i]];

  player.board = board;

  await game.save();

  return {
    board,
  };
};

export const persistGameResult = async (gameIdStr, winnerEmail, calledNumbers) => {
  const winnerUser = await User.findOne({ email: winnerEmail });
  const gameDoc = await Game.findOne({ gameId: gameIdStr });

  if (!gameDoc || !winnerUser) {
    return;
  }

  gameDoc.winner = winnerUser._id;
  gameDoc.status = "finished";

  if (Array.isArray(calledNumbers) && calledNumbers.length > 0) {
    gameDoc.numberPool = calledNumbers;
  }

  await gameDoc.save();
};