import { clamp, lerp } from './math'
import type { ThinkingOrbMode } from './types'

export interface BaseConfig {
  latRings?: number
  lonDensity?: number
  rBase?: number
  rDepth?: number
  rBoost?: number
  inkFar?: number
  inkSpan?: number
  rsPow?: number
  rMin?: number
  orbitN?: number
  ghostN?: number
  ghostR?: number
  ghostA?: number
  particles?: number
  partR?: number
  partRDepth?: number
  moveCount?: number
  rActive?: number
  rings?: number
  nodeN?: number
  thr?: number
  signals?: number
  nodeR?: number
  nodeRDepth?: number
  lineW?: number
  strandN?: number
  turns?: number
  lanes?: number
  segs?: number
  faceOn?: number
  rDot?: number
  iconD?: number
  spin?: number
  bandMul?: number
  wobMul?: number
  spread?: number
  scanMul?: number
  dimBase?: number
  [key: string]: any
}

export const DEFAULT_CONFIGS: Record<ThinkingOrbMode, BaseConfig> = {
  globe: {
    latRings: 17,
    lonDensity: 44,
    rBase: 0.6,
    rDepth: 1.7,
    rBoost: 1,
    inkFar: 0.62,
    inkSpan: 0.54,
    rsPow: 0.6,
    rMin: 0.3,
  },
  orbits: {
    orbitN: 12,
    ghostN: 40,
    ghostR: 0.9,
    ghostA: 0.5,
    particles: 3,
    partR: 1.2,
    partRDepth: 1.6,
    rsPow: 0.6,
    rMin: 0.3,
  },
  rubik: {
    latRings: 15,
    lonDensity: 40,
    moveCount: 14,
    rBase: 0.6,
    rDepth: 1.7,
    rActive: 0.3,
    inkFar: 0.62,
    inkSpan: 0.54,
    rsPow: 0.6,
    rMin: 0.3,
  },
  wave: {
    rings: 15,
    lonDensity: 40,
    rBase: 0.6,
    rDepth: 1.7,
    rsPow: 0.6,
    rMin: 0.3,
  },
  web: {
    nodeN: 30,
    thr: 0.72,
    signals: 5,
    nodeR: 1.4,
    nodeRDepth: 1.8,
    lineW: 0.8,
    rsPow: 0.6,
    rMin: 0.3,
  },
  braid: {
    strandN: 52,
    turns: 3,
    ghostN: 150,
    rBase: 1.2,
    rDepth: 1.8,
    rsPow: 0.6,
    rMin: 0.3,
  },
  ribbon: {
    lanes: 5,
    segs: 88,
    ghostN: 150,
    rBase: 1.1,
    rDepth: 1.7,
    rsPow: 0.6,
    rMin: 0.3,
  },
  ring: {
    lanes: 5,
    segs: 88,
    ghostN: 0,
    faceOn: 1,
    rBase: 1.1,
    rDepth: 1.7,
    rsPow: 0.6,
    rMin: 0.3,
  },
  morph: {
    rDot: 0.021,
    iconD: 1,
    rMin: 0.25,
  },
}

interface ScaleProfile {
  speed: number
  count: number
  size: number
  extra?: Record<string, number>
}

export const SCALE_PRESETS: Record<ThinkingOrbMode, { small: ScaleProfile; large: ScaleProfile }> = {
  orbits: {
    small: { speed: 3.9, count: 0.238, size: 2.4 },
    large: { speed: 1.885, count: 1, size: 1 },
  },
  globe: {
    small: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } },
    large: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
  },
  rubik: {
    small: { speed: 1.95, count: 0.088, size: 1.9 },
    large: { speed: 1.82, count: 0.35, size: 1.05 },
  },
  wave: {
    small: { speed: 3.998, count: 0.105, size: 1.6 },
    large: { speed: 4.388, count: 0.341, size: 1 },
  },
  web: {
    small: { speed: 6.63, count: 0.25, size: 1.52 },
    large: { speed: 3.315, count: 1.35, size: 0.95 },
  },
  braid: {
    small: { speed: 2.75, count: 0.1125, size: 1.36 },
    large: { speed: 1.625, count: 0.5, size: 1 },
  },
  ribbon: {
    small: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } },
    large: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
  },
  ring: {
    small: { speed: 3.78, count: 0.028, size: 1.622, extra: { spin: 0, bandMul: 3.968, wobMul: 0.565 } },
    large: { speed: 3.24, count: 0.25, size: 0.956, extra: { spin: 0, bandMul: 3.627, wobMul: 0.368 } },
  },
  morph: {
    small: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } },
    large: { speed: 2.405, count: 0.702, size: 0.395, extra: { spread: 1.45 } },
  },
}

const COUNT_COUPLES = [
  ['latRings', 'lonDensity'],
  ['rings', 'lonDensity'],
  ['lanes', 'segs'],
]
const COUNT_KEYS = ['orbitN', 'ghostN', 'nodeN', 'strandN', 'signals']
const DENSITY_KEYS = ['iconD']
const SIZE_KEYS = ['rBase', 'rDepth', 'rActive', 'rDot', 'ghostR', 'partR', 'partRDepth', 'nodeR', 'nodeRDepth']

function scaleCounts(config: BaseConfig, factor: number): BaseConfig {
  const result = { ...config }
  const visited = new Set<string>()
  const sqrtFactor = Math.sqrt(factor)

  for (const [k1, k2] of COUNT_COUPLES) {
    if (result[k1] != null && result[k2] != null && !visited.has(k1) && !visited.has(k2)) {
      result[k1] = Math.max(2, Math.round(result[k1] * sqrtFactor))
      result[k2] = Math.max(2, Math.round(result[k2] * sqrtFactor))
      visited.add(k1)
      visited.add(k2)
    }
  }

  for (const k of COUNT_KEYS) {
    if (result[k] != null && result[k] !== 0 && !visited.has(k)) {
      result[k] = Math.max(1, Math.round(result[k] * factor))
    }
  }

  for (const k of DENSITY_KEYS) {
    if (result[k] != null) {
      result[k] = Math.max(0.02, result[k] * factor)
    }
  }

  return result
}

function scaleSizes(config: BaseConfig, factor: number): BaseConfig {
  const result = { ...config }
  for (const k of SIZE_KEYS) {
    if (result[k] != null) {
      result[k] = result[k] * factor
    }
  }
  return result
}

export function presetFor(mode: ThinkingOrbMode, pixelSize: number): { speed: number; opts: BaseConfig } {
  const preset = SCALE_PRESETS[mode]
  const t = clamp((pixelSize - 20) / 44)
  const countScale = lerp(preset.small.count, preset.large.count, t)
  const sizeScale = lerp(preset.small.size, preset.large.size, t)

  let opts: BaseConfig = { ...DEFAULT_CONFIGS[mode] }
  if (countScale !== 1) opts = scaleCounts(opts, countScale)
  if (sizeScale !== 1) opts = scaleSizes(opts, sizeScale)

  if (preset.small.extra) {
    const extra: Record<string, number> = {}
    for (const key of Object.keys(preset.small.extra)) {
      extra[key] = lerp(preset.small.extra[key], preset.large.extra![key], t)
    }
    opts = { ...opts, ...extra }
  }

  return {
    speed: lerp(preset.small.speed, preset.large.speed, t),
    opts,
  }
}
