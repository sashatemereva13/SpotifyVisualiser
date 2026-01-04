import express from "express";
import multer from "multer";
import path from "path";
import { openDb, run } from "../db/sqlite.js";

const router = express.Router();

// ---- Multer config ----
const uploadDir = process.env.UPLOAD_DIR || "uploads";

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only audio files allowed"));
    }
    cb(null, true);
  },
});

// ---- POST /upload ----
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const db = await openDb();

    const result = await run(
      db,
      `
      INSERT INTO tracks
      (original_name, filename, mime_type, size_bytes, path, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      `,
      [
        file.originalname,
        file.filename,
        file.mimetype,
        file.size,
        `${uploadDir}/${file.filename}`,
      ]
    );

    db.close();

    res.json({
      trackId: result.lastID,
      original_name: file.originalname,
      path: `${uploadDir}/${file.filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
