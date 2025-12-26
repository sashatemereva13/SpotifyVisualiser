import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import FractalSDF from "./FractalSDF";

export default function FractalNode({ scale = 1, data }) {
  const ref = useRef();

  return (
    <group ref={ref} scale={scale}>
      <FractalSDF data={data} />
    </group>
  );
}
