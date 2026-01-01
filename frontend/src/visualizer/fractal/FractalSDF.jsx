import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { fragment } from "./fragment";

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

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

export default function FractalSDF({
  rmsRef,
  beatRef,
  structuralRef,
  audioReadyRef,
  playbackStateRef,
}) {
  const mat = useRef();

  // --- Internal state ---
  const smoothedEnergy = useRef(0);
  const beatEnergy = useRef(0);
  const mood = useRef(0);

  const readyBlend = useRef(0);
  const anticipation = useRef(0);

  useEffect(() => {
    if (mat.current) {
      mat.current.uQuality = isMobile ? 0.0 : 1.0;
    }
  }, []);

  useFrame((state, delta) => {
    if (!mat.current || !rmsRef) return;

    const playbackState = playbackStateRef?.current ?? "idle";

    if (
      playbackState === "idle" &&
      readyBlend.current < 0.01 &&
      anticipation.current < 0.01
    ) {
      return;
    }

    /* --------------------------------------------------
       1. ANTICIPATION (state-driven, slow)
    -------------------------------------------------- */
    anticipation.current = THREE.MathUtils.damp(
      anticipation.current,
      playbackState === "anticipation" ? 1 : 0,
      1.6,
      delta
    );

    /* --------------------------------------------------
       2. READY BLEND (audio signal gate)
    -------------------------------------------------- */
    readyBlend.current = THREE.MathUtils.damp(
      readyBlend.current,
      audioReadyRef?.current ? 1 : 0,
      2,
      delta
    );

    const readiness = readyBlend.current;

    /* --------------------------------------------------
       3. REALTIME ENERGY (RMS + BEAT)
    -------------------------------------------------- */
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

    /* --------------------------------------------------
       4. STRUCTURAL MOOD (backend, very slow)
    -------------------------------------------------- */
    const structural = structuralRef?.current;
    const moodTarget = structural?.rolloff ?? 0;

    mood.current = THREE.MathUtils.damp(mood.current, moodTarget, 1.2, delta);

    /* --------------------------------------------------
       5. FINAL UNIFORM COMPOSITION
       (this is the important part)
    -------------------------------------------------- */

    // Time: calm → tense → alive
    mat.current.uTime =
      state.clock.elapsedTime *
      (0.15 + anticipation.current * 0.35 + readiness * 0.5);

    // Energy: compressed during anticipation, released during play
    mat.current.uEnergy =
      (anticipation.current * 0.25 + realtimeEnergy) * readiness;

    // Mood sharpens slightly during anticipation
    mat.current.uMood = mood.current * (0.3 + anticipation.current * 0.1);
    mat.current.uAnticipation = anticipation.current;
  });

  return (
    <mesh>
      <planeGeometry args={[3, 3, isMobile ? 64 : 128, isMobile ? 64 : 128]} />

      <fractalMaterial ref={mat} depthWrite={false} depthTest />
    </mesh>
  );
}
