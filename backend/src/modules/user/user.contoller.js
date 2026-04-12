import * as UserService from "./user.service.js";

export const getProfile = async (req, res) => {
  try {
    const user = await UserService.getProfile(req.user.id);

    res.json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await UserService.updateProfile(
      req.user.id,
      req.body
    );

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const activateSubscription = async (req, res) => {
  try {
    const user = await UserService.activateSubscription(req.user.id);

    res.json({
      message: "Subscription activated",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getMatchStats = async (req, res) => {
  try {
    const stats = await UserService.getMatchStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMatchHistory = async (req, res) => {
  try {
    const history = await UserService.getMatchHistory(req.user.id);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};