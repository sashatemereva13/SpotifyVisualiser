// useParallax.js
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useParallax(strength = 1) {
  const target = useRef(new THREE.Vector2());
  const current = useRef(new THREE.Vector2());

  useFrame((_, delta) => {
    current.current.x = THREE.MathUtils.damp(
      current.current.x,
      target.current.x * strength,
      6,
      delta
    );
    current.current.y = THREE.MathUtils.damp(
      current.current.y,
      target.current.y * strength,
      6,
      delta
    );
  });

  const onMove = (x, y) => {
    target.current.set(x, y);
  };

  return { parallax: current, onMove };
}
