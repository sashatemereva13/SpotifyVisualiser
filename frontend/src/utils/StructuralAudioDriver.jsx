import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * StructuralAudioDriver
 * --------------------------------------------------
 * Samples BACKEND (offline) audio analysis data
 * based on current playback time.
 *
 * This driver provides:
 * - identity
 * - mood
 * - spectral character
 *
 * IMPORTANT:
 * - This is NOT realtime analysis
 * - Values must change SLOWLY
 * - Never produces impulses
 *
 * Mental model:
 *   RealtimeAudioDriver  = nervous system
 *   StructuralAudioDriver = personality / memory
 */
export default function StructuralAudioDriver({
  audio,
  analysis,
  structuralRef,
  audioReadyRef,
}) {
  // Internal smoothing (structural should evolve slowly)
  const smoothEnergy = useRef(0);
  const smoothCentroid = useRef(0);
  const smoothRolloff = useRef(0);
  const smoothZcr = useRef(0);

  useFrame((_, delta) => {
    if (
      !audio ||
      !analysis ||
      !analysis.rms ||
      !audio.duration ||
      !audioReadyRef?.current
    ) {
      return;
    }

    /* ---------------------------------------------
       1. Map current playback time → analysis index
    --------------------------------------------- */
    const tNorm = THREE.MathUtils.clamp(
      audio.currentTime / audio.duration,
      0,
      0.999
    );

    const idx = Math.floor(tNorm * analysis.rms.length);

    /* ---------------------------------------------
       2. Read backend analysis values
    --------------------------------------------- */
    const energy = analysis.rms[idx] ?? 0;
    const centroid = analysis.centroid[idx] ?? 0;
    const rolloff = analysis.rolloff[idx] ?? 0;
    const zcr = analysis.zcr[idx] ?? 0;

    /* ---------------------------------------------
       3. Normalize to [0,1] ranges
       (values are domain-dependent, so scaling is explicit)
    --------------------------------------------- */
    const energyNorm = THREE.MathUtils.clamp(energy, 0, 1);

    const centroidNorm = THREE.MathUtils.clamp(centroid / 8000, 0, 1);

    const rolloffNorm = THREE.MathUtils.clamp(rolloff / 12000, 0, 1);

    const zcrNorm = THREE.MathUtils.clamp(zcr * 3, 0, 1);

    /* ---------------------------------------------
       4. Smooth structural evolution
       (VERY IMPORTANT: no per-frame jitter)
    --------------------------------------------- */
    smoothEnergy.current = THREE.MathUtils.damp(
      smoothEnergy.current,
      energyNorm,
      1.2,
      delta
    );

    smoothCentroid.current = THREE.MathUtils.damp(
      smoothCentroid.current,
      centroidNorm,
      1.0,
      delta
    );

    smoothRolloff.current = THREE.MathUtils.damp(
      smoothRolloff.current,
      rolloffNorm,
      1.0,
      delta
    );

    smoothZcr.current = THREE.MathUtils.damp(
      smoothZcr.current,
      zcrNorm,
      1.0,
      delta
    );

    /* ---------------------------------------------
       5. Publish to shared structuralRef
       (read-only for visuals)
    --------------------------------------------- */
    structuralRef.current.energy = smoothEnergy.current;
    structuralRef.current.centroid = smoothCentroid.current;
    structuralRef.current.rolloff = smoothRolloff.current;
    structuralRef.current.zcr = smoothZcr.current;
  });

  return null;
}
