import FractalSDF from "./FractalSDF";
import FullScreenPlane from "./FullScreenPlane";

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
  onPerformanceAdapt,
}) {
  return (
    <group position={[-1, 0, -5]} scale={scale}>
      <FullScreenPlane>
        <FractalSDF
          rmsRef={rmsRef}
          beatRef={beatRef}
          structuralRef={structuralRef}
          audioReadyRef={audioReadyRef}
          playbackStateRef={playbackStateRef}
          qualityMode={qualityMode}
          qualityPreset={qualityPreset}
          onPerformanceAdapt={onPerformanceAdapt}
        />
      </FullScreenPlane>
    </group>
  );
}
