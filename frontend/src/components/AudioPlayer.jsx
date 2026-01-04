export default function AudioPlayer({ setAudio, onAnalysis, presenceRef }) {
  async function handleFile(file) {
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    audio.crossOrigin = "anonymous";

    await audio.play();
    setAudio(audio);

    audio.onended = () => {
      audio.dispatchEvent(new Event("ended-by-user"));
    };

    // Backend analysis (once)
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

  function onInputChange(e) {
    handleFile(e.target.files[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="
      intro-overlay
        fixed inset-0 z-20
        flex items-center justify-center
        text-white
        bg-black/30 backdrop-blur-lg
      "
    >
      <label className="flex flex-col items-center text-center gap-6 px-6 max-w-xl cursor-pointer">
        {/* Concept */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-display tracking-wide">
            Sound is ... embodied
          </h1>

          <p className="font-italic text-base md:text-lg opacity-80 leading-relaxed">
            ..not understood by the mind,
            <br />
            but felt in the body.
          </p>
        </div>

        {/* Divider (subtle) */}
        <div className="w-12 h-px bg-white/20 my-2" />

        {/* Instruction */}
        <span className="text-sm font-primary tracking-wide opacity-70">
          Drop music or click to begin
        </span>

        <input
          type="file"
          accept="audio/*"
          onChange={onInputChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
