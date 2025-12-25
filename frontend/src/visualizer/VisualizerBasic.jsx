import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CentralAura from "./CentralAura";
import HeadHalo from "./HeadHallo";
import InstrumentRings from "./InstrumentRings";
import useAnalysisPlayback from "../utils/useAnalysisPlayback";

function FrequencyBars({ data }) {
  const barsRef = useRef([]);

  const barHeights = useMemo(() => {
    if (!data) return [0, 0, 0];

    return ["low", "mid", "high"].map((band) => {
      const values = data[band];
      if (!values || values.length === 0) return 0;

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.min(avg * 5, 3);
    });
  }, [data]);

  // animate bars
  useFrame(() => {
    if (!barsRef.current) return;
    barsRef.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.scale.y = THREE.MathUtils.damp(
          mesh.scale.y,
          barHeights[i],
          6,
          0.016
        );
      }
    });
  });

  const colors = ["#A6D7C2", "#FDC9E9", "#B09EB9"];

  return (
    <group position={[-2, -1.5, 0]}>
      {["low", "mid", "high"].map((_, i) => (
        <mesh
          key={i}
          position={[i * 1.5, 0, 0]}
          ref={(el) => (barsRef.current[i] = el)}
        >
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color={colors[i]} />
        </mesh>
      ))}
    </group>
  );
}

export default function VisualizerBasic({ data }) {
  const playback = useAnalysisPlayback(data, data?.tempo ?? 120);
  const rms = playback?.rms ?? 0.2;
  return (
    <>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        style={{ background: "#22292B", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} />+
        {/* <FrequencyBars data={data} /> */}
        <HeadHalo intensity={rms} />
        <InstrumentRings analysis={playback} />
        <CentralAura rms={rms} />
      </Canvas>
    </>
  );
}
