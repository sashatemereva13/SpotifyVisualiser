import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FractalNode from "./FractalNode";

function CameraOrbit() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * 0.15;
    camera.position.x = Math.cos(t) * 4.0;
    camera.position.z = Math.sin(t) * 4.0;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
export default function VisualizerBasic({ data }) {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        {/* <CameraOrbit /> */}
        <FractalNode data={data} />
      </Canvas>
    </>
  );
}
