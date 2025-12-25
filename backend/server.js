import { initDb } from "./db/init.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Spotify Visualiser Backend is running. Try /health");
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 3001);
await initDb();
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
