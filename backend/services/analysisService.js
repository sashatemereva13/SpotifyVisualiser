import { openDb, get, run } from "../db/sqlite.js";
import { runAnalysis as callPython } from "./analysisClient.js";

export async function runAnalysis(track) {
  try {
    const result = await callPython(track.path);

    const db = await openDb();
    await run(
      db,
      `INSERT INTO analyses
       (track_id, status, result_json, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [track.id, "success", JSON.stringify(result)]
    );
    db.close();

    return result;
  } catch (err) {
    const db = await openDb();
    await run(
      db,
      `INSERT INTO analyses
       (track_id, status, error_message, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [track.id, "error", err.message]
    );
    db.close();

    throw err;
  }
}

export async function getLatestAnalysisForTrack(trackId) {
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

  if (!row) return null;

  return {
    track_id: row.track_id,
    status: row.status,
    error: row.error_message || null,
    result: row.result_json ? JSON.parse(row.result_json) : null,
    created_at: row.created_at,
  };
}
