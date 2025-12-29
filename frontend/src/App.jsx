import { useState } from "react";
import VisualizerBasic from "./visualizer/VisualizerBasic";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark">
      <div className="absolute inset-0 z-1">
        <VisualizerBasic
          data={analysis}
          audio={audio}
          onPlaybackChange={setIsPlaying}
        />
      </div>

      <h1 className="absolute top-0 left-0 p-10 z-10 text-white font-display text-3xl">
        Spotify Visualizer
      </h1>
      {!isPlaying && (
        <div className="bg-white bottom-0 left-0 p-3 m-10 font-primary absolute z-10 bottom-1">
          <AudioPlayer setAudio={setAudio} onAnalysis={setAnalysis} />
        </div>
      )}
    </div>
  );
}
