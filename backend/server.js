// Load environment variables from .env into process.env
// This must be done BEFORE accessing any process.env values
import dotenv from "dotenv";
dotenv.config();

// Core backend dependencies
import express from "express";
import cors from "cors";

// Database initialization logic
// Responsible for creating folders and running schema.sql
import { initDb } from "./db/init.js";

// ----------------------------
// Route modules (API endpoints)
// ----------------------------

// Handles file uploads (POST /api/upload)
import uploadRoutes from "./routes/upload.routes.js";

// Lists stored tracks (GET /api/tracks)
import tracksRoutes from "./routes/tracks.routes.js";

// Returns analysis results for a track (GET /api/analysis/:trackId)
import analysisRoutes from "./routes/analysis.routes.js";

// Create the Express application instance
const app = express();

// ----------------------------
// Global middleware
// ----------------------------

// Enable CORS so the frontend (Vite / React) can call the backend API
// Default: allow all origins, configurable via CORS_ORIGIN
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Enable automatic parsing of JSON request bodies
// Required for POST/PUT requests with JSON payloads
app.use(express.json());

// ----------------------------
// Static files
// ----------------------------

// Expose uploaded audio files publicly
// Example: http://localhost:3001/uploads/song.mp3
app.use("/uploads", express.static("uploads"));

// ----------------------------
// Initialization
// ----------------------------

// Initialize database and required folders before handling requests
// - creates uploads/ directory
// - creates db/ directory
// - runs schema.sql if needed
await initDb();

// ----------------------------
// API routes
// ----------------------------

// Prefix all API routes with /api to keep a clean namespace
app.use("/api", uploadRoutes);
app.use("/api", tracksRoutes);
app.use("/api", analysisRoutes);

// ----------------------------
// Health & root endpoints
// ----------------------------

// Root endpoint (simple sanity check)
app.get("/", (req, res) => {
  res.send("Spotify Visualiser Backend is running. Try /health");
});

// Health endpoint (used for monitoring / deployment checks)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ----------------------------
// Global error handler
// ----------------------------

// Catch any unhandled errors thrown by routes or middleware
// Ensures the backend never crashes silently
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || "Internal error",
  });
});

// ----------------------------
// Server startup
// ----------------------------

// Use PORT from environment if provided, otherwise default to 3001
const PORT = Number(process.env.PORT || 3001);

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
