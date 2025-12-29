import FractalSDF from "./FractalSDF";

export default function FractalNode({ scale = 1, rmsRef, bandsRef, beatRef }) {
  return (
    <group position={[0, 0, -5]} scale={scale}>
      <FractalSDF rmsRef={rmsRef} bandsRef={bandsRef} beatRef={beatRef} />
    </group>
  );
}
