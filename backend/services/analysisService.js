import { openDb, get, run } from "../db/sqlite.js";
import { runAnalysis as callPython } from "./analysisClient.js";

export async function runAnalysis(track) {
  let result;

  try {
    // 1. Run Python analysis
    result = await callPython(track.path);

    // 2. Persist success
    const db = await openDb();
    try {
      await run(
        db,
        `INSERT INTO analyses
         (track_id, status, result_json, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [track.id, "success", JSON.stringify(result)]
      );
    } finally {
      db.close();
    }

    return result;
  } catch (err) {
    // 3. Persist failure
    const db = await openDb();
    try {
      await run(
        db,
        `INSERT INTO analyses
         (track_id, status, error_message, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [track.id, "error", err.message]
      );
    } finally {
      db.close();
    }

    throw err;
  }
}

export async function getLatestAnalysisForTrack(trackId) {
  const db = await openDb();

  try {
    const row = await get(
      db,
      `SELECT track_id, status, result_json, error_message, created_at
       FROM analyses
       WHERE track_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [trackId]
    );

    if (!row) return null;

    return {
      track_id: row.track_id,
      status: row.status,
      error: row.error_message || null,
      result: row.result_json ? JSON.parse(row.result_json) : null,
      created_at: row.created_at,
    };
  } finally {
    db.close();
  }
}
