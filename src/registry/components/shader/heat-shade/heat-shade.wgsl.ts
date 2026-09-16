export const HEAT_SHADE_WGSL = /* wgsl */ `
struct Params {
  resolution: vec2f,
  time: f32,
  speed: f32,
  baseColor: vec4f,
  hotColor: vec4f,
}

@group(0) @binding(0) var<uniform> params: Params;

fn hash(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(point: vec2f) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let blend = local * local * (3.0 - 2.0 * local);
  let bottom = mix(hash(cell), hash(cell + vec2f(1.0, 0.0)), blend.x);
  let top = mix(
    hash(cell + vec2f(0.0, 1.0)),
    hash(cell + vec2f(1.0, 1.0)),
    blend.x
  );
  return mix(bottom, top, blend.y);
}

fn fbm(point: vec2f) -> f32 {
  var position = point;
  var value = 0.0;
  var amplitude = 0.5;
  for (var octave = 0; octave < 4; octave += 1) {
    value += noise(position) * amplitude;
    position = position * 2.03 + vec2f(7.1, 3.7);
    amplitude *= 0.5;
  }
  return value;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = params.resolution.x / max(params.resolution.y, 1.0);
  let motion = params.time * params.speed;
  let wideNoise = fbm(vec2f(uv.x * aspect * 1.45, -motion * 0.15));
  let warp = fbm(vec2f(uv.x * aspect * 2.4 + wideNoise, uv.y * 1.7 - motion * 0.23));
  let detail = fbm(vec2f(uv.x * aspect * 5.2 + warp * 1.3, -motion * 0.36));
  let slowWave = sin(uv.x * aspect * 4.2 + motion * 0.17) * 0.035;
  let boundary = 0.61 - wideNoise * 0.24 - warp * 0.14
    + detail * 0.08 + slowWave;
  let signedDistance = uv.y - boundary;
  let primaryFlame = smoothstep(-0.045, 0.075, signedDistance);

  let secondaryNoise = fbm(vec2f(
    uv.x * aspect * 1.8 + 4.7,
    -motion * 0.21
  ));
  let secondaryWarp = fbm(vec2f(
    uv.x * aspect * 3.1 + secondaryNoise * 1.2,
    uv.y * 1.9 - motion * 0.31
  ));
  let secondaryBoundary = 0.68 - secondaryNoise * 0.2
    - secondaryWarp * 0.11
    + sin(uv.x * aspect * 5.4 - motion * 0.24) * 0.025;
  let secondaryDistance = uv.y - secondaryBoundary;
  let secondaryFlame = smoothstep(-0.035, 0.065, secondaryDistance);
  let flame = max(primaryFlame, secondaryFlame * 0.88);
  let softEdge = exp(-abs(signedDistance) * 18.0);
  let secondaryEdge = exp(-abs(secondaryDistance) * 21.0);
  let verticalHeat = smoothstep(boundary - 0.02, 1.0, uv.y);
  let grain = noise(uv * params.resolution * 0.18 + motion * 1.1) - 0.5;

  let ember = params.baseColor.xyz;
  var color = mix(vec3f(0.0), ember, flame);
  color = mix(
    color,
    params.baseColor.xyz,
    flame * (0.42 + verticalHeat * 0.4)
  );
  color += params.hotColor.xyz * softEdge * 0.38;
  color += mix(params.baseColor.xyz, params.hotColor.xyz, 0.65)
    * secondaryEdge * 0.22;
  color += params.hotColor.xyz * grain * flame * 0.016;

  let alpha = clamp(flame * 0.82 + softEdge * 0.22, 0.0, 1.0);
  return vec4f(color * alpha, alpha);
}
`
