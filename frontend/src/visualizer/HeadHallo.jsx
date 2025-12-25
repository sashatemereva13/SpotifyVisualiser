import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function HeadHallo({ intensity = 0.5 }) {
  const haloRef = useRef();
  const baseY = 2.5;

  useFrame((state, delta) => {
    if (!haloRef.current) return;

    // slow rotation

    const t = state.clock.getElapsedTime();

    // 2️⃣ tilt up one side / down the other
    haloRef.current.rotation.x = Math.PI / 2;
    haloRef.current.rotation.z = Math.sin(t * 0.6) * 0.8;

    // 3️⃣ subtle vertical lift with phase shift (feels alive)
    haloRef.current.position.y = baseY + Math.sin(t * 0.6 + Math.PI / 2) * 0.5;

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
    <mesh ref={haloRef} position={[0, 2.9, 0]}>
      <torusGeometry args={[0.55, 0.035, 16, 100]} />
      <meshStandardMaterial
        color="#1DE9B6"
        emissive="#1DE9B6"
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
