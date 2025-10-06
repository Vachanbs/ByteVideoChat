import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { connectToSocket } from "./src/controllers/socketManager.js";
import userRoutes from "./src/routes/users.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// ✅ Connect socket.io
const io = connectToSocket(server);

// ✅ Port
const PORT = process.env.PORT || 8000;

// ✅ Enable CORS (VERY IMPORTANT: whitelist your frontend domain)
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ["https://bytevideochat.vercel.app", "http://localhost:3000"];

app.use(cors({
  origin: corsOrigins,
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
    const mongoUri = process.env.MONGODB_URI || 
      "mongodb+srv://vachanbs21:O4jBjdN3HeqqGvGp@byte.ulqcs6e.mongodb.net/?retryWrites=true&w=majority&appName=BYTE";
    
    const connectionDb = await mongoose.connect(mongoUri);

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
