import User from "../modules/user/user.model.js";

export const requireSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isSubscribed) {
      return res.status(403).json({
        message: "Premium subscription required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Subscription check failed",
    });
  }
};