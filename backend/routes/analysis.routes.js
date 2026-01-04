import { Router } from "express";
import { openDb, run, get } from "../db/sqlite.js";
import { callAnalysisService } from "../services/analysisClient.js";

const router = Router();

async function ensureAnalysesTable(db) {
  await run(
    db,
    `
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      result_json TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (track_id) REFERENCES tracks(id)
    );
    `
  );
}

router.post("/analysis/:trackId", async (req, res, next) => {
  const trackId = Number(req.params.trackId);
  let db;

  try {
    db = await openDb();
    await ensureAnalysesTable(db);

    const track = await get(db, "SELECT * FROM tracks WHERE id = ?", [trackId]);
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
      console.log("RESULT FROM PY:", result);

      await run(
        db,
        `UPDATE analyses
         SET status = 'done',
             result_json = ?,
             error_message = NULL
         WHERE id = ?`,
        [JSON.stringify(result), lastID]
      );

      const check = await get(
        db,
        "SELECT result_json FROM analyses WHERE id = ?",
        [lastID]
      );
      console.log("SAVED result_json length:", check?.result_json?.length);

      const analysis = await get(
        db,
        "SELECT * FROM analyses WHERE id = ?",
        [lastID]
      );

      return res.status(201).json({ analysis });
    } catch (err) {
      const details =
        err?.payload
          ? JSON.stringify(err.payload)
          : err?.stderr
          ? String(err.stderr)
          : err?.message
          ? String(err.message)
          : "Unknown analysis error";

      await run(
        db,
        `UPDATE analyses
         SET status = 'error',
             error_message = ?
         WHERE id = ?`,
        [details, lastID]
      );

      return res.status(502).json({
        error: "Analysis failed",
        details,
        analysisId: lastID,
        trackId,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    if (db) db.close();
  }
});

router.get("/analysis/:trackId", async (req, res, next) => {
  const trackId = Number(req.params.trackId);
  let db;

  try {
    db = await openDb();
    await ensureAnalysesTable(db);

    const analysis = await get(
      db,
      `
      SELECT *
      FROM analyses
      WHERE track_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [trackId]
    );

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const parsedResult = analysis.result_json
      ? JSON.parse(analysis.result_json)
      : null;

    return res.json({
      analysis: {
        ...analysis,
        result: parsedResult,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (db) db.close();
  }
});

export default router;
