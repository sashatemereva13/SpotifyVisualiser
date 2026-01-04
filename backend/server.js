import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initDb } from "./db/init.js";
import uploadRouter from "./routes/upload.js";

const app = express();

// middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// serve uploaded audio files
app.use("/uploads", express.static("uploads"));

// routes
app.use("/api", uploadRouter);

app.get("/", (req, res) => {
  res.send("Spotify Visualiser Backend is running. Try /health");
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 3001);

await initDb();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
