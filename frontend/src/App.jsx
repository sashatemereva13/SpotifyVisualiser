import { useRef, useState } from "react";
import VisualizerBasic from "./visualizer/VisualizerBasic";
import UploadTrack from "./components/UploadTrack";
import TrackList from "./components/TrackList";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [audio, setAudio] = useState(null);
  const [file, setFile] = useState(null);

  const presenceRef = useRef(0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark">
      <VisualizerBasic
        data={analysis}
        audio={audio}
        presenceRef={presenceRef}
      />

      {!analysis && (
        <UploadTrack
          onReady={({ analysis, file }) => {
            setAnalysis(analysis);
            setFile(file);

            const audio = new Audio(URL.createObjectURL(file));
            audio.crossOrigin = "anonymous";
            audio.play();
            setAudio(audio);
          }}
        />
      )}
    </div>
  );
}
