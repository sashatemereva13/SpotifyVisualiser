import express from "express";
import {
  analyzeTrack,
  getLatestAnalysis,
} from "../controllers/analysisController.js";

const router = express.Router();

// Run analysis
router.post("/:trackId", analyzeTrack);

// Get latest analysis
router.get("/:trackId", getLatestAnalysis);

export default router;
