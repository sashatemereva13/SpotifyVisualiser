import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import EnergyMaterial from "./EnergyMaterial";
import AuraShell from "./AuraShell";
import InstrumentRings from "../InstrumentRings.jsx";

/* --------------------------------------------------
   Choreography timing (ART DIRECTION)
-------------------------------------------------- */
const DANCE_DURATION = 1.0;
const FREEZE_DURATION = 0.6;
const DISASSEMBLE_DURATION = 13.5;
const LOOP_PAUSE = 2.0; // seconds fully assembled before restarting]

const TOTAL_DURATION =
  DANCE_DURATION + FREEZE_DURATION + DISASSEMBLE_DURATION + LOOP_PAUSE;

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

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

// stagger order: arms → legs → torso → head
function partDelay(index) {
  if (index === 2 || index === 3) return 0.0; // arms
  if (index === 4 || index === 5) return 0.5; // legs
  if (index === 1) return 1.1; // torso
  return 1.6; // head
}

export default function CentralAura({
  rmsRef,
  beatRef,
  structuralRef,
  audioReadyRef,
}) {
  const groupRef = useRef();
  const { camera } = useThree();

  /* ------------------------------
     Energy & Time
  ------------------------------ */
  const energyRef = useRef(0);
  const beatImpulseRef = useRef(0);
  const beatPhaseRef = useRef(0);

  const disassemble = useRef(0);
  const readyBlend = useRef(0);

  const musicTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);

  /* ------------------------------
     Visual
  ------------------------------ */
  const hueRef = useRef(0.3);
  const materialEnergyRef = useRef(0);

  /* ------------------------------
     Parts
  ------------------------------ */
  const head = createPart([0, 2, 0]);
  const torso = createPart([0, 0.9, 0]);
  const leftArm = createPart([-0.4, 1.6, 0.3]);
  const rightArm = createPart([0.4, 1.6, 0.3]);
  const leftLeg = createPart([-0.15, -0.5, 0]);
  const rightLeg = createPart([0.15, -0.5, 0]);

  const parts = [head, torso, leftArm, rightArm, leftLeg, rightLeg];

  /* ------------------------------
     Screen bounds
  ------------------------------ */
  const getBounds = () => {
    const depth = 7;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFov / 2) * depth;
    const width = height * camera.aspect;
    return { width: width * 0.45, height: height * 0.45 };
  };

  /* ------------------------------
     Animation
  ------------------------------ */
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const { width, height } = getBounds();

    /* --- Track music time --- */
    if (audioReadyRef?.current) {
      musicTimeRef.current += delta;
      wasPlayingRef.current = true;
    } else if (wasPlayingRef.current) {
      musicTimeRef.current = 0;
      wasPlayingRef.current = false;
    }

    /* --- Energy --- */
    const rms = rmsRef?.current ?? 0;
    const beat = beatRef?.current ?? 0;

    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      Math.pow(rms * 3, 0.7),
      6,
      delta
    );

    if (beat > 0.1) beatImpulseRef.current = 1;
    beatImpulseRef.current = THREE.MathUtils.damp(
      beatImpulseRef.current,
      0,
      3,
      delta
    );

    /* --- Beat subdivision phase (assembled dance clock) --- */
    beatPhaseRef.current += delta * (2.0 + energyRef.current * 2.5);

    /* --- Choreography timeline --- */
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

    /* --- Visual identity --- */
    const centroid = structuralRef?.current?.centroid ?? 0;
    hueRef.current = THREE.MathUtils.lerp(0.08, 0.65, centroid);
    materialEnergyRef.current = THREE.MathUtils.clamp(
      energyRef.current + beatImpulseRef.current,
      0,
      1
    );

    if (musicTimeRef.current > TOTAL_DURATION) {
      musicTimeRef.current = 0;
    }

    /* ------------------------------
       Motion per part
    ------------------------------ */
    parts.forEach((p, i) => {
      if (!p.ref.current) return;

      /* --- Staggered disassembly --- */
      const localDelay = partDelay(i);
      const localDisassemble = THREE.MathUtils.clamp(
        disassemble.current - localDelay * 0.25,
        0,
        1
      );

      /* --- Spiral orbit --- */
      p.angle +=
        delta * p.spin * (0.25 + energyRef.current * 0.8) * localDisassemble;

      const targetRadius =
        localDisassemble * (1.0 + i * 0.28 + energyRef.current * 0.9);

      p.radius = THREE.MathUtils.damp(p.radius, targetRadius, 2, delta);

      /* --- Beat burst --- */
      p.burst = THREE.MathUtils.damp(p.burst, 0, 4, delta);
      p.burst += beatImpulseRef.current * (0.3 + i * 0.08) * localDisassemble;

      const spiralOffset = new THREE.Vector3(
        Math.cos(p.angle),
        Math.sin(p.angle * 0.7),
        Math.sin(p.angle)
      ).multiplyScalar(p.radius + p.burst);

      /* --- Assembled dance (beat-synced) --- */
      const dancePhase = Math.floor(beatPhaseRef.current * 2) * Math.PI;

      const danceOffset = new THREE.Vector3(
        Math.sin(dancePhase + i),
        Math.cos(dancePhase * 0.7 + i),
        Math.sin(dancePhase * 0.5 + i)
      ).multiplyScalar(
        0.07 * energyRef.current * assembledMotion * (1 - freezeFactor)
      );

      const targetPos = p.home.clone().add(danceOffset).add(spiralOffset);

      /* --- Soft bounds --- */
      if (Math.abs(targetPos.x) > width) {
        p.velocity.x += -Math.sign(targetPos.x) * 0.08;
      }
      if (Math.abs(targetPos.y) > height) {
        p.velocity.y += -Math.sign(targetPos.y) * 0.08;
      }

      /* --- Reassembly pull --- */
      p.velocity.addScaledVector(
        p.home.clone().sub(p.pos),
        (1 - localDisassemble) * delta * 4
      );

      /* --- Integrate --- */
      p.velocity.multiplyScalar(0.88);
      p.pos.addScaledVector(p.velocity, delta * 6);

      p.pos.lerp(targetPos, 0.05);
      p.ref.current.position.copy(p.pos);
    });
  });

  /* ------------------------------
     Render
  ------------------------------ */
  return (
    <group ref={groupRef} position={[3, -1, -7]} frustumCulled={false}>
      <InstrumentRings
        danceEnergy={energyRef.current}
        beatEnergy={beatImpulseRef.current}
        disassemble={disassemble.current}
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
    </group>
  );
}
