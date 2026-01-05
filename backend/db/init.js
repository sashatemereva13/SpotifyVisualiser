import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { openDb, run } from "./sqlite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, "../uploads");

  fs.mkdirSync(uploadDir, { recursive: true });

  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  const statements = schemaSql.split(";").map(s => s.trim()).filter(Boolean);

  const db = await openDb();
  for (const stmt of statements) {
    await run(db, stmt);
  }
  db.close();
}
