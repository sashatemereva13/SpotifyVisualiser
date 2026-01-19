import { useState } from "react";
import { uploadTrack, analyzeTrack } from "../api/tracks";

export default function UploadTrack({ onReady }) {
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(file) {
    if (!file || !confirmed) return;

    if (!confirmed) {
      alert("Please confirm you have the rights to this audio.");
      return;
    }

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
        if (!confirmed || loading) return;
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
      <div
        className={`
          flex flex-col items-center text-center gap-6 px-6 max-w-xl
          transition-all duration-500 ease-out
          ${confirmed ? "scale-[1.02]" : "scale-100"}
        `}
      >
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
        <button
          type="button"
          aria-pressed={confirmed}
          aria-label="Confirm rights to upload audio"
          onClick={() => setConfirmed((v) => !v)}
          className="
    group relative
    w-16 h-16
    flex items-center justify-center
    rounded-full
    transition-transform duration-500
    focus:outline-none
    hover:scale-[1.05]
  "
        >
          {/* Glow */}
          {confirmed && (
            <span className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
          )}

          <span
            className="
    absolute inset-0 rounded-full
    transition-all duration-300
    group-hover:scale-[1.08]
    group-hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]
  "
          />

          <span
            className={`
    absolute
    w-15 h-15
    rounded-full
    bg-white
    transition-all duration-500
    ${confirmed ? "scale-0 opacity-0" : "shadow-inner shadow-black/80"}
    group-hover:scale-110
  `}
          />

          {/* SVG Sigil */}
          <svg viewBox="0 0 100 100" className="w-14 h-14" fill="none">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-white/70"
              strokeWidth="1.5"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={confirmed ? "0" : "1"}
              style={{
                transition: "stroke-dashoffset 0.9s ease-out",
              }}
            />

            <path
              d="M50 28
         L50 50
         L66 66
         M50 50
         L34 66"
              className="stroke-white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={confirmed ? "0" : "1"}
              style={{
                transition: "stroke-dashoffset 1.1s ease-out 0.15s",
              }}
            />
          </svg>
        </button>

        {/* explain why */}
        <p className="text-xs opacity-60 tracking-wide">
          {confirmed
            ? "Rights confirmed"
            : "press to concent your rights to use a song"}
        </p>

        {/* can't click unless confirmed the rights */}
        <label
          htmlFor={confirmed && !loading ? "audio-upload" : undefined}
          className={`
    text-sm transition-all duration-300
    ${
      confirmed && !loading
        ? "opacity-80 cursor-pointer hover:opacity-100"
        : "opacity-40 cursor-not-allowed"
    }
  `}
        >
          {confirmed
            ? "Drop music or click to begin"
            : "Confirm rights to unlock"}
        </label>

        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          disabled={!confirmed || loading}
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading && <p className="text-xs opacity-60">Analyzing…</p>}
      </div>
    </div>
  );
}
