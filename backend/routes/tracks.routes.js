import express from "express";
import { listTracks, getTrack } from "../controllers/tracksController.js";

const router = express.Router();

// List tracks
router.get("/", listTracks);

// Get single track
router.get("/:id", getTrack);

export default router;
