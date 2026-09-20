export const mat4 = {
  projection(fov: number, aspect: number, near: number, far: number): Float32Array {
    const t = Math.tan(Math.PI * 0.5 - 0.5 * fov)
    const ri = 1 / (near - far)
    return new Float32Array([
      t / aspect, 0, 0, 0,
      0, t, 0, 0,
      0, 0, (near + far) * ri, -1,
      0, 0, near * far * ri * 2, 0,
    ])
  },
  translation(tx: number, ty: number, tz: number): Float32Array {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1])
  },
  xRotation(a: number): Float32Array {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
  },
  yRotation(a: number): Float32Array {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
  },
  multiply(a: Float32Array, b: Float32Array): Float32Array {
    const o = new Float32Array(16)
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        o[i * 4 + j] =
          b[i * 4] * a[j] + b[i * 4 + 1] * a[4 + j] + b[i * 4 + 2] * a[8 + j] + b[i * 4 + 3] * a[12 + j]
    return o
  },
  scale(m: Float32Array, sx: number, sy: number, sz: number): Float32Array {
    return mat4.multiply(m, new Float32Array([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]))
  },
}
