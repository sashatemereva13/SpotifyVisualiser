import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import FractalNode from "./fractal/FractalNode";
import CentralAura from "./person/CentralAura";
import { OrbitControls } from "@react-three/drei";
import RealtimeAudioDriver from "../utils/RealtimeAudioDriver";
import StructuralAudioDriver from "../utils/StructuralAudioDriver";
import PlaybackStateController from "../utils/PlaybackStateController";
import * as THREE from "three";
import PresenceController from "../utils/PresenceController";

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

const dpr =
  typeof window !== "undefined"
    ? Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75)
    : 1;

/** Smooths DOM parallax target -> render-friendly parallax (MUST live inside Canvas) */
function ParallaxController({ targetRef, outRef, strength = 1 }) {
  useFrame((_, delta) => {
    if (!targetRef?.current || !outRef?.current) return;

    outRef.current.x = THREE.MathUtils.damp(
      outRef.current.x,
      targetRef.current.x * strength,
      6,
      delta
    );

    outRef.current.y = THREE.MathUtils.damp(
      outRef.current.y,
      targetRef.current.y * strength,
      6,
      delta
    );
  });

  return null;
}

export default function VisualizerBasic({
  audio,
  data,
  onPlaybackChange,
  presenceRef,
}) {
  const [qualityMode, setQualityMode] = useState("auto"); // "auto" | "manual"
  const [qualityPreset, setQualityPreset] = useState("high"); // "low" | "med" | "high"
  const [isAdapting, setIsAdapting] = useState(false);

  const [uiVisible, setUiVisible] = useState(false);
  const hideTimeout = useRef(null);

  const rmsRef = useRef(0);
  const bandsRef = useRef({ low: 0, mid: 0, high: 0 });
  const beatRef = useRef(0);
  const audioReadyRef = useRef(false);

  // DOM-updated target (raw)
  const parallaxTargetRef = useRef({ x: 0, y: 0 });
  // Canvas-smoothed output
  const parallaxRef = useRef({ x: 0, y: 0 });

  const playbackStateRef = useRef("idle");

  const showUI = () => {
    setUiVisible(true);

    if (hideTimeout.current) clearTimeout(hideTimeout.current);

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
  }, [audio, onPlaybackChange]);

  // helper to update parallax target
  const setParallaxTarget = (x, y) => {
    parallaxTargetRef.current.x = THREE.MathUtils.clamp(x, -1, 1);
    parallaxTargetRef.current.y = THREE.MathUtils.clamp(y, -1, 1);
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setParallaxTarget(x, -y);
      }}
      onTouchMove={(e) => {
        if (!e.touches?.[0]) return;
        const t = e.touches[0];
        const x = (t.clientX / window.innerWidth - 0.5) * 2;
        const y = (t.clientY / window.innerHeight - 0.5) * 2;
        setParallaxTarget(x, -y);
      }}
    >
      {/* PERF UI overlay */}
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

      {/* Adaptation hint */}
      {qualityMode === "auto" && isAdapting && (
        <div className="absolute top-4 left-4 z-50 mt-2 text-[11px] text-white/60 tracking-wide animate-pulse">
          optimizing for your device
        </div>
      )}

      {/* Canvas */}
      <div className="absolute inset-0">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          <PresenceController
            audioReadyRef={audioReadyRef}
            presenceRef={presenceRef}
          />

          {/* Smooth parallax inside Canvas */}
          <ParallaxController
            targetRef={parallaxTargetRef}
            outRef={parallaxRef}
            strength={1}
          />

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
            parallax={parallaxRef} // optional if you want it
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
            parallax={parallaxRef}
            presenceRef={presenceRef}
          />
        </Canvas>
      </div>
    </div>
  );
}
