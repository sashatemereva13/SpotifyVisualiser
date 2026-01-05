const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTracks() {
  const res = await fetch(`${API_URL}/tracks`);
  return res.json();
}

export async function uploadTrack(file) {
  const formData = new FormData();
  formData.append("track", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function analyzeTrack(trackId) {
  const res = await fetch(`${API_URL}/tracks/${tracksId}/analyze`, {
    method: "POST",
  });
  return res.json();
}
