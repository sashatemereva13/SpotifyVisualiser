import fs from "fs";
import path from "path";
import { openDb, run } from "./sqlite.js";

export async function initDb() {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  fs.mkdirSync(uploadDir, { recursive: true });

  const dbPath = process.env.DB_PATH || "./db/app.sqlite";
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const schemaSql = fs.readFileSync("./db/schema.sql", "utf-8");
  const statements = schemaSql.split(";").map(s => s.trim()).filter(Boolean);

  const db = await openDb();
  for (const stmt of statements) await run(db, stmt);
  db.close();
}
