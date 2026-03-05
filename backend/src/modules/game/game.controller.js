import * as gameService from "./game.service.js";

export const creategame = async (req, res) => {
  try {
    const game = await gameService.createGame(req.user.id);

    res.status(201).json({ success: true, data: game , message: "game created successfully"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joingame = async (req, res) => {
  try {
    const game = await gameService.joinGame(
      req.params.gameId,
      req.user.id
    );

    res.json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const playNumber = async (req, res) => {
  try {
    const result = await gameService.playNumber(
      req.params.gameId,
      req.user.id,
      req.body.number
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const swapNumbers = async (req, res) => {
  try {
    const result = await gameService.swapNumbers(
      req.params.gameId,
      req.user.id
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};