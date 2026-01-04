import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  "audio/mpeg",   
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/flac",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_\-]/gi, "_")
      .slice(0, 50);

    const unique = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}_${unique}${ext.toLowerCase()}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed: mp3/wav/flac`
      ),
      false
    );
  }
  cb(null, true);
}

export const uploadSingleAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, 
  },
}).single("file");
