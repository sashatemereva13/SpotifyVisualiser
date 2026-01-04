import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function AuraShell({
  children,
  energy = 0, // total energy from CentralAura
  mood, // structuralRef (backend-driven)
  audioReadyRef, // 🔑 controls smooth activation
  particleCount = 40,
  radius = 0.35,
  height = 0.6,
}) {
  const groupRef = useRef();
  const particlesRef = useRef();

  // local smoothing for backend rolloff
  const rolloffSmoothed = useRef(0);

  // smooth visual activation (prevents startup snap)
  const readyBlend = useRef(0);

  /* ---------------------------------------------
     Pre-generate particle positions
  --------------------------------------------- */
  const particles = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * (0.9 + Math.random() * 0.2);
      const y = (Math.random() - 0.5) * height;

      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }

    return arr;
  }, [particleCount, radius, height]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    /* ---------------------------------------------
       READY BLEND
       Smooth fade-in once audio is stable
    --------------------------------------------- */
    readyBlend.current = THREE.MathUtils.damp(
      readyBlend.current,
      audioReadyRef?.current ? 1 : 0,
      2,
      delta
    );

    const readiness = readyBlend.current;

    /* ---------------------------------------------
       STRUCTURAL ROLLOFF (BACKEND)
       Smoothed locally for visuals
    --------------------------------------------- */
    const rolloffTarget = mood?.current?.rolloff ?? 0;

    rolloffSmoothed.current = THREE.MathUtils.damp(
      rolloffSmoothed.current,
      rolloffTarget,
      1.5,
      delta
    );

    /* ---------------------------------------------
       MOTION
    --------------------------------------------- */

    // breathing / floating (energy-driven)
    groupRef.current.position.y =
      Math.sin(t * 0.6) * (0.02 + energy * 0.05) * readiness;

    // slow rotation influenced by spectral rolloff
    groupRef.current.rotation.y =
      t * (0.1 + rolloffSmoothed.current * 0.4) * readiness;

    // particle counter-rotation for depth
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.25 * readiness;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles}
            itemSize={3}
            count={particles.length / 3}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.025}
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Inner geometry (head / torso / limbs) */}
      {children}
    </group>
  );
}
