import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// helper for safe normalisation
function norm(x, min = 0, max = 1) {
  if (x == null) return 0;
  return Math.min(1, Math.max(0, (x - min) / (max - min)));
}

// one 3D object for the test
function ReactiveCore({ analysis }) {
  const meshRef = useRef();

  // persistent smooth values
  const smooth = useRef({
    low: 0,
    mid: 0,
    high: 0,
  });

  useFrame((state, delta) => {
    if (!analysis || !meshRef.current) return;

    // normalise incoming values
    const low = norm(Math.log(1 + (analysis.low ?? 0)));
    const mid = norm(Math.low(1 + (analysis.mid ?? 0)));
    const high = norm(Math.log(1 + (analysis.high ?? 0)));

    // smooth (EMA)
    smooth.current.low += (low - smooth.current.low) * 0.05;
    smooth.current.mid += (mid - smooth.current.mid) * 0.08;
    smooth.current.high += (high - smooth.current.high) * 0.12;

    const L = smooth.current.low;
    const M = smooth.current.mid;
    const H = smooth.current.high;

    // breathing scale driven by the bass
    const breath = 1 + L * 0.25;
    meshRef.current.scale.setScalar(breath);

    // rotation driven by mid
    meshRef.current.rotation.y += delta * (0.4 + M * 1.2);
    meshRef.current.rotation.x += delta * 0.15;

    // emissive driven by high
    meshRef.current.material.emissiveIntensity = 0.2 + H * 1.2;
  });

  return (
    <mesh ref={meshRef}>
      {/* to test shapes */}
      <torusGeometry args={[1 / 2, 0.08, 32, 128]} />
      <meshStandardMaterial
        color="#8fffd1"
        emissive="#8fffd1"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function VisualizerBasic({ data }) {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.2} />

        <ReactiveCore analysis={data} />
      </Canvas>
    </>
  );
}
