export const fragment = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uEnergy;
uniform float uMood;
uniform float uAnticipation;

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
 p.y += sin(uTime * 3.0 + p.x * 4.0) * uAnticipation * 0.08;

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
  float scale = 2.8;
  float d = 1e9;

  for (int i = 0; i < 8; i++) {
    float t = uTime * 0.05 + float(i) * 0.4;
    p.xy *= rotate(t);
    p.yz *= rotate(t * 0.6);

    p = flowWarp(p, uTime * (0.03 + uEnergy * 0.15));

    p = abs(p) - 0.55;

    float s = scale + float(i) * 0.15;
    p *= s;

    d = min(d, length(p) / s);

  }

  return d;
}

/* -----------------------
   Master Shape Map
------------------------ */

float map(vec3 p) {


float energy = smoothstep(0.5, 0.8, uEnergy);

// beat-driven fold amplification
float beatBoost = smoothstep(0.2, 0.9, uEnergy);
// beat-sensitive multiplier
float beatForce = smoothstep(0.3, 0.9, uEnergy);




  // shape distances
  float dSphere  = sdSphere(p, 0.9);
  float dTorus   = sdTorus(p, vec2(0.3, 0.2));
  float dFractal = sdfFractal(p);
  float dBox     = sdBox(p, vec3(0.25));
  float dNebula  = sdSphere(flowWarp(p, uTime * 0.6), 0.9);

  float calm = 1.0 - smoothstep(0.4, 0.8, uEnergy);
if (calm > 0.6) {
  return dSphere;
}


  // mood-based blending zones
  float m1 = smoothstep(0.10, 0.35, uMood);
  float m2 = smoothstep(0.20, 0.45, uMood);
  float m3 = smoothstep(0.20, 0.65, uMood);
  float m4 = smoothstep(0.30, 0.70, uMood);

  float d = dSphere;
  d = smin(d, dTorus,   0.8 * m1);
  d = smin(d, dFractal, 0.5 * m2 * (1.0 + beatForce * 2.0));
  d = smin(d, dBox,     0.25 * m3);
  d = smin(d, dNebula,  0.9 * m4 * energy);

  d = smin(d, dFractal, 0.35 * m2 * (1.0 + beatBoost * 1.5));


  return d;
}


// true SDF gradient
vec3 calcNormal(vec3 p) {
  const float e = 0.001;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

vec3 fakeEnvReflection(vec3 n, vec3 v) {
float f = pow(1.0 - max(dot(n, v), 0.0), 3.0);

vec3 sky = vec3(0.45, 0.65, 0.95);
vec3 ground = vec3(0.08, 0.06, 0.10);

vec3 env = mix(ground, sky, n.y * 0.5 + 0.5);
return env * f;
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



for (int i = 0; i < 8; i++) {
  vec3 p = ro + rd * t;
  d = map(p);
  if (d < 0.001) break;
  t += d * 0.75;
}

vec3 p = ro + rd * t;

float beatPulse = smoothstep(0.2, 1.0, uEnergy);
float shock = sin(length(p) * 6.0 - uTime * 4.0) * beatPulse * 0.15;
p += normalize(p) * shock;


// --- VIEW + NORMAL (for iridescence) ---
vec3 viewDir = normalize(ro - p);

vec3 n = calcNormal(p);

// fresnel term
float fresnel = pow(
1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.5
);

float rim = pow(1.0 - dot(n, viewDir), 2.0);


float glow = exp(-d * d * (4.0 + uEnergy * 2.0));


// --- COSMIC PASTEL PALETTE ---
vec3 deepSpace    = vec3(0.8, 0.10, 0.18); 
vec3 cosmicBlue   = vec3(0.05, 0.95, 0.75);
vec3 lavender     = vec3(0.60, 0.55, 0.85);
vec3 peach        = vec3(0.05, 0.35, 0.95); 
vec3 pearl        = vec3(0.65, 0.95, 1.00); 

// --- BASE COSMIC FIELD ---
vec3 baseColor = mix(deepSpace, cosmicBlue, smoothstep(0.0, 0.4, uMood));

// --- DREAM LAYER ---
baseColor = mix(baseColor, lavender, smoothstep(0.3, 0.7, uMood));

// --- ENERGY FLOW (warm through cool) ---
float warmFlow = smoothstep(0.8, 0.8, uEnergy);
baseColor = mix(baseColor, peach, warmFlow * 0.6);

// --- PEARL HIGHLIGHT (only where glow is strong) ---
baseColor = mix(baseColor, pearl, glow * 0.35);

// --- APPLY GLOW ---
vec3 color = baseColor * glow;

// --- SOFT CONTRAST ---
color = pow(color, vec3(0.9));

rim *= smoothstep(0.1, 0.1, uEnergy);
color += rim * vec3(0.2, 0.8, 1.0);


  // --- IRIDESCENCE ---
  float iridescenceStrength = mix(0.55, 0.35, uEnergy);
  float motionHue = sin(uTime * 0.5 + uEnergy * 2.0) * 0.05;
float hue = fresnel * 0.1 + uMood * 0.08 + motionHue;


  vec3 iridescent = hueShift(color, hue);
  color = mix(color, iridescent, fresnel * iridescenceStrength);

  // bias overall palette toward cool
color = mix(color, color * vec3(0.85, 0.9, 1.05), 0.4);


vec3 env = fakeEnvReflection(n, viewDir);
color = mix(color, color + env, fresnel * 0.6);

  // --- SURFACE FRACTAL DETAIL ---
float surfaceFractal = sdfFractal(p * 0.88);
float fractalMask = smoothstep(0.7, 0.2, surfaceFractal);

// subtle spectral glow split
color.r += fresnel * 0.2;
color.b -= fresnel * 0.1;

// carve brightness
color *= 1.0 + fractalMask * 0.1;
color *= mix(0.2, 1.35, fractalMask);

// optional tint
vec3 fractalTint = vec3(0.35, 1.35, 1.15);
color = mix(color, color * fractalTint, fractalMask * 0.5);

float fog = exp(-t * (0.25 + uMood * 0.6));
color *= fog;

  gl_FragColor = vec4(color, 1.0);
}
`;
