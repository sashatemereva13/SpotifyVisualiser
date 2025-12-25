import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function AuraParticles({ count = 120 }) {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 0.6 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 3 - 1;

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }

    return positions;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y = t * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          itemsSize={3}
          count={particles.length / 3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.035}
        color="#1DE9B6"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlendign}
        depthWrite={false}
      />
    </points>
  );
}
