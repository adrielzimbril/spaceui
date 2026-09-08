import { generatePalette } from '@usespaceui/gradients'

function paletteSeed(input: string) {
  let hash = 2166136261 >>> 0
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d) >>> 0
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b) >>> 0
  hash ^= hash >>> 16
  return hash >>> 0
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function squishPalette(seed: string) {
  const colors = [...generatePalette(seed, { mode: 'presets' }).colors].slice(0, 5)
  const index = Math.min(colors.length - 1, Math.floor(seededRandom(paletteSeed(seed))() * colors.length))
  return {
    body: colors[index] ?? '#6b5cff',
    palette: colors,
  }
}
