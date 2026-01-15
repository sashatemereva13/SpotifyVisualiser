const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all uploaded tracks
 */
export async function fetchTracks() {
  const res = await fetch(`${API_URL}/tracks`);
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}

/**
 * Upload a new audio track
 */
export async function uploadTrack(file) {
  const formData = new FormData();
  formData.append("file", file); // ✅ must be "file"

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

/**
 * Run analysis for a track
 */
export async function analyzeTrack(trackId) {
  const res = await fetch(`${API_URL}/analysis/${trackId}/run`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

/**
 * Get latest analysis for a track
 */
export async function getLatestAnalysis(trackId) {
  const res = await fetch(`${API_URL}/analysis/${trackId}/latest`);
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}
