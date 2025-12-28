import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
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

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

/* -----------------------
  Iridescence helpers
------------------------ */

vec3 hueShift(vec3 color, float hue) {
const mat3 rgb2yiq = mat3(
0.299, 0.587, 0.114,
0.596, -0.274, -0.322,
0.211, -0.523, 0.312
);

const mat3 yiq2rgb = mat3(
1.0, 0.956, 0.621,
1.0, -0.272, -0.647,
1.0, -1.106, 1.703
);

vec3 yiq = rgb2yiq * color;
float angle = hue * 6.28318;
mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
yiq.yz = rot * yiq.yz;
return clamp(yiq2rgb * yiq, 0.0, 1.0);
}



/* -----------------------
   Flow distortion
------------------------ */

vec3 flowWarp(vec3 p, float t) {
  float w = sin(dot(p, vec3(1.2, 1.7, 1.4)) + t);
  p += 0.12 * w;
  return p;
}


/* -----------------------
   SDF Primitives
------------------------ */

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

/* -----------------------
   Fractal SDF (your core)
------------------------ */

float sdfFractal(vec3 p) {
  float scale = 1.8;
  float d = 1e9;

  for (int i = 0; i < 4; i++) {
    float t = uTime * 0.05 + float(i) * 0.4;
    p.xy *= rotate(t);
    p.yz *= rotate(t * 0.6);

    p = flowWarp(p, uTime * 0.12);

    p = abs(p) - 0.55;
    p *= scale;

    d = min(d, length(p) / scale);

  }

  return d;
}

/* -----------------------
   Master Shape Map
------------------------ */

float map(vec3 p) {

// --- CRESCENDO SPIRAL ---
float energy = smoothstep(0.1, 0.7, uEnergy);

  // shape distances
  float dSphere  = sdSphere(p, 0.9);
  float dTorus   = sdTorus(p, vec2(0.3, 0.2));
  float dFractal = sdfFractal(p);
  float dBox     = sdBox(p, vec3(0.55));
  float dNebula  = sdSphere(flowWarp(p, uTime * 0.6), 0.9);

  // mood-based blending zones
  float m1 = smoothstep(0.00, 0.25, uMood);
  float m2 = smoothstep(0.20, 0.45, uMood);
  float m3 = smoothstep(0.40, 0.65, uMood);
  float m4 = smoothstep(0.60, 0.90, uMood);

  float d = dSphere;
  d = smin(d, dTorus,   0.3 * m1);
  d = smin(d, dFractal, 0.35 * m2);
  d = smin(d, dBox,     0.25 * m3);
  d = smin(d, dNebula,  0.4 * m4 * energy);

  return d;
}

/* -----------------------
   Main
------------------------ */

void main() {

  vec2 uv = vUv * 2.0 - 1.0;

  vec3 ro = vec3(0.0, 0.0, 3.5);
  vec3 rd = normalize(vec3(uv, -1.6));

float t = 0.0;
float d = 0.0;

for (int i = 0; i < 4; i++) {
  vec3 p = ro + rd * t;
  d = map(p);
  if (d < 0.001) break;
  t += d * 0.85;
}

vec3 p = ro + rd * t;

// --- VIEW + NORMAL (for iridescence) ---
vec3 viewDir = normalize(ro - p);

// approximate normal from SDF
vec3 n = normalize(p + flowWarp(p, uTime * 0.2));


// fresnel term
float fresnel = pow(
1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.5
);


float glow =  exp(-d * d * 8.0);


  vec3 calmColor      = vec3(0.9, 0.05, 0.6);
  vec3 dreamyColor    = vec3(0.5, 0.6, 0.85);
  vec3 energeticColor = vec3(0.9, 0.4, 0.3);

  float calmToDreamy  = smoothstep(0.0, 0.5, uMood);
  float dreamyToEnergy = smoothstep(0.4, 1.0, uMood);

  vec3 moodColor = mix(calmColor, dreamyColor, calmToDreamy);
  moodColor = mix(moodColor, energeticColor, dreamyToEnergy);

  vec3 color = moodColor * glow;
  color = pow(color, vec3(0.85));

  // --- IRIDESCENCE ---
  float iridescenceStrength = mix(0.15, 0.55, uEnergy);
  float hue = fresnel * 0.25 + uTime * 0.05;

  vec3 iridescent = hueShift(color, hue);
  color = mix(color, iridescent, fresnel * iridescenceStrength);

  // --- SURFACE FRACTAL DETAIL ---
float surfaceFractal = sdfFractal(p * 0.9);
float fractalMask = smoothstep(0.7, 0.1, surfaceFractal);\

// subtle spectral glow split
color.r += fresnel * 0.1;
color.b -= fresnel * 0.05;

// carve brightness
color *= mix(0.2, 1.35, fractalMask);

// optional tint
vec3 fractalTint = vec3(0.95, 1.05, 1.15);
color = mix(color, color * fractalTint, fractalMask * 0.5);


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
      <planeGeometry args={[2, 2, 128, 128]} />
      <fractalMaterial ref={mat} depthWrite={false} depthTest={true} />
    </mesh>
  );
}
