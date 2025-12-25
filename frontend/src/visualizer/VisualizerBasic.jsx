import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CentralAura from "./CentralAura";
import HeadHallo from "./HeadHallo";
import InstrumentRings from "./InstrumentRings";
import useAnalysisPlayback from "../utils/useAnalysisPlayback";

export default function VisualizerBasic({ data }) {
  const playback = useAnalysisPlayback(data, data?.tempo ?? 120);
  const rms = playback?.rms ?? 0.2;
  return (
    <>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        style={{ background: "#010D03", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 8, 5]} intensity={3} />

        <HeadHallo intensity={rms} />
        <InstrumentRings analysis={playback} />
        <CentralAura rms={rms} />
      </Canvas>
    </>
  );
}
