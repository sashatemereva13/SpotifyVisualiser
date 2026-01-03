import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function InstrumentRing({
  radius = 1.2,
  thickness = 0.05,
  color = "#ffffff",
  speed = 0.5,
  intensity = 0.3,
  opacity = 0.5,
  y = 0,
}) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (!ringRef.current) return;

    // rotation speed driven by intensity
    ringRef.current.rotation.z += delta * speed * (1 + intensity);

    // subtle breathing
    const scale = 1 + intensity * 0.2;
    ringRef.current.scale.x = THREE.MathUtils.damp(
      ringRef.current.scale.x,
      scale,
      3,
      delta
    );

    ringRef.current.scale.z = THREE.MathUtils.damp(
      ringRef.current.scale.z,
      scale,
      3,
      delta
    );
  });

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} ref={ringRef} position={[0, y, 0]}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
