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
  });

  const losses = totalMatches - wins;

  return {
    totalMatches,
    wins,
    losses,
  };
};