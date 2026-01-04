import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function AudioDriver({ data, rmsRef }) {
  useFrame(({ clock }) => {
    if (!data?.rms?.length) return;

    const t = Math.floor(clock.elapsedTime * 60);
    rmsRef.current = data.rms[t % data.rms.length];
  });

  return null;
}
