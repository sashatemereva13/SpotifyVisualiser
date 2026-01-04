import { openDb, all, get } from "../db/sqlite.js";

export async function getAllTracks(limit = 100) {
  const db = await openDb();

  const rows = await all(
    db,
    `SELECT id, original_name, filename, mime_type, size_bytes, created_at
     FROM tracks
     ORDER BY id DESC
     LIMIT ?`,
    [limit]
  );

  db.close();
  return rows;
}

export async function getTrackById(id) {
  const db = await openDb();

  const track = await get(db, `SELECT * FROM tracks WHERE id = ?`, [id]);

  db.close();
  return track || null;
}
