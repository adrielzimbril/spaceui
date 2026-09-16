export const HEAT_LICKS_WGSL = /* wgsl */ `
struct Params {
  resolution: vec2f,
  time: f32,
  speed: f32,
  baseColor: vec4f,
  hotColor: vec4f,
  fromTop: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn hash(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn noise(point: vec2f) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let blend = local * local * (3.0 - 2.0 * local);
  return mix(
    mix(hash(cell), hash(cell + vec2f(1.0, 0.0)), blend.x),
    mix(hash(cell + vec2f(0.0, 1.0)), hash(cell + vec2f(1.0, 1.0)), blend.x),
    blend.y
  );
}

fn fbm(point: vec2f) -> f32 {
  var position = point;
  var value = 0.0;
  var amplitude = 0.6;
  for (var octave = 0; octave < 3; octave += 1) {
    value += amplitude * noise(position);
    position *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let y = mix(1.0 - uv.y, uv.y, params.fromTop);
  let motion = params.time * params.speed * 0.18;
  let x = uv.x + 0.05 * sin(y * 3.2 + motion * 0.6);
  let a = fbm(vec2f(x * 2.6, y * 1.6 - motion));
  let b = fbm(vec2f(x * 5.3 + 4.2, y * 2.9 - motion * 1.5));
  let field = a * 0.72 + b * 0.34;
  let energy = clamp(field * 2.4 - y * 2.3, 0.0, 1.0);
  let alpha = 0.3 * smoothstep(0.06, 0.5, energy) + 0.7 * smoothstep(0.5, 0.96, energy);
  let color = mix(params.baseColor.xyz, params.hotColor.xyz, energy);
  return vec4f(color * alpha, alpha);
}
`
