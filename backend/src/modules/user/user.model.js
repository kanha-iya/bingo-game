import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  isSubscribed: { type: Boolean, default: false },
  swapUsed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);