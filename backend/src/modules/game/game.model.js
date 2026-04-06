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
        board: {
          type: [Number],
          default: [],
        },
        markedNumbers: {
          type: [Number],
          default: [],
        },
      },
    ],
    ifFulled: {
      type: Boolean,
      default: false,
    },
    numberPool: {
      type: [Number],
      default: [],
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