import { useRef } from "react";
<<<<<<< HEAD
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
=======
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import EnergyMaterial from "./EnergyMaterial";
import AuraShell from "./AuraShell";
import InstrumentRings from "../rings/InstrumentRings.jsx";

const DANCE_DURATION = 1.0;
const FREEZE_DURATION = 0.6;
const DISASSEMBLE_DURATION = 13.5;
const LOOP_PAUSE = 2.0;

const TOTAL_DURATION =
  DANCE_DURATION + FREEZE_DURATION + DISASSEMBLE_DURATION + LOOP_PAUSE;

function createPart(home) {
  return {
    home: new THREE.Vector3(...home),
    pos: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    angle: Math.random() * Math.PI * 2,
    radius: 0,
    spin: 0.6 + Math.random() * 0.6,
    burst: 0,
    ref: useRef(),
  };
}

function partDelay(index) {
  if (index === 2 || index === 3) return 0.0;
  if (index === 4 || index === 5) return 0.5;
  if (index === 1) return 1.1;
  return 1.6;
}

export default function CentralAura({
  rmsRef,
  beatRef,
  structuralRef,
  audioReadyRef,
  parallax, // expects ref: { current: { x, y } }
  presenceRef,
}) {
  const groupRef = useRef();
  const { camera } = useThree();

  // base transforms (prevents drift / makes offsets clean)
  const baseGroupPos = useRef(new THREE.Vector3(3, -1, -7));
  const baseCamPos = useRef(null);

  const energyRef = useRef(0);
  const beatImpulseRef = useRef(0);
  const beatPhaseRef = useRef(0);

  const disassemble = useRef(0);

  const musicTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);

  const hueRef = useRef(0.3);
  const materialEnergyRef = useRef(0);

  const head = createPart([0, 2, 0]);
  const torso = createPart([0, 0.9, 0]);
  const leftArm = createPart([-0.4, 1.6, 0.3]);
  const rightArm = createPart([0.4, 1.6, 0.3]);
  const leftLeg = createPart([-0.15, -0.5, 0]);
  const rightLeg = createPart([0.15, -0.5, 0]);

  const parts = [head, torso, leftArm, rightArm, leftLeg, rightLeg];

  const getBounds = () => {
    const depth = 7;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFov / 2) * depth;
    const width = height * camera.aspect;
    return { width: width * 0.45, height: height * 0.45 };
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // capture base camera position once (so we offset from it)
    if (!baseCamPos.current) {
      baseCamPos.current = camera.position.clone();
    }

    const presence = presenceRef?.current ?? 0;
    const feltPresence = Math.pow(presence, 1.4);

    const px = parallax?.current?.x ?? 0;
    const py = parallax?.current?.y ?? 0;

    const { width, height } = getBounds();

    // --- Track music time ---
    if (audioReadyRef?.current && feltPresence > 0.05) {
      musicTimeRef.current += delta * feltPresence;
      wasPlayingRef.current = true;
    } else if (wasPlayingRef.current) {
      musicTimeRef.current = 0;
      wasPlayingRef.current = false;
    }

    // --- Energy ---
    const rms = rmsRef?.current ?? 0;
    const beat = beatRef?.current ?? 0;

    const targetEnergy = Math.pow(rms * 3, 0.7) * feltPresence;

    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      targetEnergy,
>>>>>>> feature/frontend-sasha
      6,
      delta
    );

<<<<<<< HEAD
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
=======
    if (beat > 0.1) beatImpulseRef.current = 1;
    beatImpulseRef.current = THREE.MathUtils.damp(
      beatImpulseRef.current,
      0,
      3,
      delta
    );

    beatPhaseRef.current += delta * (2.0 + energyRef.current * 2.5);

    // --- Choreography timeline ---
    let disassembleTarget = 0;
    let freezeFactor = 0;

    if (musicTimeRef.current < DANCE_DURATION) {
      disassembleTarget = 0;
    } else if (musicTimeRef.current < DANCE_DURATION + FREEZE_DURATION) {
      disassembleTarget = 0;
      freezeFactor = 1;
    } else if (
      musicTimeRef.current <
      DANCE_DURATION + FREEZE_DURATION + DISASSEMBLE_DURATION
    ) {
      disassembleTarget = 1;
    } else {
      disassembleTarget = 0;
    }

    disassemble.current = THREE.MathUtils.damp(
      disassemble.current,
      disassembleTarget,
      1.2,
      delta
    );

    const assembledMotion = 1 - disassemble.current;

    if (musicTimeRef.current === 0) {
      beatImpulseRef.current *= 0.5;
      beatPhaseRef.current *= 0.5;
    }

    // --- Visual identity ---
    const centroid = structuralRef?.current?.centroid ?? 0;
    hueRef.current = THREE.MathUtils.lerp(0.08, 0.65, centroid);

    materialEnergyRef.current = THREE.MathUtils.clamp(
      (energyRef.current + beatImpulseRef.current) * feltPresence,
>>>>>>> feature/frontend-sasha
      0,
      1
    );

<<<<<<< HEAD
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
=======
    if (musicTimeRef.current > TOTAL_DURATION) {
      musicTimeRef.current = 0;
    }

    // ------------------------------
    // Motion per part
    // ------------------------------
    parts.forEach((p, i) => {
      if (!p.ref.current) return;

      const localDelay = partDelay(i);
      const localDisassemble = THREE.MathUtils.clamp(
        disassemble.current - localDelay * 0.25,
        0,
        1
      );

      p.angle +=
        delta * p.spin * (0.25 + energyRef.current * 0.8) * localDisassemble;

      const targetRadius =
        localDisassemble * (1.0 + i * 0.28 + energyRef.current * 0.9);

      p.radius = THREE.MathUtils.damp(p.radius, targetRadius, 2, delta);

      p.burst = THREE.MathUtils.damp(p.burst, 0, 4, delta);
      p.burst += beatImpulseRef.current * (0.3 + i * 0.08) * localDisassemble;

      const spiralOffset = new THREE.Vector3(
        Math.cos(p.angle),
        Math.sin(p.angle * 0.7),
        Math.sin(p.angle)
      ).multiplyScalar(p.radius + p.burst);

      const dancePhase = Math.floor(beatPhaseRef.current * 2) * Math.PI;

      const danceOffset = new THREE.Vector3(
        Math.sin(dancePhase + i),
        Math.cos(dancePhase * 0.7 + i),
        Math.sin(dancePhase * 0.5 + i)
      ).multiplyScalar(
        0.07 * energyRef.current * assembledMotion * (1 - freezeFactor)
      );

      const targetPos = p.home.clone().add(danceOffset).add(spiralOffset);

      if (Math.abs(targetPos.x) > width)
        p.velocity.x += -Math.sign(targetPos.x) * 0.08;
      if (Math.abs(targetPos.y) > height)
        p.velocity.y += -Math.sign(targetPos.y) * 0.08;

      p.velocity.addScaledVector(
        p.home.clone().sub(p.pos),
        (1 - localDisassemble) * delta * 4
      );

      p.velocity.multiplyScalar(0.88);
      p.pos.addScaledVector(p.velocity, delta * 6);

      p.pos.lerp(targetPos, 0.05);
      p.ref.current.position.copy(p.pos);
    });

    // ------------------------------
    // Parallax (embodied, subtle)
    // ------------------------------

    // Camera: offset from its base position (prevents drift)
    // If OrbitControls is on, keep this very small to avoid fighting.
    const camTargetX = baseCamPos.current.x + px * 0.12;
    const camTargetY = baseCamPos.current.y + py * 0.08;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      camTargetX,
      4,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      camTargetY,
      4,
      delta
    );
    camera.lookAt(0, 0, 0);

    // Aura group: offset from base group position (prevents drift)
    const grpTargetX = baseGroupPos.current.x + px * 0.1;
    const grpTargetY = baseGroupPos.current.y + py * 0.06;

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      grpTargetX,
      5,
      delta
    );

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      grpTargetY,
      5,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[3, -1, -7]} frustumCulled={false}>
      <InstrumentRings
        danceEnergy={energyRef.current}
        beatEnergy={beatImpulseRef.current}
        disassemble={disassemble.current}
        // (optional later) parallax={parallax}
      />

      {[head, torso, leftArm, rightArm, leftLeg, rightLeg].map((p, i) => (
        <group key={i} ref={p.ref}>
          <AuraShell>
            <mesh position={i === 2 || i === 3 ? [0, -0.6, 0] : undefined}>
              {i === 0 && <sphereGeometry args={[0.28, 32, 32]} />}
              {i === 1 && <capsuleGeometry args={[0.35, 0.9, 12, 24]} />}
              {i > 1 && <capsuleGeometry args={[0.12, 1.5, 12, 24]} />}
              <EnergyMaterial
                hue={hueRef.current}
                energy={materialEnergyRef.current}
              />
            </mesh>
          </AuraShell>
        </group>
      ))}
>>>>>>> feature/frontend-sasha
    </group>
  );
}
