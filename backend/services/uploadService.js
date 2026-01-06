import path from "path";
import fs from "fs";
import { openDb, run, get } from "../db/sqlite.js";

export async function saveUploadedTrack(file) {
  const absPath = path.resolve(file.path);

  try {
    await fs.promises.access(absPath);
  } catch {
    throw new Error("Uploaded file not found on disk");
  }

  const db = await openDb();
  const createdAt = new Date().toISOString();

  try {
    const ins = await run(
      db,
      `INSERT INTO tracks
     (original_name, filename, mime_type, size_bytes, path, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [
        file.originalname,
        file.filename,
        file.mimetype,
        file.size,
        absPath,
        createdAt,
      ]
    );

    const track = await get(db, `SELECT * FROM tracks WHERE id = ?`, [
      ins.lastID,
    ]);

    return track;
  } finally {
    db.close();
  }
}
