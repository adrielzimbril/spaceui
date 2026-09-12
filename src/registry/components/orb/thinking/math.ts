/**
 * Mathematical utilities and noise functions for procedural 3D particle rendering
 */

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function fract(x: number): number {
  return x - Math.floor(x)
}

export function clamp(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

export function smoothstep(x: number): number {
  return x * x * (3 - 2 * x)
}

export function hash(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function valueNoise2D(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  let xf = x - xi
  let yf = y - yi
  xf = xf * xf * (3 - 2 * xf)
  yf = yf * yf * (3 - 2 * yf)
  const bl = hash(xi, yi)
  const br = hash(xi + 1, yi)
  const tl = hash(xi, yi + 1)
  const tr = hash(xi + 1, yi + 1)
  return bl + (br - bl) * xf + (tl - bl) * yf + (bl - br - tl + tr) * xf * yf
}

/**
 * Distribute points evenly on a 3D sphere using the golden spiral (Fibonacci sphere)
 */
export function fibonacciSphere(i: number, n: number): [number, number, number] {
  const phi = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - 2 * ((i + 0.5) / n)
  const radius = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = i * phi
  return [radius * Math.cos(theta), y, radius * Math.sin(theta)]
}

export function angleDelta(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b))
}

/**
 * Perspective-correct 3D rotation transform projector
 */
export function create3DRotation(rotY: number, rotX: number, cx: number, cy: number, scale: number) {
  const sinX = Math.sin(rotX)
  const cosX = Math.cos(rotX)
  const sinY = Math.sin(rotY)
  const cosY = Math.cos(rotY)

  return (x: number, y: number, z: number): [number, number, number] => {
    const xRotY = x * cosY + z * sinY
    const zRotY = -x * sinY + z * cosY
    const yRotX = y * cosX - zRotY * sinX
    const zRotX = y * sinX + zRotY * cosX
    return [cx + xRotY * scale, cy - yRotX * scale, zRotX]
  }
}

export function responsiveScale(px: number, power: number): number {
  return Math.pow(px / 300, power)
}
