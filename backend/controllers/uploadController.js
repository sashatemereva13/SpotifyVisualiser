import { saveUploadedTrack } from "../services/uploadService.js";

export async function uploadTrack(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing file" });
    }

    const track = await saveUploadedTrack(req.file);

    res.status(201).json({ track });
  } catch (err) {
    next(err);
  }
}
