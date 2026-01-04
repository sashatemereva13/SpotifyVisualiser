// InstrumentRing.jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./RingMaterial"; // important: registers <ringMaterial />

export default function InstrumentRing({
  radius = 1.2,
  thickness = 0.05,
  color = "#ffffff",
  speed = 0.5,

  // keep your intensity + opacity
  intensity = 0.3,
  opacity = 0.5,
  y = 0,

  // new: instrument band inputs (0..1)
  bass = 0,
  mid = 0,
  high = 0,

  // new: signature presets (override per ring)
  waveAmp = 0.06,
  waveFreq = 6.0,
  waveSpeed = 1.5,
  radialComp = 0.0,
  jitterAmp = 0.0,
  seed = 0.0,
}) {
  const ringRef = useRef();
  const matRef = useRef();

  useFrame((state, delta) => {
    if (!ringRef.current || !matRef.current) return;

    // base rotation (still useful)
    ringRef.current.rotation.z += delta * speed * (1 + intensity);

    // shader time
    matRef.current.uTime = state.clock.elapsedTime;

    // feed bands
    matRef.current.uBass = bass;
    matRef.current.uMid = mid;
    matRef.current.uHigh = high;

    // signature controls
    matRef.current.uWaveAmp = waveAmp;
    matRef.current.uWaveFreq = waveFreq;
    matRef.current.uWaveSpeed = waveSpeed;
    matRef.current.uRadialComp = radialComp;
    matRef.current.uJitterAmp = jitterAmp;
    matRef.current.uSeed = seed;

    // color/opacity
    matRef.current.uColor = new THREE.Color(color);
    matRef.current.uOpacity = opacity;
  });

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} ref={ringRef} position={[0, y, 0]}>
      <torusGeometry args={[radius, thickness, 24, 192]} />
      <ringMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
