import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uEnergy;

/* -----------------------
   Utility
------------------------ */

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

/* Smooth noise-ish flow */
vec3 flowWarp(vec3 p, float t) {
  p.xy += 0.15 * sin(vec2(p.y, p.x) * 1.5 + t);
  p.yz += 0.12 * sin(vec2(p.z, p.y) * 1.2 + t * 0.8);
  p.zx += 0.10 * sin(vec2(p.x, p.z) * 1.1 - t * 0.6);
  return p;
}

/* -----------------------
   Fractal SDF
------------------------ */

float sdfFractal(vec3 p) {
  float scale = 1.8;
  float d = 1e9;

  for (int i = 0; i < 6; i++) {

    // VERY slow internal rotation
    float t = uTime * 0.05 + float(i) * 0.4;
    p.xy *= rotate(t);
    p.yz *= rotate(t * 0.6);

    // Gentle flow distortion
    p = flowWarp(p, uTime * 0.15);

    // Fractal fold
    p = abs(p) - 0.55;
    p *= scale;

    d = min(d, length(p) / scale);
  }

  return d;
}

/* -----------------------
   Main
------------------------ */

void main() {

  vec2 uv = vUv - 0.5;

  // Smooth energy (prevents jitter)
  float energy = smoothstep(0.0, 0.6, uEnergy);

  // Base position
  vec3 p = vec3(uv * 2.0, 0.0);

  float d = sdfFractal(p);

// Soft distance falloff (Gaussian-like)
float glow = exp(-d * d * 3.3);

// Gentle compression (removes harsh peaks)
glow = pow(glow, 1.3);

// Energy widens the light instead of spiking it
glow *= mix(0.85, 1.1, energy);

  // Calm color palette
  vec3 color = mix(
    vec3(0.03, 0.06, 0.1),
    vec3(0.5, 0.75, 1.0),
    glow
  );

  gl_FragColor = vec4(color, 1.0);
}

`;

const FractalMaterial = shaderMaterial(
  {
    uTime: 0,
    uEnergy: 0,
  },
  vertex,
  fragment
);

extend({ FractalMaterial });

export default function FractalSDF({ data }) {
  const mat = useRef();
  const smoothedEnergy = useRef(0);

  useFrame((state, delta) => {
    if (!data || !mat.current) return;

    const t = Math.floor(state.clock.elapsedTime * 60);
    const rms = data.rms?.[t % data.rms.length] ?? 0;

    smoothedEnergy.current = THREE.MathUtils.damp(
      smoothedEnergy.current,
      rms,
      6,
      delta
    );

    mat.current.uTime = state.clock.elapsedTime;
    mat.current.uEnergy = smoothedEnergy.current;
  });

  return (
    <mesh>
      <planeGeometry args={[5, 5]} />
      <fractalMaterial ref={mat} side={THREE.DoubleSide} />
    </mesh>
  );
}
