export const CARD_H = 2.2
export const RADIUS = 3.8
export const RADIUS_STEP = 0.055
export const CAMERA_Z = 10
export const FOV = 48
export const NEAR = 0.1
export const FAR = 60
export const BEND = 2.7

export const BAYER = /* glsl */ `
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
#define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
#define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))
`

export const CARD_VERT = /* glsl */ `#version 300 es
in vec2 aPos;

uniform float uIndex;
uniform float uProgress;
uniform float uCount;
uniform float uAngleStep;
uniform float uPitch;
uniform float uVelocity;
uniform vec2  uCard;
uniform float uFocal;
uniform float uAspect;

out vec2 vUv;
out float vDepth;

const float RADIUS = ${RADIUS.toFixed(3)};
const float RADIUS_STEP = ${RADIUS_STEP.toFixed(4)};
const float CAMERA_Z = ${CAMERA_Z.toFixed(1)};
const float NEAR = ${NEAR.toFixed(2)};
const float FAR = ${FAR.toFixed(1)};
const float BEND = ${BEND.toFixed(2)};

void main() {
  vUv = vec2(aPos.x, 1.0 - aPos.y);
  vec2 local = (aPos - 0.5) * uCard;

  float slot = mod(uIndex - uProgress, uCount) - floor(uCount * 0.5);
  float baseAngle = slot * uAngleStep;
  float baseY = slot * uPitch;

  float ty = (aPos.y - 0.5) * 2.0;
  baseAngle += uVelocity * BEND * ty * ty * uAngleStep * 0.5;

  float r = RADIUS + slot * RADIUS_STEP;
  float theta = baseAngle + local.x / r;
  vec3 p = vec3(sin(theta) * r, local.y + baseY, cos(theta) * r);

  float vz = p.z - CAMERA_Z;
  vDepth = -vz;
  gl_Position = vec4(
    p.x * uFocal / uAspect,
    p.y * uFocal,
    ((FAR + NEAR) * vz + 2.0 * FAR * NEAR) / (NEAR - FAR),
    -vz
  );
}`

export const CARD_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
in float vDepth;

uniform sampler2D uMap;
uniform vec2 uImageRatio;
uniform vec3 uBackground;
uniform float uHover;
uniform float uDim;
uniform float uEntry;
uniform float uEntryScale;
uniform float uEntryAspect;

layout(location = 0) out vec4 outScene;
layout(location = 1) out vec4 outMeta;

const float FOG_NEAR = 8.0;
const float FOG_FAR = 20.6;
const float DIM_FADE = 0.67;
const float ENTRY_SOFTNESS = 0.45;

${BAYER}

bool notArrived(vec2 uv) {
  if (uEntry <= 0.0) return false;
  vec2 offset = (uv - 0.5) * vec2(uEntryAspect, 1.0);
  float d = length(offset) / length(vec2(uEntryAspect, 1.0) * 0.5);
  float front = (1.0 - uEntry) * (1.0 + ENTRY_SOFTNESS);
  return (front - d) / ENTRY_SOFTNESS <= bayer8(gl_FragCoord.xy / uEntryScale);
}

void main() {
  if (notArrived(vUv)) discard;

  vec2 uv = (vUv - 0.5) * uImageRatio + 0.5;
  vec3 color = texture(uMap, uv).rgb;

  float fog = smoothstep(FOG_NEAR, FOG_FAR, vDepth) * (1.0 - uHover);
  color = mix(color, uBackground, fog);

  color = mix(color, uBackground, 1.0 - pow(1.0 - uDim * DIM_FADE, 2.2));

  outScene = vec4(color, 1.0 - fog);
  outMeta = vec4(0.0, uDim, uHover, 1.0 - uEntry);
}`

export const QUAD_VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}`

export const BLUR_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uTexel;
uniform float uSpread;
out vec4 fragColor;
void main() {
  vec2 stride = vec2(0.0, uTexel.y) * uSpread;
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int i = -8; i <= 8; i++) {
    float fi = float(i);
    float w = exp(-fi * fi / 18.0);
    sum += texture(uMap, vUv + stride * fi) * w;
    total += w;
  }
  fragColor = sum / total;
}`

export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;

uniform sampler2D uScene;
uniform sampler2D uMeta;
uniform sampler2D uBlur1;
uniform sampler2D uBlur2;
uniform sampler2D uBlur3;
uniform sampler2D uBlur4;

uniform vec2  uResolution;
uniform vec3  uBackground;
uniform vec3  uAccent;
uniform float uFocusSize;
uniform float uDitherScale;
uniform float uEntryScale;

out vec4 fragColor;

const float EDGE_POWER = 1.65;
const float BLUR_STRENGTH = 0.47;
const float FADE_STRENGTH = 0.4;
const float DITHER_AMOUNT = 0.77;
const float DITHER_START = 0.64;
const float DITHER_POWER = 1.25;
const float LEVELS = 8.0;
const float GAMMA = 1.8;
const float MONO = 0.22;

const float STAGING = 0.55;
const float SMEAR_END = 0.55;
const float GRAIN_BEGIN = 0.45;
const float YIELD = 0.75;

const float HOVER_BLUR = 0.13;
const float HOVER_DITHER = 0.3;
const float HOVER_CURVE = 1.9;
const float HOVER_LEVELS = 8.0;
const float HOVER_CUTOFF = 0.22;
const float HOVER_GAMMA = 1.8;
const float ENTRY_DITHER = 0.45;
const float ENTRY_LEVELS = 4.0;
const float ENTRY_GAMMA = 1.5;

${BAYER}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 blurStack(vec2 uv, float lvl) {
  vec3 c = texture(uScene, uv).rgb;
  c = mix(c, texture(uBlur1, uv).rgb, clamp(lvl - 0.0, 0.0, 1.0));
  c = mix(c, texture(uBlur2, uv).rgb, clamp(lvl - 1.0, 0.0, 1.0));
  c = mix(c, texture(uBlur3, uv).rgb, clamp(lvl - 2.0, 0.0, 1.0));
  c = mix(c, texture(uBlur4, uv).rgb, clamp(lvl - 3.0, 0.0, 1.0));
  return c;
}

vec3 towardPage(vec3 c, float fade) { return mix(c, uBackground, fade); }

vec2 latticeUv(float cell) {
  return (floor(gl_FragCoord.xy / cell) + 0.5) * cell / uResolution;
}

vec3 toneScale(float t) {
  return t < 0.5
    ? mix(uBackground, uAccent, t * 2.0)
    : mix(uAccent, uBackground, (t - 0.5) * 2.0);
}

vec3 quantise(vec3 c, float threshold, float levels, float gamma) {
  float steps = max(levels - 1.0, 1.0);
  vec3 toned = toneScale(floor(pow(clamp(luma(c), 0.0, 1.0), gamma) * steps + threshold) / steps);
  vec3 quantized = floor(c * steps + threshold) / steps;
  return mix(quantized, toned, MONO);
}

void main() {
  float d = abs(vUv.y - 0.5) * 2.0;
  float edge = pow(smoothstep(uFocusSize, 1.0, d), EDGE_POWER);

  vec4 scene = texture(uScene, vUv);
  vec4 meta = texture(uMeta, vUv);
  float dim = meta.g;
  float entry = 1.0 - meta.a;

  float keep = 1.0 - meta.b;

  float distance = 1.0 - scene.a;
  float dissolve = max(edge, distance);

  float grainFree = pow(smoothstep(DITHER_START, 1.0, max(d, distance)), DITHER_POWER);
  float grainStaged = pow(smoothstep(GRAIN_BEGIN, 1.0, dissolve), DITHER_POWER);
  float smearStaged = smoothstep(0.0, SMEAR_END, dissolve) * (1.0 - grainStaged * YIELD);

  float blurDrive = mix(dissolve, smearStaged, STAGING);
  float ditherDrive = mix(grainFree, grainStaged, STAGING);

  float softness = max(blurDrive, dim * HOVER_BLUR) * keep;
  float lvl = softness * BLUR_STRENGTH * 4.0;
  float fade = edge * FADE_STRENGTH * keep;

  vec3 c = towardPage(blurStack(vUv, lvl), fade);

  float threshold = bayer8(gl_FragCoord.xy / uDitherScale);
  vec3 source = uDitherScale > 1.0
    ? towardPage(blurStack(latticeUv(uDitherScale), lvl), fade)
    : c;
  vec3 result = mix(c, quantise(source, threshold, LEVELS, GAMMA), DITHER_AMOUNT * ditherDrive * keep);

  float hoverRamp = smoothstep(HOVER_CUTOFF, 1.0, pow(dim, HOVER_CURVE)) * HOVER_DITHER;
  float hoverThreshold = bayer8(gl_FragCoord.xy / (uDitherScale * 1.35));
  vec3 hoverSource = towardPage(blurStack(latticeUv(uDitherScale * 1.35), lvl), fade);
  result = mix(result, quantise(hoverSource, hoverThreshold, HOVER_LEVELS, HOVER_GAMMA), hoverRamp);

  float entryThreshold = bayer8(gl_FragCoord.xy / uEntryScale);
  vec3 entrySource = towardPage(blurStack(latticeUv(uEntryScale), lvl), fade);
  result = mix(
    result,
    quantise(entrySource, entryThreshold, ENTRY_LEVELS, ENTRY_GAMMA),
    entry * ENTRY_DITHER
  );

  fragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}`
