import { useCallback, useEffect, useMemo, useRef } from 'react'

/**
 * WebGL shader background inspired by paper-design/shaders (mesh gradient,
 * grain gradient, swirl, waves, metaballs, godrays, warp, dot orbit, liquid
 * metal) plus a set of custom looks, with a film post-processing chain
 * (dither, noise, scanlines, posterize).
 *
 * Stability notes:
 * - No dynamic array indexing in GLSL (the Bayer matrix is computed
 *   arithmetically) so the shader compiles on every driver, including
 *   SwiftShader used during headless export.
 * - All loops have constant bounds.
 * - The context is recreated on `webglcontextlost`.
 * - Rendering is fully deterministic for a given `time`, so the animation
 *   preview and the frame-by-frame MP4 export match exactly.
 *   `preserveDrawingBuffer` is required so html-to-image can read the canvas.
 */

export type MeshEffect = 'smooth' | 'dither' | 'noise' | 'scan' | 'liquid' | 'posterize' | 'max'

export const MESH_EFFECTS: MeshEffect[] = ['smooth', 'dither', 'noise', 'scan', 'liquid', 'posterize', 'max']

export type MeshShader =
  | 'mesh'
  | 'grain'
  | 'swirl'
  | 'waves'
  | 'metaballs'
  | 'godrays'
  | 'warp'
  | 'dots'
  | 'metal'
  | 'aurora'
  | 'plasma'
  | 'voronoi'
  | 'rings'
  | 'caustics'
  | 'moire'
  | 'silk'
  | 'tunnel'
  | 'kaleido'
  | 'marble'
  | 'halftone'
  | 'lava'
  | 'ripple'
  | 'stripes'
  | 'crystal'
  | 'smoke'
  | 'spiral'

const SHADER_ORDER: MeshShader[] = [
  // gradients & flows
  'mesh',
  'grain',
  'warp',
  'silk',
  'smoke',
  'aurora',
  'lava',
  // organic
  'metaballs',
  'caustics',
  'marble',
  'plasma',
  'voronoi',
  'crystal',
  // geometric
  'swirl',
  'spiral',
  'rings',
  'waves',
  'ripple',
  'stripes',
  'moire',
  'tunnel',
  'kaleido',
  // light & print
  'godrays',
  'metal',
  'dots',
  'halftone',
]

export const MESH_SHADERS: MeshShader[] = SHADER_ORDER

export const MESH_SHADER_GROUPS: { label: string; shaders: MeshShader[] }[] = [
  { label: 'Gradients', shaders: ['mesh', 'grain', 'warp', 'silk', 'smoke', 'aurora', 'lava'] },
  { label: 'Organic', shaders: ['metaballs', 'caustics', 'marble', 'plasma', 'voronoi', 'crystal'] },
  {
    label: 'Geometric',
    shaders: ['swirl', 'spiral', 'rings', 'waves', 'ripple', 'stripes', 'moire', 'tunnel', 'kaleido'],
  },
  { label: 'Light & print', shaders: ['godrays', 'metal', 'dots', 'halftone'] },
]

const SHADER_INDEX: Record<MeshShader, number> = SHADER_ORDER.reduce(
  (acc, name, i) => {
    acc[name] = i
    return acc
  },
  {} as Record<MeshShader, number>,
)

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_base;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform float u_warp;
uniform float u_dither;
uniform float u_noise;
uniform float u_scan;
uniform float u_steps;
uniform float u_grid;
uniform float u_mode;
uniform float u_scale;
uniform float u_contrast;
uniform float u_blend;

const float PI = 3.14159265;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

/* 2x2 Bayer cell: [[0,2],[3,1]] — no arrays, driver-safe */
float m2(float x, float y) {
  float xo = mod(x, 2.0);
  float yo = mod(y, 2.0);
  if (xo < 1.0) return yo < 1.0 ? 0.0 : 2.0;
  return yo < 1.0 ? 3.0 : 1.0;
}
/* recursive 8x8 ordered Bayer threshold in [-0.5, 0.5] */
float bayer(vec2 c) {
  float x = floor(mod(c.x, 8.0));
  float y = floor(mod(c.y, 8.0));
  float v = 16.0 * m2(floor(x / 4.0), floor(y / 4.0))
          + 4.0 * m2(floor(x / 2.0), floor(y / 2.0))
          + m2(x, y);
  return v / 64.0 - 0.5;
}

float blob(vec2 uv, vec2 c, float r) {
  return smoothstep(r, 0.0, length(uv - c));
}

/* palette ramp across the four brand colors */
vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0) * 3.0;
  if (t < 1.0) return mix(u_c0, u_c1, t);
  if (t < 2.0) return mix(u_c1, u_c2, t - 1.0);
  return mix(u_c2, u_c3, t - 2.0);
}

vec2 rot(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c) * v;
}

/* ---------- shader looks ---------- */

vec3 shMesh(vec2 auv, float ar, float t, float w) {
  vec2 q = auv * 1.6;
  float n1 = fbm(q + vec2(t * 0.13, t * -0.09));
  float n2 = fbm(q * 1.7 + vec2(-t * 0.11, t * 0.07) + 4.2);
  vec2 p = auv + (vec2(n1, n2) - 0.5) * w;

  vec2 p0 = vec2(0.16 * ar + 0.05 * sin(t * 0.42), 0.20 + 0.05 * cos(t * 0.37));
  vec2 p1 = vec2(0.86 * ar + 0.05 * cos(t * 0.31), 0.14 + 0.05 * sin(t * 0.45));
  vec2 p2 = vec2(0.78 * ar + 0.06 * sin(t * 0.28), 0.88 + 0.04 * cos(t * 0.33));
  vec2 p3 = vec2(0.22 * ar + 0.05 * cos(t * 0.49), 0.90 + 0.05 * sin(t * 0.26));

  vec3 col = u_base;
  col = mix(col, u_c0, blob(p, p0, 0.72) * 0.95);
  col = mix(col, u_c1, blob(p, p1, 0.66) * 0.9);
  col = mix(col, u_c2, blob(p, p2, 0.70) * 0.85);
  col = mix(col, u_c3, blob(p, p3, 0.64) * 0.8);
  col += smoothstep(0.0, 1.0, fbm(p * 2.4 + t * 0.06)) * 0.06;
  return col;
}

vec3 shGrain(vec2 auv, float t, float w) {
  float n = fbm(auv * 2.0 + vec2(t * 0.08, -t * 0.05));
  float m = fbm(auv * 3.3 - vec2(t * 0.06, t * 0.09) + 7.0);
  float g = clamp(n * 0.75 + m * 0.45 + w * 0.4, 0.0, 1.0);
  return mix(u_base, ramp(g), 0.92);
}

vec3 shSwirl(vec2 auv, float ar, float t, float w) {
  vec2 c = vec2(0.5 * ar, 0.5);
  vec2 d = auv - c;
  float r = length(d);
  float a = atan(d.y, d.x);
  float sw = a + (1.0 / (r + 0.22)) * (1.4 + w * 3.0) - t * 0.5;
  float bands = 0.5 + 0.5 * sin(sw * 3.0);
  vec3 col = ramp(bands * 0.85 + r * 0.3);
  return mix(u_base, col, smoothstep(1.2, 0.05, r) * 0.95 + 0.05);
}

vec3 shWaves(vec2 auv, float t, float w) {
  float y = auv.y * 3.0;
  float wave = sin(auv.x * 4.0 + t * 0.9) * (0.25 + w) + sin(auv.x * 7.3 - t * 0.6) * 0.12;
  float band = fract((y + wave) * 0.9);
  float k = smoothstep(0.0, 1.0, band);
  return mix(u_base, ramp(mix(auv.y, k, 0.55)), 0.9);
}

vec3 shMetaballs(vec2 auv, float ar, float t, float w) {
  float f = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 c = vec2(0.5 * ar + cos(t * (0.3 + fi * 0.07) + fi * 2.1) * (0.34 * ar + w),
                  0.5 + sin(t * (0.26 + fi * 0.05) + fi * 1.3) * 0.34);
    float r = 0.16 + 0.05 * sin(t * 0.4 + fi);
    f += r * r / max(dot(auv - c, auv - c), 0.0004);
  }
  float m = smoothstep(0.8, 1.9, f);
  vec3 col = mix(u_base, ramp(clamp(f * 0.28, 0.0, 1.0)), m);
  return col + m * 0.05;
}

vec3 shGodrays(vec2 auv, float ar, float t, float w) {
  vec2 c = vec2(0.5 * ar, -0.12);
  vec2 d = auv - c;
  float a = atan(d.x, d.y);
  float r = length(d);
  float rays = 0.5 + 0.5 * sin(a * 22.0 + t * 0.5);
  rays *= 0.5 + 0.5 * sin(a * 9.0 - t * 0.32 + fbm(vec2(a * 3.0, t * 0.2)) * (2.0 + w * 6.0));
  float fall = smoothstep(1.5, 0.0, r);
  vec3 col = mix(u_base, ramp(0.15 + r * 0.7), fall * 0.7);
  col += ramp(0.6) * rays * fall * 0.55;
  return col;
}

vec3 shWarp(vec2 auv, float t, float w) {
  vec2 p = auv;
  for (int i = 0; i < 4; i++) {
    p += vec2(fbm(p * 2.1 + t * 0.09), fbm(p * 2.1 - t * 0.07 + 3.7)) * (0.18 + w * 0.9) - (0.09 + w * 0.45);
  }
  float v = fbm(p * 1.8);
  return mix(u_base, ramp(v * 1.15), 0.94);
}

vec3 shDots(vec2 auv, float t, float w) {
  vec2 g = auv * (28.0 - w * 8.0);
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float ph = hash(id) * 6.28;
  vec2 off = vec2(cos(t * 0.9 + ph), sin(t * 0.9 + ph)) * 0.28;
  float d = length(f - off);
  float grad = clamp((auv.x + auv.y) * 0.5 + fbm(auv * 1.4 + t * 0.05) * 0.5, 0.0, 1.0);
  float dot0 = smoothstep(0.34, 0.06, d);
  vec3 col = mix(u_base, ramp(grad), dot0 * 0.95);
  return col + dot0 * 0.04;
}

vec3 shMetal(vec2 auv, float t, float w) {
  vec2 p = auv * 2.4;
  float n = fbm(p + vec2(t * 0.12, -t * 0.08));
  float m = fbm(p * 2.2 - vec2(t * 0.1, t * 0.14) + 5.0);
  float ridge = abs(sin((n * 3.0 + m * 2.0 + t * 0.2) * PI * (1.2 + w * 2.0)));
  float spec = pow(1.0 - ridge, 6.0);
  vec3 col = mix(u_base, ramp(ridge * 0.8 + 0.1), 0.85);
  return col + spec * 0.55;
}

vec3 shAurora(vec2 auv, float t, float w) {
  vec3 col = u_base;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float y = 0.28 + fi * 0.16 + sin(auv.x * (2.2 + fi) + t * (0.4 + fi * 0.1)) * (0.09 + w * 0.3)
            + fbm(vec2(auv.x * 2.0 + fi, t * 0.2)) * 0.14;
    float band = smoothstep(0.20, 0.0, abs(auv.y - y));
    vec3 c = fi < 1.0 ? u_c0 : (fi < 2.0 ? u_c1 : (fi < 3.0 ? u_c2 : u_c3));
    col += c * band * 0.62;
  }
  return col;
}

vec3 shPlasma(vec2 auv, float t, float w) {
  vec2 p = auv * (3.0 + w * 4.0);
  float v = sin(p.x + t * 0.7) + sin(p.y * 1.3 - t * 0.5)
          + sin((p.x + p.y) * 0.8 + t * 0.4)
          + sin(length(p - vec2(1.5, 1.0)) * 1.8 - t * 0.9);
  return mix(u_base, ramp(0.5 + 0.25 * v), 0.95);
}

vec3 shVoronoi(vec2 auv, float t, float w) {
  vec2 g = auv * (7.0 + w * 6.0);
  vec2 i = floor(g), f = fract(g);
  float d1 = 8.0, d2 = 8.0;
  vec2 best = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash2(i + o);
      vec2 pt = o + 0.5 + 0.45 * sin(t * 0.6 + 6.28 * h);
      float d = length(pt - f);
      if (d < d1) { d2 = d1; d1 = d; best = h; }
      else if (d < d2) { d2 = d; }
    }
  }
  float edge = smoothstep(0.0, 0.14, d2 - d1);
  vec3 col = mix(u_base, ramp(hash(i + best) * 0.9 + d1 * 0.3), 0.9);
  return col * (0.55 + 0.45 * edge);
}

/* ---- new looks ---- */

vec3 shRings(vec2 auv, float ar, float t, float w) {
  vec2 c = vec2(0.5 * ar, 0.5);
  vec2 d = auv - c;
  float r = length(d) * (4.0 + w * 6.0);
  float wob = fbm(d * 2.0 + t * 0.12) * (0.5 + w * 2.0);
  float k = 0.5 + 0.5 * sin((r + wob) * 3.4 - t * 1.2);
  vec3 col = mix(u_base, ramp(k * 0.85 + 0.08), 0.92);
  return col + pow(k, 8.0) * 0.18;
}

vec3 shCaustics(vec2 auv, float t, float w) {
  vec2 p = auv * 3.2;
  float acc = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i) + 1.0;
    vec2 q = p + vec2(sin(t * 0.3 * fi + fi), cos(t * 0.27 * fi - fi)) * (0.6 + w * 1.4);
    acc += abs(sin(q.x * fi * 0.9 + fbm(q) * 3.0) * cos(q.y * fi * 0.8 - fbm(q + 3.1) * 3.0));
  }
  float k = pow(clamp(1.0 - acc * 0.3, 0.0, 1.0), 2.2);
  vec3 col = mix(u_base, ramp(0.15 + k * 0.85), 0.9);
  return col + k * 0.35;
}

vec3 shMoire(vec2 auv, float ar, float t, float w) {
  vec2 a = rot(auv - vec2(0.5 * ar, 0.5), t * 0.12) * (34.0 + w * 40.0);
  vec2 b = rot(auv - vec2(0.5 * ar, 0.5), t * 0.12 + 0.12 + w * 0.2) * (34.0 + w * 40.0);
  float k = (sin(a.x) * sin(b.x) + sin(a.y * 0.9) * sin(b.y * 0.9)) * 0.25 + 0.5;
  return mix(u_base, ramp(k), 0.94);
}

vec3 shSilk(vec2 auv, float t, float w) {
  vec2 p = auv * 2.0;
  float f = fbm(p + vec2(t * 0.05, -t * 0.04));
  float g = fbm(p * 1.6 + f * (1.2 + w * 3.0) + 2.7);
  float k = 0.5 + 0.5 * sin((f * 2.0 + g * 3.0) * PI * 1.6 - t * 0.4);
  vec3 col = mix(u_base, ramp(k * 0.9 + 0.05), 0.95);
  return col + pow(k, 5.0) * 0.12;
}

vec3 shTunnel(vec2 auv, float ar, float t, float w) {
  vec2 d = auv - vec2(0.5 * ar, 0.5);
  float r = max(length(d), 0.001);
  float a = atan(d.y, d.x);
  float z = 1.0 / r + t * 0.8;
  float k = 0.5 + 0.5 * sin(z * 2.2 + sin(a * 6.0 + t * 0.4) * (0.8 + w * 3.0));
  vec3 col = mix(u_base, ramp(k * 0.8 + r * 0.25), smoothstep(1.4, 0.02, r));
  return col;
}

vec3 shKaleido(vec2 auv, float ar, float t, float w) {
  vec2 d = auv - vec2(0.5 * ar, 0.5);
  float a = atan(d.y, d.x);
  float r = length(d);
  float seg = 6.0;
  a = abs(mod(a + PI / seg, 2.0 * PI / seg) - PI / seg);
  vec2 p = vec2(cos(a), sin(a)) * r * (3.0 + w * 3.0);
  float k = fbm(p + vec2(t * 0.16, -t * 0.1)) * 1.2;
  vec3 col = mix(u_base, ramp(k), 0.93);
  return col * (0.7 + 0.5 * smoothstep(1.1, 0.05, r));
}

vec3 shMarble(vec2 auv, float t, float w) {
  vec2 p = auv * 2.6;
  float n = fbm(p + vec2(t * 0.05, t * 0.03));
  float v = sin((p.x + p.y) * 1.6 + n * (5.0 + w * 10.0) + t * 0.2);
  float k = pow(abs(v), 0.6);
  vec3 col = mix(u_base, ramp(1.0 - k), 0.94);
  return col + pow(1.0 - k, 6.0) * 0.2;
}

vec3 shHalftone(vec2 auv, float t, float w) {
  float grad = clamp(fbm(auv * 1.6 + vec2(t * 0.07, -t * 0.05)) * 1.4, 0.0, 1.0);
  vec2 g = auv * (40.0 - w * 14.0);
  vec2 f = fract(g) - 0.5;
  float rad = 0.52 * grad;
  float dot0 = smoothstep(rad, rad - 0.12, length(f));
  vec3 ink = ramp(grad);
  return mix(u_base, ink, dot0);
}

vec3 shLava(vec2 auv, float t, float w) {
  vec2 p = auv * 2.2;
  float n = fbm(p + vec2(0.0, -t * 0.22));
  float m = fbm(p * 2.1 + vec2(t * 0.07, -t * 0.3) + 4.0);
  float k = clamp(n * 0.9 + m * 0.5 + w * 0.3, 0.0, 1.0);
  float cracks = smoothstep(0.44, 0.5, abs(n - m));
  vec3 col = mix(u_base, ramp(pow(k, 1.6)), 0.95);
  return col + cracks * 0.28;
}

vec3 shRipple(vec2 auv, float ar, float t, float w) {
  vec3 col = u_base;
  float acc = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(0.5 * ar + sin(t * 0.3 + fi * 2.0) * 0.28 * ar, 0.5 + cos(t * 0.26 + fi * 1.7) * 0.26);
    float r = length(auv - c);
    acc += sin(r * (18.0 + w * 26.0) - t * 2.2 - fi) * exp(-r * 2.2);
  }
  float k = 0.5 + 0.4 * acc;
  return mix(col, ramp(k), 0.93);
}

vec3 shStripes(vec2 auv, float ar, float t, float w) {
  vec2 p = rot(auv - vec2(0.5 * ar, 0.5), 0.5 + sin(t * 0.15) * 0.15);
  float wob = fbm(p * 1.8 + t * 0.1) * (0.4 + w * 2.0);
  float k = fract(p.x * (6.0 + w * 8.0) + wob + t * 0.2);
  float band = smoothstep(0.0, 0.5, k) * smoothstep(1.0, 0.5, k);
  vec3 col = mix(u_base, ramp(p.x + 0.5), 0.55 + 0.45 * band);
  return col;
}

vec3 shCrystal(vec2 auv, float t, float w) {
  vec2 g = auv * (5.0 + w * 5.0);
  vec2 i = floor(g), f = fract(g);
  float d1 = 8.0;
  vec2 best = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash2(i + o);
      vec2 pt = o + 0.5 + 0.4 * sin(t * 0.4 + 6.28 * h);
      float d = max(abs(pt.x - f.x), abs(pt.y - f.y));
      if (d < d1) { d1 = d; best = h; }
    }
  }
  float facet = hash(i + best);
  vec3 col = mix(u_base, ramp(facet), 0.92);
  return col * (0.7 + 0.6 * (1.0 - d1));
}

vec3 shSmoke(vec2 auv, float t, float w) {
  vec2 p = auv * 1.9;
  float a = fbm(p + vec2(t * 0.06, -t * 0.09));
  float b = fbm(p * 1.7 + vec2(a * (1.5 + w * 3.0), -a) + 6.3);
  float c = fbm(p * 2.6 + vec2(-b, b) * 1.2 + 11.1);
  float k = clamp(a * 0.5 + b * 0.4 + c * 0.35, 0.0, 1.0);
  return mix(u_base, ramp(smoothstep(0.1, 0.95, k)), 0.96);
}

vec3 shSpiral(vec2 auv, float ar, float t, float w) {
  vec2 d = auv - vec2(0.5 * ar, 0.5);
  float r = length(d);
  float a = atan(d.y, d.x);
  float k = 0.5 + 0.5 * sin(a * 3.0 + log(r + 0.08) * (8.0 + w * 12.0) - t * 1.1);
  vec3 col = mix(u_base, ramp(k * 0.85 + r * 0.2), 0.94);
  return col * (0.72 + 0.4 * smoothstep(1.3, 0.05, r));
}

vec3 look(int mode, vec2 auv, float ar, float t, float w) {
  if (mode == 0) return shMesh(auv, ar, t, w);
  if (mode == 1) return shGrain(auv, t, w);
  if (mode == 2) return shWarp(auv, t, w);
  if (mode == 3) return shSilk(auv, t, w);
  if (mode == 4) return shSmoke(auv, t, w);
  if (mode == 5) return shAurora(auv, t, w);
  if (mode == 6) return shLava(auv, t, w);
  if (mode == 7) return shMetaballs(auv, ar, t, w);
  if (mode == 8) return shCaustics(auv, t, w);
  if (mode == 9) return shMarble(auv, t, w);
  if (mode == 10) return shPlasma(auv, t, w);
  if (mode == 11) return shVoronoi(auv, t, w);
  if (mode == 12) return shCrystal(auv, t, w);
  if (mode == 13) return shSwirl(auv, ar, t, w);
  if (mode == 14) return shSpiral(auv, ar, t, w);
  if (mode == 15) return shRings(auv, ar, t, w);
  if (mode == 16) return shWaves(auv, t, w);
  if (mode == 17) return shRipple(auv, ar, t, w);
  if (mode == 18) return shStripes(auv, ar, t, w);
  if (mode == 19) return shMoire(auv, ar, t, w);
  if (mode == 20) return shTunnel(auv, ar, t, w);
  if (mode == 21) return shKaleido(auv, ar, t, w);
  if (mode == 22) return shGodrays(auv, ar, t, w);
  if (mode == 23) return shMetal(auv, t, w);
  if (mode == 24) return shDots(auv, t, w);
  return shHalftone(auv, t, w);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  // Optional pixelation grid (also drives dither/scanline scale)
  float cell = max(u_grid, 1.0);
  vec2 snapped = (floor(frag / cell) + 0.5) * cell;
  vec2 uv = snapped / u_res;
  uv.y = 1.0 - uv.y;
  float ar = u_res.x / max(u_res.y, 1.0);
  vec2 auv = vec2(uv.x * ar, uv.y);

  // Zoom around the center keeps every look framed the same way
  vec2 ctr = vec2(0.5 * ar, 0.5);
  auv = ctr + (auv - ctr) / max(u_scale, 0.05);

  float t = u_time;
  float w = u_warp;
  int mode = int(u_mode + 0.5);

  vec3 col = look(mode, auv, ar, t, w);

  // Contrast around mid grey, then blend back toward the base color
  col = clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  col = mix(u_base, col, clamp(u_blend, 0.0, 1.0));

  // Posterize / banding
  if (u_steps > 1.5) {
    col = floor(col * u_steps + 0.5) / u_steps;
  }

  // Ordered dithering (great combined with posterize)
  if (u_dither > 0.001) {
    col += bayer(frag / cell) * u_dither;
  }

  // Animated film noise
  if (u_noise > 0.001) {
    float g = hash(frag + vec2(t * 91.7, t * 57.3));
    col += (g - 0.5) * u_noise;
  }

  // Scanlines
  if (u_scan > 0.001) {
    float sl = sin((frag.y / cell) * PI);
    col *= 1.0 - u_scan * 0.5 * (0.5 + 0.5 * sl);
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

function hexToRgb(hex: string): [number, number, number] {
  const h = (hex ?? '').trim()
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h)
  if (!m) {
    const rgb = /rgba?\(([^)]+)\)/i.exec(h)
    if (rgb) {
      const parts = (rgb[1] ?? '').split(',').map((v) => parseFloat(v) / 255)
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
    }
    return [0, 0, 0]
  }
  let v = m[1] ?? '000000'
  if (v.length === 3)
    v = v
      .split('')
      .map((c) => c + c)
      .join('')
  const n = parseInt(v, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const UNIFORMS = [
  'u_res',
  'u_time',
  'u_base',
  'u_c0',
  'u_c1',
  'u_c2',
  'u_c3',
  'u_warp',
  'u_dither',
  'u_noise',
  'u_scan',
  'u_steps',
  'u_grid',
  'u_mode',
  'u_scale',
  'u_contrast',
  'u_blend',
]

export function MeshWebGL({
  width,
  height,
  time,
  base,
  colors,
  shader = 'mesh',
  effect,
  warp,
  dither,
  noise,
  scan,
  steps,
  grid,
  scale = 100,
  contrast = 100,
  blend = 100,
  dpr = 2,
}: {
  width: number
  height: number
  time: number
  base: string
  colors: [string, string, string, string]
  shader?: MeshShader
  effect: MeshEffect
  warp: number
  dither: number
  noise: number
  scan: number
  steps: number
  grid: number
  /** zoom in % (100 = default framing) */
  scale?: number
  /** contrast in % (100 = neutral) */
  contrast?: number
  /** blend with base color in % (100 = full shader) */
  blend?: number
  dpr?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<{
    gl: WebGLRenderingContext
    prog: WebGLProgram
    buf: WebGLBuffer | null
    u: (name: string) => WebGLUniformLocation | null
  } | null>(null)
  const versionRef = useRef(0)

  // Effect presets modulate the raw sliders so each mode reads distinctly.
  const p = useMemo(() => {
    const k = {
      smooth: { d: 0, n: 0, s: 0, st: 0, w: warp, g: 1 },
      dither: { d: dither, n: 0, s: 0, st: Math.max(3, steps), w: warp, g: grid },
      noise: { d: 0, n: noise, s: 0, st: 0, w: warp, g: 1 },
      scan: { d: dither * 0.4, n: noise * 0.4, s: scan, st: 0, w: warp, g: grid },
      liquid: { d: 0, n: noise * 0.3, s: 0, st: 0, w: warp * 2.2, g: 1 },
      posterize: { d: dither * 0.5, n: 0, s: 0, st: Math.max(2, steps), w: warp, g: grid },
      max: { d: dither, n: noise, s: scan, st: Math.max(3, steps), w: warp * 1.6, g: grid },
    } as const
    return k[effect] ?? k.smooth
  }, [effect, warp, dither, noise, scan, steps, grid])

  const init = useCallback(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    }) as WebGLRenderingContext | null
    if (!gl) return

    const mk = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('[MeshWebGL] shader compile failed:', gl.getShaderInfoLog(sh))
      }
      return sh
    }
    const prog = gl.createProgram()!
    const vs = mk(gl.VERTEX_SHADER, VERT)
    const fs = mk(gl.FRAGMENT_SHADER, FRAG)
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[MeshWebGL] program link failed:', gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const table = new Map<string, WebGLUniformLocation | null>()
    UNIFORMS.forEach((n) => table.set(n, gl.getUniformLocation(prog, n)))
    glRef.current = { gl, prog, buf, u: (n: string) => table.get(n) ?? null }
    versionRef.current += 1
  }, [])

  useEffect(() => {
    init()
    const canvas = ref.current
    const onLost = (e: Event) => {
      e.preventDefault()
      glRef.current = null
    }
    const onRestored = () => init()
    canvas?.addEventListener('webglcontextlost', onLost as EventListener)
    canvas?.addEventListener('webglcontextrestored', onRestored as EventListener)
    return () => {
      canvas?.removeEventListener('webglcontextlost', onLost as EventListener)
      canvas?.removeEventListener('webglcontextrestored', onRestored as EventListener)
      const ctx = glRef.current
      glRef.current = null
      if (ctx) {
        ctx.gl.deleteProgram(ctx.prog)
        if (ctx.buf) ctx.gl.deleteBuffer(ctx.buf)
      }
    }
  }, [init])

  useEffect(() => {
    const canvas = ref.current
    const ctx = glRef.current
    if (!canvas || !ctx) return
    const { gl, u } = ctx
    if (gl.isContextLost()) return
    const maxDim = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    const safeDpr = Math.min(dpr, Math.max(1, maxDim / Math.max(width, height, 1)))
    const w = Math.max(1, Math.round(width * safeDpr))
    const h = Math.max(1, Math.round(height * safeDpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.uniform2f(u('u_res'), w, h)
    gl.uniform1f(u('u_time'), time)
    gl.uniform3fv(u('u_base'), hexToRgb(base))
    gl.uniform3fv(u('u_c0'), hexToRgb(colors[0]))
    gl.uniform3fv(u('u_c1'), hexToRgb(colors[1]))
    gl.uniform3fv(u('u_c2'), hexToRgb(colors[2]))
    gl.uniform3fv(u('u_c3'), hexToRgb(colors[3]))
    gl.uniform1f(u('u_warp'), p.w / 100)
    gl.uniform1f(u('u_dither'), p.d / 100)
    gl.uniform1f(u('u_noise'), p.n / 100)
    gl.uniform1f(u('u_scan'), p.s / 100)
    gl.uniform1f(u('u_steps'), p.st)
    gl.uniform1f(u('u_grid'), Math.max(1, p.g) * safeDpr)
    gl.uniform1f(u('u_mode'), SHADER_INDEX[shader] ?? 0)
    gl.uniform1f(u('u_scale'), Math.max(20, scale) / 100)
    gl.uniform1f(u('u_contrast'), Math.max(10, contrast) / 100)
    gl.uniform1f(u('u_blend'), Math.max(0, blend) / 100)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }, [width, height, time, base, colors, p, shader, scale, contrast, blend, dpr])

  return (
    <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
  )
}
