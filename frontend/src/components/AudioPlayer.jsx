/**
 * AudioPlayer
 * ---------------------------------------------
 * Responsibilities:
 *
 * 1) REAL-TIME AUDIO PLAYBACK (Web Audio API)
 *    - Creates and maintains a single HTMLAudioElement
 *    - This audio element is:
 *        • played to the user
 *        • analyzed in real time via AudioContext + AnalyserNode
 *    - Drives live visuals:
 *        • RMS (energy)
 *        • frequency bands
 *        • beat impulses
 *
 * 2) OFFLINE / STRUCTURAL AUDIO ANALYSIS (Backend)
 *    - Sends the uploaded audio file once to the backend (librosa)
 *    - Receives precomputed analysis:
 *        • tempo
 *        • centroid
 *        • RMS timeline
 *        • spectral features
 *    - Used for slow, structural, or identity-level visuals
 *
 * IMPORTANT ARCHITECTURAL NOTES:
 * ---------------------------------------------
 * - The HTMLAudioElement is created ONCE and reused.
 * - Only ONE MediaElementSourceNode may ever be created
 *   from this audio element (Web Audio API constraint).
 * - Real-time analysis MUST NOT rely on backend data.
 * - Backend analysis is static and runs once per upload.
 *
 * Mental model:
 *   Backend analysis = "sheet music"
 *   Web Audio API    = "musician playing live"
 */

export default function AudioPlayer({ audioRef, onAnalysis }) {
  async function handlePlay(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }

    audioRef.current.src = URL.createObjectURL(file);
    await audioRef.current.play();

    // backend analysis (once)
    const formData = new FormData();
    formData.append("file", file);

    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}/api/tracks`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    onAnalysis(data.analysis);
  }

  return <input type="file" accept="audio/*" onChange={handlePlay} />;
}
