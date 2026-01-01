import { useRef, useEffect } from "react";
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
  const rmsRef = useRef(0);
  const bandsRef = useRef({ low: 0, mid: 0, high: 0 });
  const beatRef = useRef(0);
  const audioReadyRef = useRef(false);

  const playbackStateRef = useRef("idle");
  /*
    idle → anticipation → awakening → playing → ending → idle
  */

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

    return () => {
      audio.removeEventListener("ended", handleEnd);
    };
  }, [audio]);

  return (
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
  );
}
