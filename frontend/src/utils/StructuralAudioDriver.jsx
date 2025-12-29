import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function StructuralAudioDriver({
  audio,
  analysis,
  structuralRef,
}) {
  useFrame(() => {
    if (!audio || !analysis || !audio.duration) return;

    const tNorm = THREE.MathUtils.clamp(
      audio.currentTime / audio.duration,
      0,
      0.999
    );

    const idx = Math.floor(tNorm * analysis.rms.length);

    const energy = analysis.rms[idx] ?? 0;
    const centroid = analysis.centroid[idx] ?? 0;
    const rolloff = analysis.rolloff[idx] ?? 0;
    const zcr = analysis.zcr[idx] ?? 0;

    // normalise spectral values
    structuralRef.current.energy = energy;
    structuralRef.current.centroid = THREE.MathUtils.clamp(
      centroid / 8000,
      0,
      1
    );

    structuralRef.current.rolloff = THREE.MathUtils.clamp(
      rolloff / 12000,
      0,
      1
    );

    structuralRef.current.zcr = THREE.MathUtils.clamp(zcr * 3, 0, 1);
  });

  return null;
}
