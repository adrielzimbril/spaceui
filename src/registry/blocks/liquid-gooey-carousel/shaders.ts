/** Maximum simultaneous card SDF evaluations per fullscreen fragment pass. */
export const MAX_CARDS = 24

/** Maximum simultaneous metaball strand bridge terms. */
export const MAX_STRANDS = 24

/**
 * Fullscreen clip-space quad vertex shader.
 */
export const FULLSCREEN_VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}
`

/**
 * High-performance signed distance field fragment shader.
 * Evaluates smooth-minimum (smin) metaball card surfaces, dynamic strand bridges,
 * pointer wake perturbation, and chromatic boundary refraction in a single fullscreen pass.
 */
export const LIQUID_GOOEY_FRAGMENT_SHADER =
  /* glsl */ `#version 300 es
precision highp float;

#define MAX_CARDS ` +
  MAX_CARDS +
  `
#define MAX_STRANDS ` +
  MAX_STRANDS +
  `

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uResolution;
uniform vec2  uSize;
uniform float uCorner;

uniform float uCount;
uniform vec2  uCentre[MAX_CARDS];
uniform float uAngle[MAX_CARDS];
uniform vec4  uCardState[MAX_CARDS];

uniform float uStrandCount;
uniform vec2  uStrandA[MAX_STRANDS];
uniform vec2  uStrandB[MAX_STRANDS];
uniform vec4  uStrandPar[MAX_STRANDS];

uniform float uFuse;
uniform float uJitter;
uniform float uTime;
uniform vec3  uColor;

uniform sampler2D uAtlas;
uniform vec2  uGrid;
uniform float uCrossfade;
uniform float uHasArt;

uniform vec4  uCursor;
uniform vec4  uWake;

uniform float uLipDepth;
uniform vec4  uLip;
uniform float uFringe;
uniform float uSheen;

// Maps normalized local tile UV coordinates to the global texture atlas grid
vec2 computeAtlasCoord(vec2 uv, float cellIndex) {
  vec2 cellOffset = vec2(mod(cellIndex, uGrid.x), floor(cellIndex / uGrid.x));
  return (cellOffset + uv) / uGrid;
}

// Low-overhead procedural hash generator for surface tension modulation
float fastHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Continuous value noise for fluid capillary ripples
float fluidNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(fastHash(i), fastHash(i + vec2(1.0, 0.0)), f.x),
    mix(fastHash(i + vec2(0.0, 1.0)), fastHash(i + vec2(1.0, 1.0)), f.x),
    f.y
  ) * 2.0 - 1.0;
}

// Signed distance function for a rounded rectangle
float sdRoundedRect(vec2 p, vec2 dimensions, float radius) {
  vec2 offset = abs(p) - dimensions + radius;
  return min(max(offset.x, offset.y), 0.0) + length(max(offset, 0.0)) - radius;
}

// Signed distance function for an organic metaball strand connecting two cards
float sdMetaballStrand(vec2 p, vec2 p1, vec2 p2, float rEnd, float rCenter, float droop) {
  vec2 delta = p2 - p1;
  float span = length(delta);
  if (span < 0.001) return 1e6;

  vec2 tangent = delta / span;
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 localP = p - (p1 + p2) * 0.5;

  float u = dot(localP, tangent);
  float v = dot(localP, normal);

  float normT = clamp(u / span + 0.5, 0.0, 1.0);
  float waistProfile = sin(3.14159265 * normT);
  v += droop * waistProfile * normal.y;
  float thickness = mix(rCenter, rEnd, pow(1.0 - waistProfile, 1.7));

  return max(abs(u) - span * 0.5, abs(v) - thickness);
}

// Smooth polynomial minimum operator for organic fluid metaball fusion
float smoothUnionSDF(float d1, float d2, float blend) {
  if (blend <= 0.0001) return min(d1, d2);
  float h = clamp(0.5 + 0.5 * (d2 - d1) / blend, 0.0, 1.0);
  return mix(d2, d1, h) - blend * h * (1.0 - h);
}

// Chromatic optical edge distortion along viewport boundaries
float opticalEdgeDistortion(inout vec2 p) {
  if (uLipDepth <= 0.5) return 0.0;
  float marginDist = abs(p.y) - (uResolution.y * 0.5 - uLipDepth);
  if (marginDist <= 0.0) return 0.0;

  float t = clamp(marginDist / uLipDepth, 0.0, 1.0);
  float refraction = 1.0 - sqrt(max(0.0, 1.0 - t * t));

  p.y -= sign(p.y) * refraction * (uLip.x + sin(p.x * uLip.w) * uLip.z);
  p.x *= 1.0 - refraction * uLip.y;
  return refraction;
}

void main() {
  vec2 p = (vUv - 0.5) * uResolution;
  float refractionBend = opticalEdgeDistortion(p);

  float cursorDist = length(p - uCursor.xy);
  float dynamicFusion = uFuse;

  if (uCursor.z > 0.001) {
    float influence = 1.0 - smoothstep(0.0, max(uWake.x, 1.0), cursorDist);
    dynamicFusion += uCursor.w * uCursor.z * influence * influence;
  }

  float globalSDF = 1e6;
  float distPrimary = 1e6;
  float distSecondary = 1e6;

  vec2 uvPrimary = vec2(0.5);
  vec2 uvSecondary = vec2(0.5);
  float idPrimary = 0.0;
  float idSecondary = 0.0;
  float lumPrimary = 1.0;
  float lumSecondary = 1.0;

  float boundRadius = length(uSize) * 0.5;

  // Evaluate card surfaces
  for (int i = 0; i < MAX_CARDS; i++) {
    if (float(i) >= uCount) break;

    vec4 state = uCardState[i];
    float maxScale = max(state.x, state.y);
    if (maxScale <= 0.0001) continue;

    vec2 relPos = p - uCentre[i];
    float boundingSphere = boundRadius * maxScale + dynamicFusion + uJitter + 8.0;
    if (dot(relPos, relPos) > boundingSphere * boundingSphere) continue;

    float cosR = cos(uAngle[i]);
    float sinR = sin(uAngle[i]);
    relPos = vec2(relPos.x * cosR + relPos.y * sinR, -relPos.x * sinR + relPos.y * cosR);

    vec2 halfCardSize = max(uSize * 0.5 * state.xy, vec2(0.0001));
    float cornerLim = min(halfCardSize.x, halfCardSize.y);
    float cardCorner = min(cornerLim, mix(cornerLim, uCorner, smoothstep(0.30, 1.0, min(state.x, state.y))));

    float cardSDF = sdRoundedRect(relPos, halfCardSize, cardCorner);
    globalSDF = smoothUnionSDF(globalSDF, cardSDF, dynamicFusion);

    vec2 tileUV = clamp(relPos / (2.0 * halfCardSize) + 0.5, 0.004, 0.996);
    tileUV.y = 1.0 - tileUV.y;

    if (cardSDF < distPrimary) {
      distSecondary = distPrimary;
      uvSecondary = uvPrimary;
      idSecondary = idPrimary;
      lumSecondary = lumPrimary;

      distPrimary = cardSDF;
      uvPrimary = tileUV;
      idPrimary = state.w;
      lumPrimary = state.z;
    } else if (cardSDF < distSecondary) {
      distSecondary = cardSDF;
      uvSecondary = tileUV;
      idSecondary = state.w;
      lumSecondary = state.z;
    }
  }

  // Evaluate metaball strand bridges
  for (int j = 0; j < MAX_STRANDS; j++) {
    if (float(j) >= uStrandCount) break;
    vec4 strandParams = uStrandPar[j];
    if (strandParams.x <= -3.0) continue;

    vec2 ptA = uStrandA[j];
    vec2 ptB = uStrandB[j];
    vec2 strandCenter = (ptA + ptB) * 0.5;
    float strandSpan = length(ptB - ptA) * 0.5 + strandParams.x + strandParams.w + 8.0;

    if (dot(p - strandCenter, p - strandCenter) > strandSpan * strandSpan) continue;

    float strandDist = sdMetaballStrand(p, ptA, ptB, strandParams.x, strandParams.y, strandParams.z);
    globalSDF = smoothUnionSDF(globalSDF, strandDist, strandParams.w);
  }

  // Fluid capillary ripple noise
  if (uJitter > 0.001) {
    globalSDF += fluidNoise(p * 0.012 + vec2(uTime * 0.22, uTime * -0.17)) * uJitter;
  }

  // Pointer wake wave modulation
  if (uWake.y > 0.001) {
    globalSDF += sin(cursorDist * uWake.z - uTime * uWake.w) * uWake.y * exp(-cursorDist / max(uWake.x, 1.0));
  }

  // Antialiased silhouette boundary
  float edgeWidth = clamp(fwidth(globalSDF), 0.5, 2.0);
  float surfaceAlpha = 1.0 - smoothstep(-edgeWidth, edgeWidth, globalSDF);
  if (surfaceAlpha <= 0.001) discard;

  // Texture blend ratio across fusing boundaries
  float blendWeight = smoothstep(-uCrossfade, uCrossfade, distSecondary - distPrimary);

  vec3 outColor = uColor;
  if (uHasArt > 0.5) {
    vec2 fringeOffset = vec2(uFringe * refractionBend, 0.0);
    vec3 samplePrimary = vec3(
      texture(uAtlas, computeAtlasCoord(uvPrimary + fringeOffset, idPrimary)).r,
      texture(uAtlas, computeAtlasCoord(uvPrimary, idPrimary)).g,
      texture(uAtlas, computeAtlasCoord(uvPrimary - fringeOffset, idPrimary)).b
    );
    vec3 sampleSecondary = vec3(
      texture(uAtlas, computeAtlasCoord(uvSecondary + fringeOffset, idSecondary)).r,
      texture(uAtlas, computeAtlasCoord(uvSecondary, idSecondary)).g,
      texture(uAtlas, computeAtlasCoord(uvSecondary - fringeOffset, idSecondary)).b
    );
    outColor = mix(sampleSecondary, samplePrimary, blendWeight);
  }

  // Focus lighting attenuation
  outColor *= mix(lumSecondary, lumPrimary, blendWeight);

  // Specular sheen along boundary margins
  outColor += refractionBend * uSheen;

  fragColor = vec4(outColor, surfaceAlpha);
}
`
