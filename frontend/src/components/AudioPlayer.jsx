export default function AudioPlayer({ file, setAudio }) {
  async function playFile(file) {
    const audio = new Audio(
      `${import.meta.env.VITE_API_URL}/tracks/${track.id}/audio`
    );
    audio.crossOrigin = "anonymous";
    audio.play();
    setAudio(audio);
  }

  if (!file) return null;

  playFile(file);

  return null;
}
