import { getTrackById } from "../services/tracksService.js";
import { runAnalysis } from "../services/analysisService.js";
import { getLatestAnalysisForTrack } from "../services/analysisService.js";

export async function analyzeTrack(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);

    if (!Number.isFinite(trackId)) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const track = await getTrackById(trackId);

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    const analysis = await runAnalysis(track);

    res.json({
      trackId,
      analysis,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLatestAnalysis(req, res, next) {
  try {
    const trackId = Number(req.params.trackId);
    if (!Number.isFinite(trackId)) {
      return res.status(400).json({ error: "Invalid trackId" });
    }

    const analysis = await getLatestAnalysisForTrack(trackId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (err) {
    next(err);
  }
}
