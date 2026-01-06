import express from "express";
import {
  listTracks,
  getTrack,
  streamTrack,
} from "../controllers/tracksController.js";

const router = express.Router();

// List tracks
router.get("/", listTracks);

// Get single track
router.get("/:trackId", getTrack);

// stream track audio
router.get("/:trackId/audio", streamTrack);

export default router;
