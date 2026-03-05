import express from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.route.js";
import gameRoutes from "./src/modules/game/game.routes.js";
import userRoutes from "./src/modules/user/user.route.js";
import dotenv from "dotenv";
import { verifyToken } from "./src/middleware/auth.middleware.js";
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// Health route
app.get("/", (req, res) => {
  res.send("Bingo game API Running 🚀");
});

// Later we will add:
app.use("/api/auth", authRoutes);
app.use("/api/game", verifyToken, gameRoutes);
app.use("/api/user", verifyToken, userRoutes);
// etc.

export default app;