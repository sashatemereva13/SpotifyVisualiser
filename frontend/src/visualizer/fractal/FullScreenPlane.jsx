import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FullScreenPlane({ children }) {
  const mesh = useRef();
  const { camera } = useThree();

  useFrame(() => {
    const z = Math.abs(camera.position.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const height = 5 * Math.tan(fov / 2) * z;
    const width = height * camera.aspect;

    mesh.current.scale.set(width, height, 1);
  });

  return (
    <mesh ref={mesh} position={[0, 0, -5]}>
      <planeGeometry args={[1, 1]} />
      {children}
    </mesh>
  );
}

export default FullScreenPlane;
