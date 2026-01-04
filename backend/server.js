import analysisRoutes from "./routes/analysis.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import trackRoutes from "./routes/tracks.routes.js";
import { initDb } from "./db/init.js";

dotenv.config();

import express from "express";
import cors from "cors";
import { initDb } from "./db/init.js";
import uploadRouter from "./routes/upload.js";

const app = express();

// middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// INIT DB FIRST
await initDb();

// ROUTES
app.use(trackRoutes);

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

app.use(uploadRoutes);
app.use(trackRoutes);
app.use(uploadRoutes);
app.use(analysisRoutes);

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
