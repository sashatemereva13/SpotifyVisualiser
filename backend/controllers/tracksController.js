import { getAllTracks, getTracksById } from "../services/tracksService.js";

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
