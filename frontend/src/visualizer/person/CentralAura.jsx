import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EnergyMaterial from "./EnergyMaterial";
import AuraShell from "./AuraShell";
import AuraParticles from "../AuraParticles";

export default function CentralAura({ rms = 0.2 }) {
  const groupRef = useRef();

  // ----------------- Animation ----------------
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // gentle breathing
    const breath = 1 + rms * 0.15;

    groupRef.current.scale.y = THREE.MathUtils.damp(
      groupRef.current.scale.y,
      breath,
      3,
      delta
    );

    groupRef.current.scale.x = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      1 - rms * 0.05,
      3,
      delta
    );
    groupRef.current.scale.z = groupRef.current.scale.x;
  });

  return (
    <group ref={groupRef}>
      {/* HEAD */}
      <group position={[0, 2, 0]} scale={1 + rms * 0.05}>
        <AuraShell radius={0.3} height={0.4}>
          <mesh>
            <sphereGeometry args={[0.28, 32, 32]} />
            <EnergyMaterial />
          </mesh>
        </AuraShell>
      </group>

      {/* TORSO */}
      <group position={[0, 0.9, 0]} scale={(1, 1 + rms * 0.2, 1)}>
        <AuraShell radius={0.45} height={0.9}>
          <mesh>
            <capsuleGeometry args={[0.35, 0.9, 12, 24]} />
            <EnergyMaterial />
          </mesh>
        </AuraShell>
      </group>

      {/* LEGS */}
      <group position={[-0.15, -0.5, 0]} scale={1 - rms * 0.05}>
        <AuraShell radius={0.18} height={1.5}>
          <mesh>
            <capsuleGeometry args={[0.12, 1.5, 12, 24]} />
            <EnergyMaterial />
          </mesh>
        </AuraShell>
      </group>

      <group position={[0.15, -0.5, 0]} scale={1 - rms * 0.05}>
        <AuraShell radius={0.18} height={1.5}>
          <mesh>
            <capsuleGeometry args={[0.12, 1.5, 12, 24]} />
            <EnergyMaterial />
          </mesh>
        </AuraShell>
      </group>
    </group>
  );
}
