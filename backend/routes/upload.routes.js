import express from "express";
import multer from "multer";
import { uploadTrack } from "../controllers/uploadController.js";

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || "./uploads";

// ---- Multer config (routes layer responsibility) ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// ---- Route ----
router.post("/upload", upload.single("file"), uploadTrack);

export default router;
