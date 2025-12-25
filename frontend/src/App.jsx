import { useState } from "react";
import VisualizerBasic from "./visualizer/VisualizerBasic";
import AudioPlayer from "./components/AudioPlayer";

export default function App() {
  const [analysis, setAnalysis] = useState(null);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <VisualizerBasic data={analysis} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between p-6 text-white">
        <h1 className="font-display text-3xl">Spotify Visualizer</h1>

        <div className="font-primary">
          <AudioPlayer onAnalysis={setAnalysis} />
        </div>
      </div>
    </div>
  );
}
