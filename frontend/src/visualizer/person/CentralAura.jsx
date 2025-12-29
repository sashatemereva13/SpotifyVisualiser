import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EnergyMaterial from "./EnergyMaterial";
import AuraShell from "./AuraShell";

export default function CentralAura({
  rmsRef,
  beatRef,
  bandsRef,
  structuralRef,
}) {
  const groupRef = useRef();
  const energyRef = useRef(0);
  const beatEnergy = useRef(0);

  const headRef = useRef();
  const torsoRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  const totalEnergyRef = useRef(0);
  const materialEnergyRef = useRef(0);
  const hueRef = useRef(0.3);

  // ----------------- Animation ----------------
  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !rmsRef) return;

    const bands = bandsRef?.current;
    const low = bands?.low ?? 0;
    const high = bands?.high ?? 0;

    const t = clock.elapsedTime;

    const beat = beatRef?.current ?? 0;

    // accumulate beat impulse
    beatEnergy.current = THREE.MathUtils.damp(
      beatEnergy.current,
      beat,
      10,
      delta
    );

    const rms = rmsRef.current ?? 0;
    // perceptual remap
    const energyTarget = THREE.MathUtils.clamp(
      Math.pow(rms * 3.0, 0.7), // amplify + curve
      0,
      1
    );

    // smooth energy over time (IMPORTANT)
    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      energyTarget,
      6,
      delta
    );

    const energy = energyRef.current;

    const structural = structuralRef?.current;
    const moodEnergy = structural?.energy ?? 0;
    const centroid = structural?.centroid ?? 0;

    hueRef.current = THREE.MathUtils.lerp(0.08, 0.65, centroid);

    totalEnergyRef.current = energy + beatEnergy.current * 1.2;
    materialEnergyRef.current = THREE.MathUtils.clamp(
      totalEnergyRef.current,
      0,
      1
    );

    const groove = t * (0.8 + energy * 3.0);

    // BODY
    groupRef.current.rotation.y =
      Math.sin(groove * 0.5) * totalEnergyRef.current * 0.4;
    groupRef.current.rotation.y += (moodEnergy - 0.5) * 0.1;

    // HEAD
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(
        headRef.current.rotation.y,
        high * 0.6,
        5,
        delta
      );

      headRef.current.rotation.x =
        Math.sin(groove * 1.2) * totalEnergyRef.current * 0.5;

      headRef.current.rotation.z =
        Math.sin(groove * 0.8 + 1.2) * totalEnergyRef.current * 0.3;
    }

    // ARMS
    if (leftArmRef.current && rightArmRef.current) {
      // high frequencies loosen arms
      leftArmRef.current.rotation.z = THREE.MathUtils.damp(
        leftArmRef.current.rotation.z,
        high * 0.3,
        5,
        delta
      );

      rightArmRef.current.rotation.z = THREE.MathUtils.damp(
        rightArmRef.current.rotation.z,
        high * 0.3,
        5,
        delta
      );

      leftArmRef.current.rotation.x =
        Math.sin(groove) * totalEnergyRef.current * 0.6;

      rightArmRef.current.rotation.x =
        Math.sin(groove + Math.PI) * totalEnergyRef.current * 0.6;
    }

    // LEGS
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x =
        Math.sin(groove * 0.9) * totalEnergyRef.current * 0.4;

      rightLegRef.current.rotation.x =
        Math.sin(groove * 0.9 + Math.PI) * totalEnergyRef.current * 0.4;
    }

    // BREATH
    const breath = 1 + totalEnergyRef.current * 0.2;
    groupRef.current.scale.y = THREE.MathUtils.damp(
      groupRef.current.scale.y,
      breath,
      4,
      delta
    );
  });

  return (
    <group position={[3, 0, 0]} ref={groupRef} frustumCulled={false}>
      {/* HEAD */}
      <group ref={headRef} position={[0, 2, 0]}>
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.3}
          height={0.4}
        >
          <mesh>
            <sphereGeometry args={[0.28, 32, 32]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>

      {/* TORSO */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.45}
          height={0.9}
        >
          <mesh>
            <capsuleGeometry args={[0.35, 0.9, 12, 24]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>

      {/* LEGS */}
      <group ref={leftLegRef} position={[-0.15, -0.5, 0]}>
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.18}
          height={1.5}
        >
          <mesh>
            <capsuleGeometry args={[0.12, 1.5, 12, 24]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>

      <group ref={rightLegRef} position={[0.15, -0.5, 0]}>
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.18}
          height={1.5}
        >
          <mesh>
            <capsuleGeometry args={[0.12, 1.5, 12, 24]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>

      {/* ARMS */}
      <group
        ref={leftArmRef}
        rotation={[Math.PI / 3, 0, Math.PI / 6]}
        position={[-0.4, 1.6, 0.3]}
      >
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.18}
          height={1.5}
        >
          <mesh>
            <capsuleGeometry args={[0.1, 1, 12, 24]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>

      <group
        ref={rightArmRef}
        rotation={[Math.PI / 3, 0, -Math.PI / 12]}
        position={[0.4, 1.6, 0.3]}
      >
        <AuraShell
          energy={totalEnergyRef.current}
          mood={structuralRef}
          radius={0.18}
          height={1.5}
        >
          <mesh>
            <capsuleGeometry args={[0.1, 1, 12, 24]} />
            <EnergyMaterial
              hue={hueRef.current}
              energy={materialEnergyRef.current}
            />
          </mesh>
        </AuraShell>
      </group>
    </group>
  );
}
