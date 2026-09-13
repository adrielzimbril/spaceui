export const PANEL_VERT = /* glsl */ `#version 300 es
in vec2 aPos;
uniform vec4 uRect;   // centre.xy, size.xy - px, origin at the stage centre
uniform vec2 uRes;
out vec2 vUv;
out vec2 vLocal;      // px from the panel centre, for the corner cut
void main() {
  vUv = vec2(aPos.x, 1.0 - aPos.y);
  vLocal = (aPos - 0.5) * uRect.zw;
  gl_Position = vec4((uRect.xy + vLocal) / (uRes * 0.5), 0.0, 1.0);
}`

export const PANEL_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vLocal;
uniform sampler2D uTex;
uniform vec4 uRect;        // cx, cy, quadW, quadH
uniform vec2 uCardSize;    // actual card w, h
uniform vec3 uBg;
uniform float uFade;       // still loading -> the panel is only its own shadow
uniform float uRadius;
uniform float uGooey;
uniform float uGap;
out vec4 fragColor;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float smoothUnionSDF(float d1, float d2, float blend) {
  if (blend <= 0.0001) return min(d1, d2);
  float h = clamp(0.5 + 0.5 * (d2 - d1) / blend, 0.0, 1.0);
  return mix(d2, d1, h) - blend * h * (1.0 - h);
}

void main() {
  vec2 halfCard = uCardSize * 0.5;
  float corner = min(uRadius, min(halfCard.x, halfCard.y));
  float dCard = sdRoundBox(vLocal, halfCard, corner);

  float dFinal = dCard;

  if (uGooey > 0.001) {
    float bridgeSpan = uGap * 0.7;
    float bridgeReach = halfCard.x + bridgeSpan;
    if (abs(vLocal.x) > halfCard.x && abs(vLocal.x) <= bridgeReach) {
      float t = (abs(vLocal.x) - halfCard.x) / bridgeSpan;
      float waistProfile = cos(clamp(t, 0.0, 1.0) * 1.5707963);
      float waistHalfH = halfCard.y * mix(0.38, 0.88, waistProfile);
      float dBridge = max(abs(vLocal.x) - bridgeReach, abs(vLocal.y) - waistHalfH);
      dFinal = smoothUnionSDF(dCard, dBridge, uGooey * 16.0);
    }
  }

  if (dFinal > 0.0) discard;

  vec2 cardUv = (vLocal / (2.0 * halfCard)) + 0.5;
  vec2 clampedUv = clamp(vec2(cardUv.x, 1.0 - cardUv.y), vec2(0.001), vec2(0.999));
  vec3 texColor = texture(uTex, clampedUv).rgb;

  if (uGooey > 0.001) {
    float meniscusSheen = exp(-pow(dFinal / 2.2, 2.0)) * 0.22 * uGooey;
    texColor += vec3(meniscusSheen);
  }

  fragColor = vec4(mix(uBg, texColor, uFade), 1.0);
}`

export const LENS_VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}`

export const LENS_FRAG = /* glsl */ `#version 300 es
precision highp float;
#define SAMPLES 12

in vec2 vUv;
uniform sampler2D uTex;
uniform float uAspect;
uniform float uTime;
uniform float uStrength;
uniform vec3 uTint;
uniform float uGooey;
out vec4 fragColor;

const float SIZE_X = 0.565;     // half-width, in screen-height units
const float SIZE_Y = 1.0;       // half-height - past the frame, so it never closes
const float ROTATION = 1.13446; // 65 degrees
const float DISPERSION = 11.0;
const float GLOW = 4.2;
const float WHITE_GLOW = 0.24;
const float NOVA_SIZE = 12.0;
const float RING = 6.0;
const float RING_RADIUS = 0.49;
const float RING_WIDTH = 0.014;
const float SHIMMER_FREQ = 12.0;
const float SHIMMER_SPEED = 3.5;
const float SHIMMER_DEPTH = 0.12;
const float RIM_START = 0.578;
const float RIM_TANGENTIAL = 0.6;
const float RIM_FREQ_1 = 2.0;
const float RIM_FREQ_2 = 1.0;
const float RIM_LINE = 1.4;
const float RIM_LINE_POS = 0.488;
const float RIM_LINE_WIDTH = 0.003;

void main() {
  vec3 base = texture(uTex, vUv).rgb;

  vec2 offset = vUv - 0.5;
  vec2 p = vec2(offset.x * uAspect, offset.y);
  float ca = cos(ROTATION), sa = sin(ROTATION);
  p = mat2(ca, -sa, sa, ca) * p;

  float nd = length(p / vec2(SIZE_X, SIZE_Y));
  if (nd > 1.0 || uStrength < 0.001) {
    fragColor = vec4(base, 1.0);
    return;
  }
  float shape = clamp(nd, 0.0, 1.0);

  vec2 radial = normalize(offset + 1e-6);
  vec2 tangent = vec2(-radial.y, radial.x);
  float angle = atan(p.y, p.x);

  float rim = smoothstep(RIM_START, 1.0, nd);
  float wave = sin(angle * RIM_FREQ_1) * 0.55 + sin(angle * RIM_FREQ_2) * 0.25;
  vec2 baseUV = 0.5 + offset
    + tangent * wave * rim * (SIZE_X + SIZE_Y) * 0.5 * RIM_TANGENTIAL * uStrength;

  vec2 dispDir = offset * DISPERSION * 0.004 * smoothstep(0.55, 1.0, nd) * uStrength;
  vec3 col = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    vec3 w = vec3(
      exp(-pow((t - 0.0) / 0.38, 2.0)),
      exp(-pow((t - 0.5) / 0.38, 2.0)),
      exp(-pow((t - 1.0) / 0.38, 2.0))
    );
    col += texture(uTex, baseUV + dispDir * (t - 0.5)).rgb * w;
    weight += w;
  }
  col /= max(weight, vec3(0.001));

  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shape));

  float r2 = shape * shape * 0.25;
  float gs = max(NOVA_SIZE * GLOW * 0.003, 0.004);
  float nova = (exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18)
             * WHITE_GLOW * (GLOW / 17.0) * 1.15;
  col += vec3(nova * uStrength);

  float dC = shape * 0.5;
  float ring = exp(-pow((dC - RING_RADIUS) / RING_WIDTH, 2.0)) * RING * (GLOW / 17.0) * 1.8;
  ring *= sin(angle * SHIMMER_FREQ + uTime * SHIMMER_SPEED) * SHIMMER_DEPTH + (1.0 - SHIMMER_DEPTH);
  float aura = exp(-pow((dC - RING_RADIUS) / (RING_WIDTH * 6.0), 2.0)) * 0.28 * RING * (GLOW / 17.0);
  col += uTint * (ring + aura) * uStrength;
  col += vec3(exp(-pow((dC - RIM_LINE_POS) / RIM_LINE_WIDTH, 2.0)) * RIM_LINE * uStrength);

  fragColor = vec4(mix(base, col, smoothstep(1.0, 0.93, nd)), 1.0);
}`
