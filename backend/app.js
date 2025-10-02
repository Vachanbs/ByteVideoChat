import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./src/controllers/socketManager.js";
import userRoutes from "./src/routes/users.routes.js";

const app = express();
const server = createServer(app);

// ✅ Connect socket.io
const io = connectToSocket(server);

// ✅ Port
const PORT = process.env.PORT || 8000;

// ✅ Enable CORS (VERY IMPORTANT: whitelist your frontend domain)
app.use(cors({
  origin: ["https://bytevideochat.vercel.app", "http://localhost:3000"], // add both prod + dev
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ✅ Routes
app.use("/api/v1/users", userRoutes);

// ✅ Start server + connect DB
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(
      "mongodb+srv://tanushr20:Tanush@chatbot.kdrvim3.mongodb.net/?retryWrites=true&w=majority&appName=ChatBot"
    );

    console.log(`✅ MongoDB Connected: ${connectionDb.connection.host}`);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // stop app if DB fails
  }
};

start();
