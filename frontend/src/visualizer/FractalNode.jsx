import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FractalNode({
  depth = 0,
  maxDepth = 3,
  scale = 1,
  data,
}) {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!data || !ref.current) return;

    const t = Math.floor(state.clock.elapsedTime * 60);
    const rms = data.rms?.[t % data.rms.length] ?? 0;
    const centroid = data.centroid?.[t % data.centroid.length] ?? 0;

    ref.current.rotation.x += delta * 0.2;
    ref.current.rotation.y += delta * 0.1;
    ref.current.rotation.z += Math.log(centroid + 1) * 0.00001;

    const breathe = 1 + rms * 0.4;
    ref.current.scale.setScalar(scale * breathe);
  });

  return (
    <group ref={ref}>
      {/* core geometry */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffb703"
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>

      {/* recursive children */}
      {depth < maxDepth && [
        ...Array(4).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const dir = new THREE.Vector3(
            Math.cos(angle),
            Math.sin(angle),
            i % 2 === 0 ? 1 : -1
          );

          return (
            <group
              key={i}
              position={dir.multiplyScalar(1.8)}
              rotation={[angle, angle * 0.5, angle * 0.25]}
            >
              <FractalNode
                depth={depth + 1}
                maxDepth={maxDepth}
                scale={scale * 0.55}
                data={data}
              />
            </group>
          );
        }),
      ]}
    </group>
  );
}
