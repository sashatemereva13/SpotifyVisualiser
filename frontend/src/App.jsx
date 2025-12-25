import { useState } from "react";
import VisualizerBasic from "./visualizer/VisualizerBasic";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  const [analysis] = useState({
    low: Array(200).fill(0.4),
    mid: Array(200).fill(0.7),
    high: Array(200).fill(0.2),
    tempo: 120,
  });

  return (
    <div>
      <h1>Spotify Visualizer</h1>
      <AudioPlayer />
      <VisualizerBasic data={analysis} />
    </div>
  );
}
