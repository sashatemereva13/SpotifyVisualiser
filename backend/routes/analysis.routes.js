import { Router } from "express";
import { openDb, run, get } from "../db/sqlite.js";
import { callAnalysisService } from "../services/analysisClient.js";

const router = Router();


router.post("/analysis/:trackId", async (req, res, next) => {
  const trackId = Number(req.params.trackId);

  try {
    const db = await openDb();

    const track = await get(
      db,
      "SELECT * FROM tracks WHERE id = ?",
      [trackId]
    );

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    const createdAt = new Date().toISOString();
    const { lastID } = await run(
      db,
      `INSERT INTO analyses (track_id, status, created_at)
       VALUES (?, 'pending', ?)`,
      [trackId, createdAt]
    );

    try {
      const result = await callAnalysisService(track.path);

      await run(
        db,
        `UPDATE analyses
         SET status = 'done', result_json = ?
         WHERE id = ?`,
        [JSON.stringify(result), lastID]
      );

      const analysis = await get(
        db,
        "SELECT * FROM analyses WHERE id = ?",
        [lastID]
      );

      res.status(201).json({ analysis });

    } catch (err) {
      await run(
        db,
        `UPDATE analyses
         SET status = 'error', error_message = ?
         WHERE id = ?`,
        [err.message, lastID]
      );

      res.status(500).json({ error: "Analysis failed", details: err.message });
    }

  } catch (err) {
    next(err);
  }
});

router.get("/analysis/:trackId", async (req, res, next) => {
  const trackId = Number(req.params.trackId);

  try {
    const db = await openDb();

    const analysis = await get(
      db,
      `SELECT *
       FROM analyses
       WHERE track_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [trackId]
    );

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json({ analysis });

  } catch (err) {
    next(err);
  }
});

export default router;
