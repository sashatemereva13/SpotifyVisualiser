import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import trackRoutes from "./routes/tracks.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import { initDb } from "./db/init.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// init once
await initDb();

app.get("/", (req, res) => res.send("Spotify Visualiser Backend is running. Try /health"));
app.get("/health", (req, res) => res.json({ ok: true }));

// routes (each ONCE)
app.use(trackRoutes);
app.use(uploadRoutes);
app.use(analysisRoutes);

// error handler MUST be last
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
