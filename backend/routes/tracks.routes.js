import { Router } from "express";
import { openDb, all, get } from "../db/sqlite.js";

const router = Router();

router.get("/tracks", async (req, res, next) => {
  let db;
  try {
    db = await openDb();

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const totalRow = await get(db, "SELECT COUNT(*) as total FROM tracks");
    const total = totalRow?.total ?? 0;

    const rows = await all(
      db,
      `SELECT
         id, original_name, filename, mime_type, size_bytes, path, created_at
       FROM tracks
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      items: rows,
      page,
      limit,
      total,
      hasNext: offset + rows.length < total,
    });
  } catch (err) {
    next(err);
  } finally {
    if (db) db.close();
  }
});

export default router;
