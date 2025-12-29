import express from 'express';
import {
  addTrack,
  getTracks,
  getAnalysisByTrackId,
  addAnalysis
} from '../db/db.js';

import { runAnalysis } from '../services/analysisRunner.js';

const router = express.Router();

// ------------------
// GET all tracks
// ------------------
router.get('/tracks', async (req, res) => {
  const tracks = await getTracks();
  res.json(tracks);
});

// ------------------
// GET analysis for track
// ------------------
router.get('/tracks/:id/analysis', async (req, res) => {
  const trackId = req.params.id;

  let analysis = await getAnalysisByTrackId(trackId);

  if (!analysis) {
    // If analysis not found → compute it
    analysis = await runAnalysis(trackId);
  }

  res.json(analysis);
});

export default router;

