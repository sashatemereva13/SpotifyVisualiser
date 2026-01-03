import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { fragment } from "./fragment";

/* --------------------------------------------------
   Device capability detection
-------------------------------------------------- */

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

/* --------------------------------------------------
   Vertex shader (simple UV passthrough)
-------------------------------------------------- */

const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* --------------------------------------------------
   Custom shader material
-------------------------------------------------- */

const FractalMaterial = shaderMaterial(
  {
    uTime: 0,
    uEnergy: 0,
    uMood: 0,
    uAnticipation: 0,
    uQuality: isMobile ? 0.0 : 1.0,
  },
  vertex,
  fragment
);

extend({ FractalMaterial });

/* ==================================================
   FRACTAL SDF COMPONENT
================================================== */

export default function FractalSDF({
  /* -------- Performance feedback (UI hook) -------- */
  onPerformanceAdapt,

  /* -------- Audio-driven refs -------- */
  rmsRef,
  beatRef,
  structuralRef,
  audioReadyRef,
  playbackStateRef,

  /* -------- Quality control -------- */
  qualityMode = "auto", // "auto" | "manual"
  qualityPreset = "high", // "low" | "med" | "high"
}) {
  const mat = useRef();

  /* --------------------------------------------------
     INTERNAL VISUAL STATE (smoothed)
  -------------------------------------------------- */

  const smoothedEnergy = useRef(0);
  const beatEnergy = useRef(0);
  const mood = useRef(0);

  const readyBlend = useRef(0);
  const anticipation = useRef(0);

  /* --------------------------------------------------
     PERFORMANCE / QUALITY STATE
  -------------------------------------------------- */

  const quality = useRef(isMobile ? 0.0 : 1.0);

  const fpsEma = useRef(60); // smoothed FPS
  const frameCount = useRef(0);
  const timeAcc = useRef(0);

  const isAdapting = useRef(false);
  const lastAdapting = useRef(false);

  /* --------------------------------------------------
     INITIAL QUALITY SETUP
  -------------------------------------------------- */

  useEffect(() => {
    if (mat.current) {
      mat.current.uQuality = quality.current;
    }
  }, []);

  /* ==================================================
     MAIN FRAME LOOP
  ================================================== */

  useFrame((state, delta) => {
    if (!mat.current || !rmsRef) return;

    const playbackState = playbackStateRef?.current ?? "idle";

    /* ----------------------------------------------
       1. PERFORMANCE / QUALITY MANAGEMENT
       (always runs, even if visuals are idle)
    ---------------------------------------------- */

    timeAcc.current += delta;
    frameCount.current += 1;

    let targetQuality = quality.current;

    // Re-evaluate ~4 times per second
    if (timeAcc.current > 0.25) {
      const fps = frameCount.current / timeAcc.current;

      // Exponential moving average to stabilize FPS
      fpsEma.current = THREE.MathUtils.lerp(fpsEma.current, fps, 0.25);

      if (qualityMode === "auto") {
        // Hysteresis-tuned thresholds (prevents oscillation)
        if (fpsEma.current < 43) targetQuality = 0.2;
        else if (fpsEma.current < 53) targetQuality = 0.45;
        else if (fpsEma.current < 58) targetQuality = 0.75;
        else targetQuality = 1.0;
      } else {
        // Manual presets
        if (qualityPreset === "low") targetQuality = 0.0;
        else if (qualityPreset === "med") targetQuality = 0.55;
        else targetQuality = 1.0;
      }

      timeAcc.current = 0;
      frameCount.current = 0;
    }

    // Smooth quality transitions (no popping)
    const prevQuality = quality.current;
    quality.current = THREE.MathUtils.lerp(
      quality.current,
      targetQuality,
      0.35
    );

    quality.current = THREE.MathUtils.clamp(quality.current, 0, 1);

    // Detect adaptation activity
    isAdapting.current = Math.abs(prevQuality - quality.current) > 0.02;

    if (isAdapting.current !== lastAdapting.current) {
      onPerformanceAdapt?.(isAdapting.current);
      lastAdapting.current = isAdapting.current;
    }

    /* ----------------------------------------------
       3. EARLY EXIT FOR IDLE STATE (visual only)
    ---------------------------------------------- */

    if (
      playbackState === "idle" &&
      readyBlend.current < 0.01 &&
      anticipation.current < 0.01
    ) {
      mat.current.uQuality = quality.current;
      return;
    }

    /* ----------------------------------------------
       4. ANTICIPATION STATE (slow, emotional)
    ---------------------------------------------- */

    anticipation.current = THREE.MathUtils.damp(
      anticipation.current,
      playbackState === "anticipation" ? 1 : 0,
      1.6,
      delta
    );

    /* ----------------------------------------------
       5. AUDIO READINESS GATE
    ---------------------------------------------- */

    readyBlend.current = THREE.MathUtils.damp(
      readyBlend.current,
      audioReadyRef?.current ? 1 : 0,
      2,
      delta
    );

    const readiness = readyBlend.current;

    /* ----------------------------------------------
       6. REALTIME AUDIO ENERGY
    ---------------------------------------------- */

    const rms = rmsRef.current ?? 0;
    const beat = beatRef?.current ?? 0;

    const energyTarget = Math.pow(rms, 0.7);

    smoothedEnergy.current = THREE.MathUtils.damp(
      smoothedEnergy.current,
      energyTarget,
      6,
      delta
    );

    beatEnergy.current = THREE.MathUtils.damp(
      beatEnergy.current,
      beat,
      12,
      delta
    );

    const realtimeEnergy =
      smoothedEnergy.current * 4.4 + beatEnergy.current * 7.2;

    /* ----------------------------------------------
       7. STRUCTURAL MOOD (backend / analysis)
    ---------------------------------------------- */

    const structural = structuralRef?.current;
    const moodTarget = structural?.rolloff ?? 0;

    mood.current = THREE.MathUtils.damp(mood.current, moodTarget, 1.2, delta);

    /* ----------------------------------------------
       8. FINAL UNIFORM COMPOSITION
    ---------------------------------------------- */

    mat.current.uTime =
      state.clock.elapsedTime *
      (0.15 + anticipation.current * 0.35 + readiness * 0.5);

    mat.current.uEnergy =
      (anticipation.current * 0.25 + realtimeEnergy) * readiness;

    mat.current.uMood = mood.current * (0.3 + anticipation.current * 0.1);
    mat.current.uAnticipation = anticipation.current;
    mat.current.uQuality = quality.current;
  });

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <fractalMaterial
      ref={mat}
      transparent
      depthWrite={false}
      depthTest={false}
    />
  );
}
