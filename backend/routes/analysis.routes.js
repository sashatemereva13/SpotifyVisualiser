import express from "express";
import {
  analyzeTrack,
  getLatestAnalysis,
} from "../controllers/analysisController.js";

const router = express.Router();

// Run analysis
router.post("/:trackId/run", analyzeTrack);

// Get latest analysis
router.get("/:trackId/latest", getLatestAnalysis);

export default router;
