import express from "express";
import * as gameController from "./game.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireSubscription } from "../../middleware/subscription.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, gameController.creategame);

router.post("/join/:gameId", verifyToken, gameController.joingame);

router.post("/play/:gameId", verifyToken, gameController.playNumber);

router.post(
  "/swap/:gameId",
  requireSubscription,
  gameController.swapNumbers
);

export default router;