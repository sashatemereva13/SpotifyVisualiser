import { getAllTracks, getTracksById } from "../services/tracksService.js";
import path from "path";
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

    if (!trackId) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const track = await getTracksById(trackId);

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
    const track = await getTrackById(trackId);

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    const filePath = track.path;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Example: "bytes=12345-"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;

      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
}

router.get("/tracks/:trackId/audio", streamTrack);
