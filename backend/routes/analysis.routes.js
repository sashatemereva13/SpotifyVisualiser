import express from "express";
import { openDb, get } from "../db/sqlite.js";

const router = express.Router();

router.get("/analysis/:trackId", async (req, res, next) => {
  try {
    const trackId = Number(req.params.trackId);
    if (!Number.isFinite(trackId)) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const db = await openDb();
    const row = await get(
      db,
      `SELECT track_id, status, result_json, error_message, created_at
       FROM analyses
       WHERE track_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [trackId]
    );
    db.close();

    if (!row) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json({
      track_id: row.track_id,
      status: row.status,
      error: row.error_message || null,
      result: row.result_json ? JSON.parse(row.result_json) : null,
      created_at: row.created_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
