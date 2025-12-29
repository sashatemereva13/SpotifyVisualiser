import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function AuraShell({
  children,
  energy = 0,
  mood,
  particleCount = 40,
  radius = 0.35,
  height = 0.6,
}) {
  const groupRef = useRef();
  const particlesRef = useRef();

  const rolloff = mood?.current?.rolloff ?? 0;

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
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    groupRef.current.position.y = Math.sin(t * 0.6) * (0.02 + energy * 0.05);

    groupRef.current.rotation.y = t * (0.1 + rolloff * 0.4);

    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.25;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Glow shell */}
        {/* <mesh scale={1.1}>
          <capsuleGeometry args={[0.4, radius * 1.2, 24, 24]} />
          <meshBasicMaterial
            color="#1DE9B6"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh> */}

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
            color="#1DE9B6"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {children}
      </group>
    </>
  );
}
