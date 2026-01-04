import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { openDb, run } from "./sqlite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  fs.mkdirSync(uploadDir, { recursive: true });

  const dbPath = process.env.DB_PATH || "./db/app.sqlite";
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  // ✅ FIX: absolute path to schema.sql
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const db = await openDb();
  for (const stmt of statements) {
    await run(db, stmt);
  }
  db.close();
}
