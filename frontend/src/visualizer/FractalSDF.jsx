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

uniform float uMood;

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

  // Depth breathing (slow + soft)
  p.z += sin(uTime * 0.4 + length(uv) * 3.0) * (0.15 + energy * 0.25);

  float d = sdfFractal(p);

// Soft distance falloff (Gaussian-like)
float glow = exp(-d * d * 3.3);

// Gentle compression (removes harsh peaks)
glow = pow(glow, 1.3);

// Energy widens the light instead of spiking it
glow *= mix(0.85, 1.1, energy);

vec3 calmColor = vec3(0.2, 0.35, 0.6);    // blue / introspective
vec3 dreamyColor = vec3(0.5, 0.6, 0.85); // airy / floating
vec3 energeticColor = vec3(0.9, 0.4, 0.3); // warm / alive

// mood splits
float calmToDreamy = smoothstep(0.0, 0.5, uMood);
float dreamyToEnergy = smoothstep(0.4, 1.0, uMood);

// blend palettes
vec3 moodColor = mix(calmColor, dreamyColor, calmToDreamy);
moodColor = mix(moodColor, energeticColor, dreamyToEnergy);

// apply glow
vec3 color = moodColor * glow;

// gentle gamma
color = pow(color, vec3(0.9));


  gl_FragColor = vec4(color, 1.0);
}

`;

const FractalMaterial = shaderMaterial(
  {
    uTime: 0,
    uEnergy: 0,
    uMood: 0,
  },
  vertex,
  fragment
);

extend({ FractalMaterial });

export default function FractalSDF({ data }) {
  const mat = useRef();
  const smoothedEnergy = useRef(0);
  const mood = useRef(0);

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

    const centroid = data.centroid?.[t % data.centroid.length] ?? 0;

    // normalize roughly
    const energyNorm = THREE.MathUtils.clamp(
      smoothedEnergy.current * 2.0,
      0,
      1
    );
    const brightnessNorm = THREE.MathUtils.clamp(centroid / 4000, 0, 1);

    // mood aixs
    const moodTarget = energyNorm * 0.6 + brightnessNorm * 0.4;

    mood.current = THREE.MathUtils.damp(mood.current, moodTarget, 1.5, delta);

    mat.current.uMood = mood.current;
  });

  return (
    <mesh>
      <planeGeometry args={[5, 5]} />
      <fractalMaterial ref={mat} side={THREE.DoubleSide} />
    </mesh>
  );
}
