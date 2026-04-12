import User from "./user.model.js";
import game from "../game/game.model.js";

// Get user profile
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update profile
export const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  ).select("-password");

  return user;
};

// Get all users (optional admin feature)
export const getUsers = async () => {
  return await User.find().select("-password");
};

// Activate subscription
export const activateSubscription = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isSubscribed = true;

  await user.save();

  return user;
};

export const getMatchStats = async (userId) => {

  const totalMatches = await game.countDocuments({
    "players.userId": userId,
    status: "finished",
  });

  const wins = await game.countDocuments({
    winner: userId,
    status: "finished",
  });

  const losses = totalMatches - wins;

  return {
    totalMatches,
    wins,
    losses,
  };
};

export const getMatchHistory = async (userId) => {
  const matches = await game
    .find({ "players.userId": userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate("winner", "email username")
    .populate("players.userId", "email username")
    .lean();

  return matches.map((m) => {
    const opponents = m.players
      .filter(
        (p) =>
          p.userId &&
          p.userId._id &&
          p.userId._id.toString() !== userId.toString()
      )
      .map((p) => ({
        email: p.userId.email,
        username: p.userId.username,
      }));

    let result = "playing";

    if (m.status === "waiting") {
      result = "waiting";
    } else if (m.status === "playing") {
      result = "playing";
    } else if (m.status === "finished") {
      if (!m.winner) {
        result = "finished";
      } else if (m.winner._id.toString() === userId.toString()) {
        result = "win";
      } else {
        result = "loss";
      }
    }

    return {
      gameId: m.gameId,
      status: m.status,
      result,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      winner: m.winner
        ? { email: m.winner.email, username: m.winner.username }
        : null,
      opponents,
      calledNumbers: m.numberPool || [],
    };
  });
};