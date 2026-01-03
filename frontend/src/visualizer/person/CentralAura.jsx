import { useRef } from "react";
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
      0,
      1
    );

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
    </group>
  );
}
