import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { openDb, all, run } from "../db/sqlite.js";

const router = Router();

router.post("/admin/cleanup", async (req, res, next) => {
  const days = Math.max(1, Number(req.query.days || 7));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  let db;
  try {
      db = await openDb();
      
    const oldTracks = await all(
      db,
      "SELECT id, path FROM tracks WHERE created_at < ?",
      [cutoff]
    );

    let deletedFiles = 0;
    for (const t of oldTracks) {
      try {
        if (t.path) await fs.unlink(t.path);
        deletedFiles++;
      } catch {
      }
    }

    await run(
      db,
      "DELETE FROM analyses WHERE track_id IN (SELECT id FROM tracks WHERE created_at < ?)",
      [cutoff]
    );

    const result = await run(db, "DELETE FROM tracks WHERE created_at < ?", [cutoff]);

    res.json({
      ok: true,
      cutoff,
      days,
      tracksDeleted: result.changes,
      filesDeleted: deletedFiles,
    });
  } catch (err) {
    next(err);
  } finally {
    if (db) db.close();
  }
});

export default router;
