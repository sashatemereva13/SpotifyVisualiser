import { openDb, all, get } from "../db/sqlite.js";

export async function getAllTracks(limit = 100) {
  const db = await openDb();

  try {
    return await all(
      db,
      `SELECT id, original_name, filename, mime_type, size_bytes, created_at
       FROM tracks
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
  } finally {
    db.close();
  }
}

export async function getTrackById(id) {
  const db = await openDb();

  try {
    return await get(db, `SELECT * FROM tracks WHERE id = ?`, [id]);
  } finally {
    db.close();
  }
}
