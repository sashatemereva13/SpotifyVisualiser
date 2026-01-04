import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { openDb, run, get } from "../db/sqlite.js";

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || "./uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, 
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing file" });
    }
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp3"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }


    const absPath = path.resolve(req.file.path);
    if (!fs.existsSync(absPath)) {
      return res.status(500).json({ error: "File not saved" });
    }

    const db = await openDb();
    const createdAt = new Date().toISOString();

    const ins = await run(
      db,
      `INSERT INTO tracks
       (original_name, filename, mime_type, size_bytes, path, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        absPath,
        createdAt,
      ]
    );

    const track = await get(db, `SELECT * FROM tracks WHERE id = ?`, [
      ins.lastID,
    ]);

    db.close();
    res.status(201).json({ track });
  } catch (err) {
    next(err);
  }
});

export default router;
