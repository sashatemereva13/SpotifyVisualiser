import { Router } from "express";
import { openDb, all } from "../db/sqlite.js";

const router = Router();

router.get("/tracks", async (req, res, next) => {
  let db;
  try {
    db = await openDb();

    const rows = await all(
      db,
      `SELECT
         id,
         original_name,
         filename,
         mime_type,
         size_bytes,
         path,
         created_at
       FROM tracks
       ORDER BY id DESC`
    );

    res.json({ tracks: rows });
  } catch (err) {
    next(err);
  } finally {
    if (db) db.close();
  }
});

export default router;
