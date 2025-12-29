import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EnergyMaterial from "./EnergyMaterial";
import AuraShell from "./AuraShell";

/**
 * CentralAura
 * --------------------------------------------------
 * Embodied humanoid form reacting to music.
 *
 * - Realtime audio (RMS, beats, bands) drives motion
 * - Structural (backend) audio drives mood & color
 * - totalEnergyRef is the single source of truth
 * - readyBlend ensures smooth visual startup
 */
export default function CentralAura({
  rmsRef,
  beatRef,
  bandsRef,
  structuralRef,
  audioReadyRef, // 🔑 MUST be passed
}) {
  // ---- Group refs ----
  const groupRef = useRef();

  // ---- Energy accumulation ----
  const energyRef = useRef(0); // smoothed RMS
  const beatEnergyRef = useRef(0); // beat impulse
  const totalEnergyRef = useRef(0); // final combined energy
  const materialEnergyRef = useRef(0);

  // ---- Visual modulation ----
  const hueRef = useRef(0.3);
  const readyBlend = useRef(0); // smooth intro gate

  // ---- Body parts ----
  const headRef = useRef();
  const torsoRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  // ----------------- Animation Loop -----------------
  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !rmsRef) return;

    /* ---------------------------------------------
       1. READY BLEND
       Smooth fade-in once audio becomes stable
    --------------------------------------------- */
    readyBlend.current = THREE.MathUtils.damp(
      readyBlend.current,
      audioReadyRef?.current ? 1 : 0,
      2,
      delta
    );

    const readiness = readyBlend.current;

    /* ---------------------------------------------
       2. REALTIME AUDIO INPUT
    --------------------------------------------- */
    const rms = rmsRef.current ?? 0;
    const beat = beatRef?.current ?? 0;
    const bands = bandsRef?.current;
    const low = bands?.low ?? 0;
    const high = bands?.high ?? 0;

    /* ---------------------------------------------
       3. SMOOTH ENERGY CURVES
    --------------------------------------------- */
    // RMS → perceptual energy
    const energyTarget = THREE.MathUtils.clamp(Math.pow(rms * 3.0, 0.7), 0, 1);

    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      energyTarget,
      6,
      delta
    );

    // Beat impulse accumulation
    beatEnergyRef.current = THREE.MathUtils.damp(
      beatEnergyRef.current,
      beat,
      10,
      delta
    );

    /* ---------------------------------------------
       4. TOTAL ENERGY (SINGLE SOURCE OF TRUTH)
    --------------------------------------------- */
    totalEnergyRef.current =
      (energyRef.current + beatEnergyRef.current * 1.2) * readiness;

    materialEnergyRef.current = THREE.MathUtils.clamp(
      totalEnergyRef.current,
      0,
      1
    );

    /* ---------------------------------------------
       5. STRUCTURAL (BACKEND) INFLUENCE
    --------------------------------------------- */
    const structural = structuralRef?.current;
    const moodEnergy = structural?.energy ?? 0;
    const centroid = structural?.centroid ?? 0;

    // Color identity from centroid
    hueRef.current = THREE.MathUtils.lerp(0.08, 0.65, centroid);

    /* ---------------------------------------------
       6. BODY MOTION
    --------------------------------------------- */
    const t = clock.elapsedTime;
    const groove = t * (0.8 + energyRef.current * 3.0);

    // CORE / TORSO
    groupRef.current.rotation.y =
      Math.sin(groove * 0.5) * totalEnergyRef.current * 0.4 +
      (moodEnergy - 0.5) * 0.1;

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

    // ARMS (high frequencies = looseness)
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.z = THREE.MathUtils.damp(
        leftArmRef.current.rotation.z,
        high * 0.3,
        5,
        delta
      );

      rightArmRef.current.rotation.z = THREE.MathUtils.damp(
        rightArmRef.current.rotation.z,
        -high * 0.3,
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

    // BREATHING (vertical scale)
    const breath = 1 + totalEnergyRef.current * 0.2;
    groupRef.current.scale.y = THREE.MathUtils.damp(
      groupRef.current.scale.y,
      breath,
      4,
      delta
    );
  });

  /* ----------------- Render ----------------- */
  return (
    <group position={[2, -1, -3]} ref={groupRef} frustumCulled={false}>
      {/* HEAD */}
      <group ref={headRef} position={[0, 2, 0]}>
        <AuraShell
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
          audioReadyRef={audioReadyRef}
          energy={totalEnergyRef.current}
          mood={structuralRef}
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
