export const fragment = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uEnergy;
uniform float uMood;
uniform float uAnticipation;
uniform float uQuality; // 0.0 = low, 1.0 = high


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
  Cheaper "iridescence"
------------------------ */

vec3 hueShiftFast(vec3 c, float h) {
  // rotate in rb plane (cheap spectral shift)
  float a = h * 6.28318;
  float cs = cos(a), sn = sin(a);
  vec2 rb = mat2(cs, -sn, sn, cs) * c.rb;
  c.r = rb.x;
  c.b = rb.y;
  return clamp(c, 0.0, 1.0);
}

/* -----------------------
   Flow distortion
------------------------ */

vec3 flowWarp(vec3 p, float t) {
  // removed unused 'w'
  p.y += sin(uTime * 3.0 + p.x * 4.0) * uAnticipation * 0.08;
  return p;
}

/* -----------------------
   SDF Primitives
------------------------ */

float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

/* -----------------------
   Fractal SDF (reduced steps)
------------------------ */

float sdfFractal(vec3 p) {
  float scale = 2.8;
  float d = 1e9;

int maxIter = int(mix(3.0, 6.0, uQuality));
  for (int i = 0; i < 6; i++) {
    if (i >= maxIter) break;
    float it = float(i);
    float tt = uTime * 0.05 + it * 0.4;

    p.xy *= rotate(tt);
    p.yz *= rotate(tt * 0.6);

    p = flowWarp(p, uTime * (0.03 + uEnergy * 0.15));
    p = abs(p) - 0.55;

    float s = scale + it * 0.15;
    p *= s;

    d = min(d, length(p) / s);
  }

  return d;
}

/* -----------------------
   Master Shape Map
------------------------ */

float map(vec3 p) {
float r = length(p);


  float energy = smoothstep(0.5, 0.8, uEnergy);
  float beatBoost = smoothstep(0.2, 0.9, uEnergy);
  float beatForce = smoothstep(0.3, 0.9, uEnergy);

  float dSphere  = sdSphere(p, 0.9);
  float dTorus   = sdTorus(p, vec2(0.3, 0.2));
  float dFractal = sdfFractal(p);
  float dBox     = sdBox(p, vec3(0.25));
  float dNebula  = sdSphere(flowWarp(p, uTime * 0.6), 0.9);

  if (r > 2.2) {
return sdSphere(p,0.9);
}

  float calm = 1.0 - smoothstep(0.4, 0.8, uEnergy);
  if (calm > 0.6) return dSphere;

  float m1 = smoothstep(0.10, 0.35, uMood);
  float m2 = smoothstep(0.20, 0.45, uMood);
  float m3 = smoothstep(0.20, 0.65, uMood);
  float m4 = smoothstep(0.30, 0.70, uMood);

}

/* -----------------------
   Normals (slightly cheaper)
------------------------ */

vec3 calcNormal(vec3 p) {
  // slightly bigger epsilon reduces alias + cost sensitivity
  const float e = 0.002;
  vec2 h = vec2(e, 0.0);

  float dx = map(p + vec3(h.x, h.y, h.y)) - map(p - vec3(h.x, h.y, h.y));
  float dy = map(p + vec3(h.y, h.x, h.y)) - map(p - vec3(h.y, h.x, h.y));
  float dz = map(p + vec3(h.y, h.y, h.x)) - map(p - vec3(h.y, h.y, h.x));

  return normalize(vec3(dx, dy, dz));
}

/* -----------------------
   Fake env reflection
------------------------ */

vec3 fakeEnvReflection(vec3 n, vec3 v) {
  float f = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 sky = vec3(0.45, 0.65, 0.95);
  vec3 ground = vec3(0.08, 0.06, 0.10);
  return mix(ground, sky, n.y * 0.5 + 0.5) * f;
}

/* -----------------------
   Space waves
------------------------ */

float spaceWave(vec3 p) {
  float r = length(p);

  float waveStart = 0.55;
  float waveEnd = 1.8;

  float band =
    smoothstep(waveStart, waveStart + 0.15, r) *
    (1.0 - smoothstep(waveEnd, waveEnd + 0.3, r));

    float freq = mix(6.0, 10.0, uQuality);

  float wave = sin(r * freq - uTime * (3.0 + uEnergy * 6.0));
  float beat = smoothstep(0.25, 0.9, uEnergy);

  // exp() is not crazy, but keep it gentle
  float fade = exp(-(r - waveStart) * 0.2);

  return wave * band * fade * beat;
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

int steps = int(mix(6.0, 8.0, uQuality));
  for (int i = 0; i < 8; i++) {
    if (i >= steps) break;

    vec3 p = ro + rd * t;
    d = map(p);
    if (d < 0.001) break;

    float stepScale = mix(0.85, 0.65, smoothstep(0.0, 1.2, d));
    t += d * stepScale;
  }

  vec3 p = ro + rd * t;

  // beat shock (kept)
  float beatPulse = smoothstep(0.2, 1.0, uEnergy);
  float shock = sin(length(p) * 6.0 - uTime * 4.0) * beatPulse * 0.15;
  p += normalize(p) * shock;

  vec3 viewDir = normalize(ro - p);
  vec3 n = calcNormal(p);

  float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.5);
  float rim = pow(1.0 - dot(n, viewDir), 2.0);

  float glow = exp(-d * d * (4.0 + uEnergy * 2.0));

  // palette (kept)
  vec3 deepSpace  = vec3(0.8, 0.10, 0.18);
  vec3 cosmicBlue = vec3(0.05, 0.95, 0.75);
  vec3 lavender   = vec3(0.60, 0.55, 0.85);
  vec3 peach      = vec3(0.05, 0.35, 0.95);
  vec3 pearl      = vec3(0.65, 0.95, 1.00);

  vec3 baseColor = mix(deepSpace, cosmicBlue, smoothstep(0.0, 0.4, uMood));
  baseColor = mix(baseColor, lavender, smoothstep(0.3, 0.7, uMood));
  baseColor = mix(baseColor, peach, smoothstep(0.8, 0.8, uEnergy) * 0.6);
  baseColor = mix(baseColor, pearl, glow * 0.35);

  vec3 color = baseColor * glow;

  // waves
  vec3 waveColor = mix(vec3(0.15, 0.55, 0.95), vec3(0.35, 0.85, 1.15), uMood);
float w = spaceWave(p);
vec3 negColor = vec3(0.1, 0.0, 0.2); // dark violet
color += mix(waveColor, negColor, step(0.0, -w)) * abs(w) * 0.35;


  // contrast + rim
  color = pow(color, vec3(0.9));
  rim *= smoothstep(0.1, 0.1, uEnergy);
  color += rim * vec3(0.2, 0.8, 1.0);

  // iridescence (fast)
  float iridescenceStrength = mix(0.55, 0.35, uEnergy);
  float motionHue = sin(uTime * 0.5 + uEnergy * 2.0) * 0.05;
  float hue = fresnel * 0.1 + uMood * 0.08 + motionHue;

  color = mix(color, hueShiftFast(color, hue), fresnel * iridescenceStrength);

  // single env reflection (remove duplicate)
  vec3 env = fakeEnvReflection(n, viewDir);
  color = mix(color, color + env, fresnel * 0.6);

  // surface fractal detail: keep but cheap-ish (still 1 fractal call)
  float surfaceFractal = sdfFractal(p * 1.38);
  float fractalMask = smoothstep(0.7, 0.2, surfaceFractal);

  color.r += fresnel * 0.2;
  color.b -= fresnel * 0.1;

  color *= 1.0 + fractalMask * 0.1;
  color *= mix(0.2, 1.35, fractalMask);

  vec3 fractalTint = vec3(0.35, 1.35, 1.15);
  color = mix(color, color * fractalTint, fractalMask * 0.5);

  float fog = exp(-t * (0.25 + uMood * 0.6));
  color *= fog;

  gl_FragColor = vec4(color, 1.0);
}
`;
