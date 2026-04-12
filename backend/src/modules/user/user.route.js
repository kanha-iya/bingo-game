import express from "express";
import * as UserController from "./user.contoller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/profile", verifyToken, UserController.getProfile);

// Update profile
router.put("/profile", verifyToken, UserController.updateProfile);

// Get all users (optional admin)
router.get("/", verifyToken, UserController.getUsers);

// Activate subscription
router.post(
  "/subscribe",
  verifyToken,
  UserController.activateSubscription
);

router.get(
  "/match-stats",
  verifyToken,
  UserController.getMatchStats
);

router.get(
  "/match-history",
  verifyToken,
  UserController.getMatchHistory
);

export default router;