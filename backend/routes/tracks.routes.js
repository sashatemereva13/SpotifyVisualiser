import express from "express";
import { openDb, all } from "../db/sqlite.js";

const router = express.Router();

router.get("/tracks", async (req, res, next) => {
  try {
    const db = await openDb();
    const rows = await all(
      db,
      `SELECT id, original_name, filename, mime_type, size_bytes, created_at
       FROM tracks
       ORDER BY id DESC
       LIMIT 100`
    );
    db.close();
    res.json({ items: rows });
  } catch (e) {
    next(e);
  }
});

export default router;
