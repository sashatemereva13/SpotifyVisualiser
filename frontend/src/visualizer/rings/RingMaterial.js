// RingMaterial.js
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const RingMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.6,
    uColor: new THREE.Color("#74e3ff"),

    // instrument “drivers”
    uBass: 0,
    uMid: 0,
    uHigh: 0,

    // signature controls
    uWaveAmp: 0.06, // general normal displacement amplitude
    uWaveFreq: 6.0, // how many lobes around the ring
    uWaveSpeed: 1.5, // travel speed
    uRadialComp: 0.0, // bass compression amount
    uJitterAmp: 0.0, // high jitter amount
    uSeed: 0.0,
  },
  // VERTEX
  /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;

  uniform float uWaveAmp;
  uniform float uWaveFreq;
  uniform float uWaveSpeed;
  uniform float uRadialComp;
  uniform float uJitterAmp;
  uniform float uSeed;

  varying float vGlow;

  // tiny hash (cheap “noise”)
  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    vec3 p = position;
    vec3 n = normal;

    // TorusGeometry in three.js is primarily in XY plane.
    // Angle around the ring:
    float ang = atan(p.y, p.x);         // [-pi..pi]
    float a01 = (ang + 3.14159265) / (6.2831853); // [0..1]

    // --- Signature mix drivers ---
    float bass = clamp(uBass, 0.0, 1.0);
    float mid  = clamp(uMid, 0.0, 1.0);
    float high = clamp(uHigh, 0.0, 1.0);

    // --- Traveling wave around the ring (mid signature base) ---
    float wave =
      sin(ang * uWaveFreq + uTime * uWaveSpeed + uSeed * 10.0) *
      (uWaveAmp * (0.25 + 0.75 * mid));

    // --- Bass: radial compression in plane (feels like “thump”) ---
    // compresses/expands ring radius in XY plane in pulses
    vec2 dir = normalize(p.xy + 1e-6);
    float thump = sin(uTime * 8.0 + uSeed * 5.0) * bass; // beat-like pulse
    float comp = -uRadialComp * (0.35 + 0.65 * bass) * (0.5 + 0.5 * thump);
    p.xy += dir * comp;

    // --- High: angular jitter (sparkly instability) ---
    float j = hash11(a01 * 128.0 + floor(uTime * 24.0) + uSeed * 999.0);
    float jitter = (j - 0.5) * 2.0; // [-1..1]
    jitter *= uJitterAmp * (0.15 + 0.85 * high);

    // Final displacement mostly along normal
    p += n * (wave + jitter);

    // Glow factor (used in fragment)
    vGlow = 0.35 + 0.65 * (abs(wave) + abs(jitter) + bass * 0.35);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
  `,
  // FRAGMENT
  /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vGlow;

  void main() {
    // soft additive glow
    float alpha = uOpacity * clamp(vGlow, 0.0, 1.2);
    gl_FragColor = vec4(uColor * (0.9 + 0.8 * vGlow), alpha);
  }
  `
);

extend({ RingMaterial });
export default RingMaterial;
