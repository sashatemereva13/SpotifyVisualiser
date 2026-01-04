import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initDb } from "./db/init.js";

// routes
import uploadRoutes from "./routes/upload.routes.js";
import tracksRoutes from "./routes/tracks.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";

const app = express();

// middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// serve uploaded audio files
app.use("/uploads", express.static("uploads"));

// init database + folders
await initDb();

// API routes
app.use("/api", uploadRoutes);
app.use("/api", tracksRoutes);
app.use("/api", analysisRoutes);

// health & root
app.get("/", (req, res) => {
  res.send("Spotify Visualiser Backend is running. Try /health");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
