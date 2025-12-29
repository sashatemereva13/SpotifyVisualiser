import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FractalNode from "./fractal/FractalNode";
import CentralAura from "./person/CentralAura";
import { OrbitControls } from "@react-three/drei";
import RealtimeAudioDriver from "../utils/RealtimeAudioDriver";
import StructuralAudioDriver from "../utils/StructuralAudioDriver";

export default function VisualizerBasic({ audio, data }) {
  const rmsRef = useRef(0);
  const bandsRef = useRef({ low: 0, mid: 0, high: 0 });
  const beatRef = useRef(0);

  const structuralRef = useRef({
    energy: 0,
    centroid: 0,
    rolloff: 0,
    zcr: 0,
  });

  return (
    <>
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        {/* <CameraOrbit /> */}

        <group renderOrder={0}>
          <FractalNode
            scale={2}
            rmsRef={rmsRef}
            bandsRef={bandsRef}
            beatRef={beatRef}
          />
        </group>

        <OrbitControls />

        {audio && (
          <RealtimeAudioDriver
            audio={audio}
            rmsRef={rmsRef}
            bandsRef={bandsRef}
            beatRef={beatRef}
          />
        )}

        {audio && data && (
          <StructuralAudioDriver
            audio={audio}
            analysis={data}
            structuralRef={structuralRef}
          />
        )}

        <group position={[0, -1, -3]} renderOrder={1}>
          <CentralAura beatRef={beatRef} rmsRef={rmsRef} bandsRef={bandsRef} />
        </group>
      </Canvas>
    </>
  );
}
