import { useState } from "react";
import { uploadTrack, analyzeTrack } from "../api/tracks";

export default function UploadTrack({ onReady }) {
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(file) {
    if (!file || !confirmed) return;

    setLoading(true);

    // 1. Upload the track
    const { track } = await uploadTrack(file);

    // 2. Analyze the track
    const { analysis } = await analyzeTrack(track.id);

    // 3. Hand off to App
    onReady({ track, analysis, file });

    setLoading(false);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      className="
      font-primary
        fixed inset-0 z-20
        flex items-center justify-center
        text-white
        bg-black/60 backdrop-blur-lg
      "
    >
      <label className="flex flex-col items-center text-center gap-6 px-6 max-w-xl cursor-pointer">
        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-display tracking-wide">
            Sound is … embodied
          </h1>
          <p className="font-italic opacity-80">
            not understood by the mind,
            <br />
            but felt in the body.
          </p>
        </div>

        {/* Rights */}
        <label className="flex items-center gap-2 text-sm opacity-80">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I confirm that I have the rights to upload this audio.
        </label>

        <span className="text-sm opacity-60">Drop music or click to begin</span>

        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading && <p className="text-xs opacity-60">Analyzing…</p>}
      </label>
    </div>
  );
}
