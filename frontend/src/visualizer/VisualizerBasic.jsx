import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FractalNode from "./fractal/FractalNode";
import CentralAura from "./person/CentralAura";
import { OrbitControls } from "@react-three/drei";

export default function VisualizerBasic({ data }) {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        {/* <CameraOrbit /> */}

        <group renderOrder={0}>
          <FractalNode scale={2} data={data} />
        </group>

        <OrbitControls />

        <group position={[0, -1, -3]} renderOrder={1}>
          <CentralAura rms={data} />
        </group>
      </Canvas>
    </>
  );
}
