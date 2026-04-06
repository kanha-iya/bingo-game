import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

import dns from 'node:dns/promises';
import {socketHandler } from "./src/socket/sockethandler.js";
dns.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare and Google DNS   

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

/* Initialize socket logic */
socketHandler(io)

const startServer = async () => {
  await connectDB(process.env.MONGO_URI);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
