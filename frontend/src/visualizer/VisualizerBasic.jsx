import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import FractalNode from "./fractal/FractalNode";
import CentralAura from "./person/CentralAura";
import { OrbitControls } from "@react-three/drei";
import RealtimeAudioDriver from "../utils/RealtimeAudioDriver";
import StructuralAudioDriver from "../utils/StructuralAudioDriver";
import PlaybackStateController from "../utils/PlaybackStateController";

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

const dpr =
  typeof window !== "undefined"
    ? Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75)
    : 1;

export default function VisualizerBasic({ audio, data, onPlaybackChange }) {
  const [qualityMode, setQualityMode] = useState("auto"); // "auto" | "manual"
  const [qualityPreset, setQualityPreset] = useState("high"); // "low" | "med" | "high"

  const [isAdapting, setIsAdapting] = useState(false);

  const [uiVisible, setUiVisible] = useState(false);
  const hideTimeout = useRef(null);

  const rmsRef = useRef(0);
  const bandsRef = useRef({ low: 0, mid: 0, high: 0 });
  const beatRef = useRef(0);
  const audioReadyRef = useRef(false);

  const playbackStateRef = useRef("idle");

  const showUI = () => {
    setUiVisible(true);

    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    hideTimeout.current = setTimeout(() => {
      setUiVisible(false);
    }, 2500);
  };

  const structuralRef = useRef({
    energy: 0,
    centroid: 0,
    rolloff: 0,
    zcr: 0,
  });

  /* -------------------------------
     AUDIO END → ENDING
  -------------------------------- */
  useEffect(() => {
    if (!audio) return;

    const handleEnd = () => {
      playbackStateRef.current = "ending";
      onPlaybackChange?.(false);
    };

    audio.addEventListener("ended", handleEnd);

    window.addEventListener("mousemove", showUI);
    window.addEventListener("touchstart", showUI);

    return () => {
      audio.removeEventListener("ended", handleEnd);
      window.removeEventListener("mousemove", showUI);
      window.removeEventListener("touchstart", showUI);
    };
  }, [audio]);

  return (
    <>
      <div
        className="absolute top-4 right-4 z-50"
        style={{
          opacity: uiVisible ? 1 : 0,
          pointerEvents: uiVisible ? "auto" : "none",
        }}
      >
        <div className="backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl p-3 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80 mb-2">
            perf
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setQualityMode("auto")}
              className={`px-3 py-1 rounded-xl ${
                qualityMode === "auto" ? "bg-white/20" : "bg-white/5"
              }`}
            >
              auto
            </button>

            <button
              onClick={() => setQualityMode("manual")}
              className={`px-3 py-1 rounded-xl ${
                qualityMode === "manual" ? "bg-white/20" : "bg-white/5"
              }`}
            >
              manual
            </button>
          </div>

          {qualityMode === "manual" && (
            <div className="flex gap-2">
              {["low", "med", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setQualityPreset(p)}
                  className={`px-3 py-1 rounded-xl ${
                    qualityPreset === p ? "bg-white/20" : "bg-white/5"
                  }`}
                >
                  {p.toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {qualityMode === "auto" && isAdapting && (
        <div className="mt-2 text-[11px] text-white/60 tracking-wide animate-pulse">
          optimizing for your device
        </div>
      )}

      <div className="relative w-full h-full">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          <PlaybackStateController
            audio={audio}
            beatRef={beatRef}
            audioReadyRef={audioReadyRef}
            playbackStateRef={playbackStateRef}
            onPlaybackChange={onPlaybackChange}
          />

          <FractalNode
            scale={2}
            rmsRef={rmsRef}
            bandsRef={bandsRef}
            beatRef={beatRef}
            structuralRef={structuralRef}
            audioReadyRef={audioReadyRef}
            playbackStateRef={playbackStateRef}
            qualityMode={qualityMode}
            qualityPreset={qualityPreset}
            onPerformanceAdapt={setIsAdapting}
          />

          <OrbitControls
            enabled={playbackStateRef.current === "playing"}
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.25}
          />

          {audio && (
            <RealtimeAudioDriver
              audio={audio}
              rmsRef={rmsRef}
              bandsRef={bandsRef}
              beatRef={beatRef}
              audioReadyRef={audioReadyRef}
            />
          )}

          {audio && data && (
            <StructuralAudioDriver
              audio={audio}
              analysis={data}
              structuralRef={structuralRef}
            />
          )}

          <CentralAura
            beatRef={beatRef}
            rmsRef={rmsRef}
            bandsRef={bandsRef}
            structuralRef={structuralRef}
            audioReadyRef={audioReadyRef}
            playbackStateRef={playbackStateRef}
          />
        </Canvas>
      </div>
    </>
  );
}
