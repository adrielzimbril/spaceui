// @ts-nocheck
import * as THREE from 'three'

export function generateDistanceMap(
  srcCanvas: HTMLCanvasElement,
  size = 256,
  maxBevel = 22,
): THREE.DataTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    const fallback = new Uint8Array(size * size * 4).fill(255)
    const tex = new THREE.DataTexture(fallback, size, size, THREE.RGBAFormat)
    tex.needsUpdate = true
    return tex
  }

  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(srcCanvas, 0, 0, size, size)
  const imgData = ctx.getImageData(0, 0, size, size)
  const data = imgData.data

  const INF = 1e6
  const dist = new Float32Array(size * size)

  let hasAlpha = false
  for (let i = 0; i < size * size; i++) {
    const alpha = data[i * 4 + 3]
    if (alpha < 128) {
      hasAlpha = true
      dist[i] = 0
    } else {
      dist[i] = INF
    }
  }

  if (!hasAlpha) {
    const full = new Uint8Array(size * size * 4).fill(255)
    const tex = new THREE.DataTexture(full, size, size, THREE.RGBAFormat)
    tex.needsUpdate = true
    return tex
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x
      let d = dist[idx]
      if (x > 0) d = Math.min(d, dist[idx - 1] + 1)
      if (y > 0) d = Math.min(d, dist[idx - size] + 1)
      if (x > 0 && y > 0) d = Math.min(d, dist[idx - size - 1] + 1.414)
      if (x < size - 1 && y > 0) d = Math.min(d, dist[idx - size + 1] + 1.414)
      dist[idx] = d
    }
  }

  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      const idx = y * size + x
      let d = dist[idx]
      if (x < size - 1) d = Math.min(d, dist[idx + 1] + 1)
      if (y < size - 1) d = Math.min(d, dist[idx + size] + 1)
      if (x < size - 1 && y < size - 1) d = Math.min(d, dist[idx + size + 1] + 1.414)
      if (x > 0 && y < size - 1) d = Math.min(d, dist[idx + size - 1] + 1.414)
      dist[idx] = d
    }
  }

  const out = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const d = dist[i]
    if (d === 0) {
      out[i * 4] = 0
      out[i * 4 + 1] = 0
      out[i * 4 + 2] = 0
      out[i * 4 + 3] = 0
    } else {
      const normalized = Math.min(d / maxBevel, 1.0)
      const byteVal = Math.floor(normalized * 255)
      out[i * 4] = byteVal
      out[i * 4 + 1] = byteVal
      out[i * 4 + 2] = byteVal
      out[i * 4 + 3] = 255
    }
  }

  const tex = new THREE.DataTexture(out, size, size, THREE.RGBAFormat)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}
