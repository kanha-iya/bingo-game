import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./src/modules/auth/auth.route.js";
import gameRoutes from "./src/modules/game/game.routes.js";
import userRoutes from "./src/modules/user/user.route.js";
import subscriptionRoutes from "./src/modules/subscription/subscription.routes.js";
import { verifyToken } from "./src/middleware/auth.middleware.js";


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
app.use("/api/subscription", verifyToken, subscriptionRoutes);
// etc.

export default app;