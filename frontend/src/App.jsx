import { useRef, useState } from "react";
import VisualizerBasic from "./visualizer/VisualizerBasic";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const presenceRef = useRef(0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark">
      <div className="absolute inset-0 z-1">
        <VisualizerBasic
          data={analysis}
          audio={audio}
          onPlaybackChange={setIsPlaying}
          presenceRef={presenceRef}
        />
      </div>

      <div className="intro-overlay fixed inset-0 z-20 flex items-center justify-center text-white bg-black/60 backdrop-blur-lg">
        <AudioPlayer
          setAudio={setAudio}
          onAnalysis={setAnalysis}
          presenceRef={presenceRef}
        />
      </div>
    </div>
  );
}
