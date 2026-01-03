import FractalSDF from "./FractalSDF";

export default function FractalNode({
  scale = 1,
  rmsRef,
  bandsRef,
  beatRef,
  structuralRef,
  audioReadyRef,
  playbackStateRef,

  qualityMode,
  qualityPreset,
}) {
  return (
    <group position={[-1, 0, -5]} scale={scale}>
      <FractalSDF
        rmsRef={rmsRef}
        bandsRef={bandsRef}
        beatRef={beatRef}
        structuralRef={structuralRef}
        audioReadyRef={audioReadyRef}
        playbackStateRef={playbackStateRef}
        qualityMode={qualityMode}
        qualityPreset={qualityPreset}
      />
    </group>
  );
}
