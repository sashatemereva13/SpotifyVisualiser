export default function AudioPlayer({ onPlay }) {
  function handlePlay(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    audio.play();

    if (onPlay) onPlay(audio);
  }

  return <input type="file" accept="audio/*" onChange={handlePlay} />;
}
