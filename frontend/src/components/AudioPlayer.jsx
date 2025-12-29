export default function AudioPlayer({ setAudio, onAnalysis }) {
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
        fixed inset-0 z-20
        flex items-center justify-center
        text-white
        cursor-pointer
        bg-black/40 backdrop-blur-md
        transition-opacity
        hover:bg-black/50
      "
    >
      <label className="flex flex-col items-center gap-4">
        <span className="text-2xl font-display tracking-wide">
          Drop music or click to begin
        </span>

        <span className="text-sm opacity-70">
          An emotional body reacting to rhythm & frequency
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
