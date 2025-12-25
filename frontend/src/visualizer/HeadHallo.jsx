import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function HeadHalo({ intensity = 0.5 }) {
  const haloRef = useRef();

  useFrame((_, delta) => {
    if (!haloRef.current) return;

    // slow rotation
    haloRef.current.rotation.y += delta * 0.6;
    haloRef.current.rotation.x += delta * 0.2;

    // gentle pulse (change later to map to centroid)
    const scale = 1 + intensity * 0.15;
    haloRef.current.scale.x = THREE.MathUtils.damp(
      haloRef.current.scale.x,
      scale,
      4,
      delta
    );

    haloRef.current.scale.y = THREE.MathUtils.damp(
      haloRef.current.scale.y,
      scale,
      4,
      delta
    );

    haloRef.current.scale.z = THREE.MathUtils.damp(
      haloRef.current.scale.z,
      scale,
      4,
      delta
    );
  });

  return (
    <mesh ref={haloRef} position={[0, 1.8, 0]}>
      <torusGeometry args={[0.55, 0.035, 16, 100]} />
      <meshStandardMaterial
        color="#A6D7C2"
        emissive="#A6D7C2"
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
