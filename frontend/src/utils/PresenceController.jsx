import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PresenceController({ audioReadyRef, presenceRef }) {
  useFrame((_, delta) => {
    const target = audioReadyRef.current ? 1 : 0;

    console.log("presence", presenceRef.current.toFixed(2));

    presenceRef.current = THREE.MathUtils.damp(
      presenceRef.current,
      target,
      0.7,
      delta
    );

    document.documentElement.style.setProperty(
      "--presence",
      presenceRef.current.toFixed(4)
    );
  });

  return null;
}
export default PresenceController;
