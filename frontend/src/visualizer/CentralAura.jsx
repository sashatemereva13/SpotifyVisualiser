import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CentralAura({ rms = 0.2 }) {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // vertical body
      const y = THREE.MathUtils.randFloat(-1.2, 1.6);

      // radius for thinner waist and fuller torso and head
      const radius = 0.15 + 0.25 * Math.exp(-Math.abs(y)) + 0.1 * Math.random();

      const angle = Math.random() * Math.PI * 2;

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // ----------------- Animation ----------------
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // normalise RMS within a safe range
    const targetScale = 1 + THREE.MathUtils.clamp(rms * 1.5, 0, 0.6);

    pointsRef.current.scale.x = THREE.MathUtils.damp(
      pointsRef.current.scale.x,
      targetScale,
      3,
      delta
    );

    pointsRef.current.scale.y = THREE.MathUtils.damp(
      pointsRef.current.scale.y,
      targetScale,
      3,
      delta
    );

    pointsRef.current.scale.z = THREE.MathUtils.damp(
      pointsRef.current.scale.z,
      targetScale,
      3,
      delta
    );

    // slow rotation to imitate living presence
    pointsRef.current.rotation.y += delta * 0.15;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color="#FDC9E9"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
