import { getAllTracks, getTrackById } from "../services/tracksService.js";
import fs from "fs";

export async function listTracks(req, res, next) {
  try {
    const tracks = await getAllTracks();
    res.json({ tracks });
  } catch (err) {
    next(err);
  }
}

export async function getTrack(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);

    if (!Number.isFinite(trackId)) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const track = await getTrackById(trackId);

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.json({ track });
  } catch (err) {
    next(err);
  }
}

export async function streamTrack(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);

    if (!Number.isFinite(trackId)) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const track = await getTrackById(trackId);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    const filePath = track.path;

    try {
      await fs.promises.access(filePath);
    } catch {
      return res.status(404).json({ error: "Audio file not found" });
    }

    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const contentType = track.mime_type || "application/octet-stream";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
}
