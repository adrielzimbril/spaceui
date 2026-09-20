export const VERTEX_SHADER = `attribute vec2 a_position;uniform mat4 u_matrix;uniform float u_depthScale;uniform sampler2D u_depthMap;uniform sampler2D u_depthRevealMap;uniform vec2 u_texelSize;varying vec2 v_texCoord;void main(){v_texCoord=a_position;float d1=0.,d2=0.,ws=0.;for(int x=-3;x<=3;x++){for(int y=-3;y<=3;y++){float w=exp(-(float(x*x+y*y))/8.);vec2 uv=v_texCoord+vec2(float(x),float(y))*u_texelSize*2.5;d1+=texture2D(u_depthMap,uv).r*w;d2+=texture2D(u_depthRevealMap,uv).r*w;ws+=w;}}float d=((d1/ws)+(d2/ws))*.5;float z=(d-.5)*u_depthScale;vec4 pos=vec4(a_position.x-.5,a_position.y-.5,z,1.);gl_Position=u_matrix*pos;}`

export const FRAGMENT_SHADER = `precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_baseMap, u_revealMap, u_maskMap;
uniform sampler2D u_depthMap, u_depthRevealMap;
uniform vec3 u_bgBase, u_bgReveal;
uniform vec3 u_lineBase, u_lineReveal;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_edgeSoft;
uniform float u_gooey;
uniform float u_displace;
uniform float u_chromatic;
uniform float u_topoEnabled;
uniform vec4  u_topoParams;

float sampleMask(vec2 uv){ return texture2D(u_maskMap, uv).r; }

float blurredMask(vec2 uv, float radiusPx){
  vec2 texel = 1.0 / u_resolution;
  float s = 0.0, w = 0.0;
  for (int x = -2; x <= 2; x++) {
    for (int y = -2; y <= 2; y++) {
      float wt = exp(-float(x*x+y*y)/6.0);
      s += texture2D(u_maskMap, uv + vec2(float(x), float(y)) * texel * radiusPx).r * wt;
      w += wt;
    }
  }
  return s / w;
}

void main(){
  if (v_texCoord.x<0.||v_texCoord.x>1.||v_texCoord.y<0.||v_texCoord.y>1.){
    gl_FragColor = vec4(0.0); return;
  }
  vec2 sUV = gl_FragCoord.xy / u_resolution; sUV.y = 1.0 - sUV.y;

  float m = u_edgeSoft > 0.001 ? blurredMask(sUV, u_edgeSoft) : sampleMask(sUV);
  if (u_gooey > 0.5) { m = smoothstep(0.35, 0.55, m); }

  vec2 uv = v_texCoord;
  if (u_displace > 0.001) {
    vec2 e = vec2(1.0/u_resolution.x, 1.0/u_resolution.y) * 2.0;
    float mx1 = texture2D(u_maskMap, sUV + vec2(e.x, 0.0)).r;
    float mx0 = texture2D(u_maskMap, sUV - vec2(e.x, 0.0)).r;
    float my1 = texture2D(u_maskMap, sUV + vec2(0.0, e.y)).r;
    float my0 = texture2D(u_maskMap, sUV - vec2(0.0, e.y)).r;
    vec2 grad = vec2(mx1 - mx0, my1 - my0);
    uv += grad * u_displace * 6.0;
  }

  vec4 bT = texture2D(u_baseMap, uv);
  vec4 rT = texture2D(u_revealMap, uv);

  if (u_chromatic > 0.001) {
    float edge = m * (1.0 - m) * 4.0;
    vec2 dir = normalize(v_texCoord - vec2(0.5)) * u_chromatic * edge;
    bT.r = texture2D(u_baseMap,   uv + dir).r;
    bT.b = texture2D(u_baseMap,   uv - dir).b;
    rT.r = texture2D(u_revealMap, uv + dir).r;
    rT.b = texture2D(u_revealMap, uv - dir).b;
  }

  float bA = step(0.05, bT.a), rA = step(0.05, rT.a);
  vec3 bL = mix(u_bgBase,  bT.rgb, bA);
  vec3 rL = mix(u_bgReveal, rT.rgb, rA);
  vec3 col = mix(bL, rL, m);

  if (u_topoEnabled > 0.5) {
    float d1 = texture2D(u_depthMap,       v_texCoord).r;
    float d2 = texture2D(u_depthRevealMap, v_texCoord).r;
    float d  = mix(d1, d2, m);
    float dist = u_topoParams.z;
    float noise = sin(v_texCoord.x * 40.0 + u_time * 0.5)
                * cos(v_texCoord.y * 40.0 - u_time * 0.4);
    d += noise * dist * 0.15;
    float bands = d * u_topoParams.x * 20.0 + u_time * u_topoParams.w;
    float f = fract(bands);
    float t = u_topoParams.y;
    float line = smoothstep(0.5 - t, 0.5, f) - smoothstep(0.5, 0.5 + t, f);
    vec3 lineCol = mix(u_lineBase, u_lineReveal, m);
    col = mix(col, lineCol, clamp(line, 0.0, 1.0));
  }

  gl_FragColor = vec4(col, 1.0);
}`

export const UNIFORM_NAMES = [
  'u_matrix',
  'u_depthScale',
  'u_texelSize',
  'u_resolution',
  'u_bgBase',
  'u_bgReveal',
  'u_baseMap',
  'u_revealMap',
  'u_depthMap',
  'u_maskMap',
  'u_depthRevealMap',
  'u_time',
  'u_edgeSoft',
  'u_gooey',
  'u_displace',
  'u_chromatic',
  'u_topoEnabled',
  'u_topoParams',
  'u_lineBase',
  'u_lineReveal',
] as const

export type UniformName = (typeof UNIFORM_NAMES)[number]

export function compileProgram(gl: WebGLRenderingContext): {
  program: WebGLProgram
  uniforms: Record<UniformName, WebGLUniformLocation | null>
  attribPos: number
} {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)
    if (!sh) throw new Error('shader alloc')
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(sh))
    }
    return sh
  }
  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!program) throw new Error('program alloc')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader link error:', gl.getProgramInfoLog(program))
  }
  // The program keeps the compiled code once linked — the shader objects
  // themselves are safe (and correct practice) to delete right away.
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  const uniforms = {} as Record<UniformName, WebGLUniformLocation | null>
  for (const n of UNIFORM_NAMES) uniforms[n] = gl.getUniformLocation(program, n)
  const attribPos = gl.getAttribLocation(program, 'a_position')
  return { program, uniforms, attribPos }
}
