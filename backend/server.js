import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import trackRoutes from "./routes/tracks.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { initDb } from "./db/init.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

await initDb();

app.get("/", (req, res) => res.send("Spotify Visualiser Backend is running. Try /health"));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(trackRoutes);
app.use(uploadRoutes);
app.use(analysisRoutes);
app.use(adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
