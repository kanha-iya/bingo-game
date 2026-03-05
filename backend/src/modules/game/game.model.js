import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
    },

    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    ifFulled: {
      type: Boolean,
      default: false,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);