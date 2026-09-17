export const SILK_GRADIENT_WGSL = /* wgsl */ `
struct Params {
  resolution: vec2f,
  time: f32,
  timeSpeed: f32,
  color1: vec4f,
  color2: vec4f,
  color3: vec4f,
  warp: vec4f,
  blend: vec4f,
  grain: vec4f,
  look: vec4f,
  center: vec2f,
  _pad0: f32,
  _pad1: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn rot(a: f32) -> mat2x2<f32> {
  let s = sin(a);
  let c = cos(a);
  return mat2x2<f32>(c, -s, s, c);
}

fn hash2(p: vec2f) -> vec2f {
  let q = vec2f(dot(p, vec2f(2127.1, 81.17)), dot(p, vec2f(1269.5, 283.37)));
  return fract(sin(q) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let n = mix(
    mix(
      dot(-1.0 + 2.0 * hash2(i + vec2f(0.0, 0.0)), f - vec2f(0.0, 0.0)),
      dot(-1.0 + 2.0 * hash2(i + vec2f(1.0, 0.0)), f - vec2f(1.0, 0.0)),
      u.x
    ),
    mix(
      dot(-1.0 + 2.0 * hash2(i + vec2f(0.0, 1.0)), f - vec2f(0.0, 1.0)),
      dot(-1.0 + 2.0 * hash2(i + vec2f(1.0, 1.0)), f - vec2f(1.0, 1.0)),
      u.x
    ),
    u.y
  );
  return 0.5 + 0.5 * n;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time * params.timeSpeed;
  let ratio = params.resolution.x / max(params.resolution.y, 1.0);
  var tuv = uv - 0.5 + params.center;
  tuv = tuv / max(params.look.w, 0.001);

  let degree = noise(vec2f(t * 0.1, tuv.x * tuv.y) * params.grain.w);
  tuv.y *= 1.0 / ratio;
  tuv = rot(radians((degree - 0.5) * params.blend.w + 180.0)) * tuv;
  tuv.y *= ratio;

  let frequency = params.warp.y;
  let amplitude = params.warp.w / max(params.warp.x, 0.001);
  let warpTime = t * params.warp.z;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);

  let b = params.blend.z;
  let s = max(params.blend.y, 0.0);
  let blendX = (rot(radians(params.blend.x)) * tuv).x;
  let edge0 = -0.3 - b - s;
  let edge1 = 0.2 - b + s;
  let v0 = 0.5 - b + s;
  let v1 = -0.3 - b - s;
  let layer1 = mix(params.color3.xyz, params.color2.xyz, smoothstep(edge0, edge1, blendX));
  let layer2 = mix(params.color2.xyz, params.color1.xyz, smoothstep(edge0, edge1, blendX));
  var col = mix(layer1, layer2, smoothstep(v0, v1, tuv.y));

  var grainUv = uv * max(params.grain.y, 0.001);
  if (params.grain.z > 0.5) {
    grainUv += vec2f(params.time * 0.05);
  }
  let grain = fract(sin(dot(grainUv, vec2f(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * params.grain.x;
  col = (col - 0.5) * params.look.x + 0.5;
  let luma = dot(col, vec3f(0.2126, 0.7152, 0.0722));
  col = mix(vec3f(luma), col, params.look.z);
  col = pow(max(col, vec3f(0.0)), vec3f(1.0 / max(params.look.y, 0.001)));
  col = clamp(col, vec3f(0.0), vec3f(1.0));
  return vec4f(col, 1.0);
}
`
