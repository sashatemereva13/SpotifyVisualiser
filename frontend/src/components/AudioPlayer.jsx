export default function AudioPlayer({ onAnalysis }) {
  async function handlePlay(e) {
    const file = e.target.files[0];
    if (!file) return;

    // play audio locally
    const audio = new Audio(URL.createObjectURL(file));
    audio.play();

    // send to backend
    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/api/tracks`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();
      console.log("BACKEND RESPONSE:", data);

      onAnalysis?.(data.analysis);
      console.log("ANALYSIS SENT TO VISUALISER");
    } catch (err) {
      console.error("Analysis failed", err);
    }
  }


  return (
    <input
      className="bg-amber text-dark px-4 py-2 rounded"
      type="file"
      accept="audio/*"
      onChange={handlePlay}
    />
  );
}
