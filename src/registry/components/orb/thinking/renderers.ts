import {
  type RenderDot,
  type RenderLine,
  type RenderPassData,
  filterAndSortElements,
} from './canvas-utils'
import {
  angleDelta,
  create3DRotation,
  fibonacciSphere,
  fract,
  hash,
  lerp,
  responsiveScale,
  smoothstep,
  valueNoise2D,
} from './math'
import type { BaseConfig } from './presets'
import type { ThinkingOrbMode } from './types'

// 1. Orbits (Working)
export function renderOrbits(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.82
  const project = create3DRotation(time * 0.12, 0.3, cx, cy, 1)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const dots: RenderDot[] = []
  const orbitCount = opts.orbitN ?? 12
  const ghostCount = opts.ghostN ?? 40
  const particleCount = opts.particles ?? 3

  for (let i = 0; i < orbitCount; i++) {
    const r1 = hash(i, 1.7)
    const r2 = hash(i, 5.2)
    const r3 = hash(i, 8.9)
    const orbitRadius = radius * (0.45 + 0.52 * r1)
    const phi = r1 * 2 * Math.PI
    const theta = Math.acos(2 * r2 - 1)
    const nx = Math.sin(theta) * Math.cos(phi)
    const ny = Math.cos(theta)
    const nz = Math.sin(theta) * Math.sin(phi)

    let ux = -ny
    let uy = nx
    const uLen = Math.max(1e-6, Math.sqrt(ux * ux + uy * uy))
    ux /= uLen
    uy /= uLen

    const vx = ny * 0 - nz * uy
    const vy = nz * ux - nx * 0
    const vz = nx * uy - ny * ux
    const speed = (0.25 + 0.55 * r3) * (r3 > 0.5 ? 1 : -1)

    for (let g = 0; g < ghostCount; g++) {
      const angle = (g / ghostCount) * 2 * Math.PI
      const [px, py, pz] = project(
        (ux * Math.cos(angle) + vx * Math.sin(angle)) * orbitRadius,
        (uy * Math.cos(angle) + vy * Math.sin(angle)) * orbitRadius,
        (0 * Math.cos(angle) + vz * Math.sin(angle)) * orbitRadius,
      )
      const depth = (pz / orbitRadius + 1) / 2
      dots.push({
        x: px,
        y: py,
        z: pz,
        r: (opts.ghostR ?? 0.9) * scale,
        white: 0.72,
        a: (opts.ghostA ?? 0.5) * (0.4 + 0.6 * depth),
      })
    }

    for (let p = 0; p < particleCount; p++) {
      const angle = time * speed + (p / particleCount) * 2 * Math.PI + r2 * 6
      const [px, py, pz] = project(
        (ux * Math.cos(angle) + vx * Math.sin(angle)) * orbitRadius,
        (uy * Math.cos(angle) + vy * Math.sin(angle)) * orbitRadius,
        (0 * Math.cos(angle) + vz * Math.sin(angle)) * orbitRadius,
      )
      const depth = (pz / orbitRadius + 1) / 2
      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.partR ?? 1.2) + (opts.partRDepth ?? 1.6) * depth) * scale,
        white: 0.3 - 0.22 * depth,
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 2. Globe (Searching)
export function renderGlobe(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.82
  const rotX = 0.4 + 0.06 * Math.sin(time * 0.35)
  const project = create3DRotation(time * 0.5, rotX, cx, cy, radius)
  const scanSweep = time * (0.5 + 1.2 * (opts.scanMul ?? 1))
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const dimBase = opts.dimBase ?? 1
  const dots: RenderDot[] = []
  const latRings = opts.latRings ?? 17
  const lonDensity = opts.lonDensity ?? 44

  for (let ring = 0; ring <= latRings; ring++) {
    const lat = -Math.PI / 2 + (ring / latRings) * Math.PI
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity))

    for (let lon = 0; lon < lonCount; lon++) {
      const lonAngle = (lon / lonCount) * 2 * Math.PI
      const [px, py, pz] = project(cosLat * Math.cos(lonAngle), sinLat, cosLat * Math.sin(lonAngle))
      const depth = (pz + 1) / 2
      const delta = angleDelta(lonAngle + time * 0.5, scanSweep)
      const scanIntensity = Math.exp(-(delta * delta) / 0.18) * Math.max(0, pz)

      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.rBase ?? 0.6) + (opts.rDepth ?? 1.7) * depth + (opts.rBoost ?? 1) * scanIntensity) * scale,
        white: (opts.inkFar ?? 0.62) - (opts.inkSpan ?? 0.54) * depth,
        a: dimBase + (1 - dimBase) * Math.min(1, scanIntensity),
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 3. Rubik (Solving)
interface RubikMove {
  axis: number
  lo: number
  hi: number
  ang: number
}

function generateRubikMoves(count: number): RubikMove[] {
  const moves: RubikMove[] = []
  for (let i = 0; i < count; i++) {
    const axis = Math.min(2, Math.floor(hash(i, 2.3) * 3))
    const slice = -1 + 0.5 * Math.min(3, Math.floor(hash(i, 5.9) * 4))
    const dir = hash(i, 7.7) < 0.5 ? 1 : -1
    moves.push({
      axis,
      lo: slice,
      hi: slice + 0.5,
      ang: (dir * Math.PI) / 2,
    })
  }
  return moves
}

function computeRubikAmounts(time: number, count: number, moveDur: number, pauseDur: number) {
  const totalCycle = 2 * count * moveDur + pauseDur
  const tMod = time % totalCycle
  const amounts = Array(count).fill(0)
  let activeIndex = -1

  if (tMod < 2 * count * moveDur) {
    const step = Math.floor(tMod / moveDur)
    const stepT = (tMod - step * moveDur) / moveDur
    const ease = 1 - Math.pow(1 - Math.min(1, stepT / 0.7), 3)

    if (step < count) {
      for (let i = 0; i < step; i++) amounts[i] = 1
      amounts[step] = ease
      activeIndex = step
    } else {
      const rewind = 2 * count - 1 - step
      for (let i = 0; i < rewind; i++) amounts[i] = 1
      amounts[rewind] = 1 - ease
      activeIndex = rewind
    }
  }

  return { amount: amounts, active: activeIndex }
}

function applyRubikTransform(
  point: [number, number, number],
  moves: RubikMove[],
  anim: { amount: number[]; active: number },
): [number, number, number, boolean] {
  let [x, y, z] = point
  let isActive = false

  for (let i = 0; i < moves.length; i++) {
    if (anim.amount[i] <= 0) continue
    const move = moves[i]
    const coord = move.axis === 0 ? x : move.axis === 1 ? y : z
    if (coord < move.lo || coord >= move.hi) continue

    if (i === anim.active) {
      isActive = true
    }

    const angle = move.ang * anim.amount[i]
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    if (move.axis === 0) {
      const ny = y * cosA - z * sinA
      z = y * sinA + z * cosA
      y = ny
    } else if (move.axis === 1) {
      const nx = x * cosA + z * sinA
      z = -x * sinA + z * cosA
      x = nx
    } else {
      const nx = x * cosA - y * sinA
      y = x * sinA + y * cosA
      x = nx
    }
  }

  return [x, y, z, isActive]
}

export function renderRubik(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.82
  const project = create3DRotation(time * 0.55, 0.35 + 0.1 * Math.sin(time * 0.9), cx, cy, radius)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const moveCount = opts.moveCount ?? 14
  const moves = generateRubikMoves(moveCount)
  const anim = computeRubikAmounts(time, moveCount, 0.42, 1.2)
  const dots: RenderDot[] = []
  const latRings = opts.latRings ?? 15
  const lonDensity = opts.lonDensity ?? 40

  for (let ring = 0; ring <= latRings; ring++) {
    const lat = -Math.PI / 2 + (ring / latRings) * Math.PI
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity))

    for (let lon = 0; lon < lonCount; lon++) {
      const lonAngle = (lon / lonCount) * 2 * Math.PI
      const [rx, ry, rz, isActive] = applyRubikTransform(
        [cosLat * Math.cos(lonAngle), sinLat, cosLat * Math.sin(lonAngle)],
        moves,
        anim,
      )
      const [px, py, pz] = project(rx, ry, rz)
      const depth = (pz + 1) / 2

      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.rBase ?? 0.6) + (opts.rDepth ?? 1.7) * depth + (isActive ? opts.rActive ?? 0.3 : 0)) * scale,
        white: (opts.inkFar ?? 0.62) - (opts.inkSpan ?? 0.54) * depth - (isActive ? 0.14 : 0),
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 4. Wave (Listening)
export function renderWave(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.874
  const project = create3DRotation(time * 0.18, 0.38, cx, cy, 1)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const dots: RenderDot[] = []
  const rings = opts.rings ?? 15
  const lonDensity = opts.lonDensity ?? 40

  for (let ring = 0; ring <= rings; ring++) {
    const lat = -Math.PI / 2 + (ring / rings) * Math.PI
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    const wave = 0.62 * Math.sin(time * 2.1 - ring * 0.52) + 0.38 * Math.sin(time * 1.27 + ring * 0.83)
    const rCurrent = radius * (0.88 + 0.105 * wave)
    const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity))

    for (let lon = 0; lon < lonCount; lon++) {
      const lonAngle = (lon / lonCount) * 2 * Math.PI
      const [px, py, pz] = project(
        cosLat * Math.cos(lonAngle) * rCurrent,
        sinLat * rCurrent,
        cosLat * Math.sin(lonAngle) * rCurrent,
      )
      const depth = (pz / radius + 1) / 2
      const posWave = Math.max(0, wave)

      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.rBase ?? 0.6) + (opts.rDepth ?? 1.7) * depth) * (1 + 0.4 * posWave) * scale,
        white: 0.66 - 0.56 * depth - 0.1 * posWave,
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 5. Web (Connecting)
export function renderWeb(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.8 * (opts.spread ?? 1)
  const project = create3DRotation(time * 0.12, 0.32, cx, cy, radius)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const nodeCount = opts.nodeN ?? 30
  const threshold = opts.thr ?? 0.72
  const nodeR = opts.nodeR ?? 1.4
  const nodeRDepth = opts.nodeRDepth ?? 1.8
  const nodes: [number, number, number][] = []

  for (let i = 0; i < nodeCount; i++) {
    const base = fibonacciSphere(i, nodeCount)
    const nx = base[0] + 0.3 * (valueNoise2D(i * 0.31 + 9, time * 0.24) - 0.5) * 2
    const ny = base[1] + 0.3 * (valueNoise2D(i * 0.53 + 27, time * 0.21) - 0.5) * 2
    const nz = base[2] + 0.3 * (valueNoise2D(i * 0.77 + 55, time * 0.27) - 0.5) * 2
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
    nodes.push([nx / len, ny / len, nz / len])
  }

  const lines: RenderLine[] = []
  const dots: RenderDot[] = []

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = nodes[i][0] - nodes[j][0]
      const dy = nodes[i][1] - nodes[j][1]
      const dz = nodes[i][2] - nodes[j][2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist >= threshold) continue

      const [p1x, p1y, p1z] = project(nodes[i][0], nodes[i][1], nodes[i][2])
      const [p2x, p2y, p2z] = project(nodes[j][0], nodes[j][1], nodes[j][2])
      const avgDepth = ((p1z + p2z) / 2 + 1) / 2

      lines.push({
        x1: p1x,
        y1: p1y,
        x2: p2x,
        y2: p2y,
        white: 0.42,
        a: (1 - dist / threshold) * (0.3 + 0.55 * avgDepth),
        w: Math.max(0.6, (opts.lineW ?? 0.8) * scale),
      })
    }
  }

  for (let i = 0; i < nodeCount; i++) {
    const [px, py, pz] = project(nodes[i][0], nodes[i][1], nodes[i][2])
    const depth = (pz + 1) / 2
    const pulse = 1 + 0.25 * Math.sin(time * 1.4 + i * 2.7)

    dots.push({
      x: px,
      y: py,
      z: pz,
      r: (nodeR + nodeRDepth * depth) * pulse * scale,
      white: 0.55 - 0.45 * depth,
    })
  }

  const signalCount = opts.signals ?? 5
  for (let i = 0; i < signalCount; i++) {
    const cycle = Math.floor(time * 0.55 + i * 7.31)
    const from = Math.floor(hash(cycle, i * 3.1 + 1.7) * nodeCount)
    const to = Math.floor(hash(cycle, i * 5.7 + 4.2) * nodeCount)
    if (from === to) continue

    const tProg = fract(time * 0.55 + i * 7.31)
    const sx = lerp(nodes[from][0], nodes[to][0], tProg)
    const sy = lerp(nodes[from][1], nodes[to][1], tProg)
    const sz = lerp(nodes[from][2], nodes[to][2], tProg)
    const sLen = Math.max(1e-6, Math.sqrt(sx * sx + sy * sy + sz * sz))
    const [px, py, pz] = project(sx / sLen, sy / sLen, sz / sLen)
    const depth = (pz + 1) / 2

    dots.push({
      x: px,
      y: py,
      z: pz,
      r: (nodeR * 1.5 + nodeRDepth * depth) * scale,
      white: 0.05,
      a: 0.5 + 0.5 * depth,
    })
  }

  return filterAndSortElements(dots, lines, opts.rMin)
}

// 6. Braid (Weaving)
export function renderBraid(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.76
  const project = create3DRotation(time * 0.4, 0.3, cx, cy, 1)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const dots: RenderDot[] = []
  const ghostCount = opts.ghostN ?? 150

  for (let i = 0; i < ghostCount; i++) {
    const p = fibonacciSphere(i, ghostCount)
    const [px, py, pz] = project(p[0] * radius, p[1] * radius, p[2] * radius)
    const depth = (pz / radius + 1) / 2
    dots.push({
      x: px,
      y: py,
      z: pz,
      r: 0.8 * scale,
      white: 0.78,
      a: 0.1 + 0.22 * depth,
    })
  }

  const strandCount = opts.strandN ?? 52
  const turns = opts.turns ?? 3

  for (let s = 0; s < 3; s++) {
    const strandPhase = (s / 3) * 2 * Math.PI

    for (let i = 0; i < strandCount; i++) {
      const u = (fract(i / strandCount + time * 0.045) * 2 - 1) * 0.96
      const radAtU = Math.sqrt(Math.max(0, 1 - u * u))
      const fade = Math.min(1, (1 - Math.abs(u)) / 0.1)
      const angle = u * Math.PI * turns + strandPhase
      const rMod = 1 + 0.075 * Math.sin(u * Math.PI * turns * 2 + strandPhase * 2 + time * 0.8)
      const currentRadius = radAtU * radius * rMod
      const [px, py, pz] = project(Math.cos(angle) * currentRadius, u * radius * rMod, Math.sin(angle) * currentRadius)
      const depth = (pz / radius + 1) / 2

      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.rBase ?? 1.2) + (opts.rDepth ?? 1.8) * depth) * scale,
        white: 0.55 - 0.45 * depth,
        a: fade * (0.45 + 0.55 * depth),
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 7. Ribbon & Ring (Composing / Breathing)
export function renderRibbonOrRing(size: number, time: number, opts: BaseConfig): RenderPassData {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.78
  const spin = opts.spin ?? 1
  const project = create3DRotation(time * 0.1 * spin, 0.3, cx, cy, 1)
  const scale = responsiveScale(size, opts.rsPow ?? 0.6)
  const dots: RenderDot[] = []
  const ghostCount = opts.ghostN ?? 150

  for (let i = 0; i < ghostCount; i++) {
    const p = fibonacciSphere(i, ghostCount)
    const [px, py, pz] = project(p[0] * radius, p[1] * radius, p[2] * radius)
    const depth = (pz / radius + 1) / 2
    dots.push({
      x: px,
      y: py,
      z: pz,
      r: 0.8 * scale,
      white: 0.78,
      a: 0.1 + 0.22 * depth,
    })
  }

  const rotAngle = time * 0.24 * spin
  const tiltAngle = opts.faceOn ? -0.3 : 0.55 + 0.3 * Math.sin(time * 0.18) * spin
  const cosR = Math.cos(rotAngle)
  const sinR = Math.sin(rotAngle)
  const tx = -sinR * Math.sin(tiltAngle)
  const ty = Math.cos(tiltAngle)
  const tz = cosR * Math.sin(tiltAngle)
  const nx = 0 * tz - sinR * ty
  const ny = sinR * tx - cosR * tz
  const nz = cosR * ty - 0 * tx
  const wobMul = 0.23 * (opts.wobMul ?? 1)
  const effectiveRadius = opts.faceOn ? radius / (1 + 0.85 * wobMul) : radius
  const lanes = opts.lanes ?? 5
  const segs = opts.segs ?? 88
  const effectiveLanes = Math.max(1, Math.round(lanes * (opts.bandMul ?? 1)))

  for (let lane = 0; lane < effectiveLanes; lane++) {
    const laneOffset = (lane - (effectiveLanes - 1) / 2) * 0.075
    const edgeDistance = Math.abs(lane - (effectiveLanes - 1) / 2) / Math.max(1, (effectiveLanes - 1) / 2)

    for (let seg = 0; seg < segs; seg++) {
      const segAngle = (seg / segs) * 2 * Math.PI
      const ripple =
        (0.16 * Math.sin(segAngle * 3 - time * 1.7 + lane * 0.22) + 0.07 * Math.sin(segAngle * 5 + time * 1.1)) *
        (opts.wobMul ?? 1)
      const radialScale = opts.faceOn ? 1 + ripple : 1
      const normalOffset = opts.faceOn ? laneOffset : laneOffset + ripple

      const vx = cosR * Math.cos(segAngle) + tx * Math.sin(segAngle) + nx * normalOffset
      const vy = 0 * Math.cos(segAngle) + ty * Math.sin(segAngle) + ny * normalOffset
      const vz = sinR * Math.cos(segAngle) + tz * Math.sin(segAngle) + nz * normalOffset
      const vLen = Math.sqrt(vx * vx + vy * vy + vz * vz)
      const radScale = effectiveRadius * radialScale
      const [px, py, pz] = project((vx / vLen) * radScale, (vy / vLen) * radScale, (vz / vLen) * radScale)
      const depth = (pz / radius + 1) / 2

      dots.push({
        x: px,
        y: py,
        z: pz,
        r: ((opts.rBase ?? 1.1) + (opts.rDepth ?? 1.7) * depth) * (1 - 0.25 * edgeDistance) * scale,
        white: 0.52 - 0.44 * depth + 0.18 * edgeDistance,
        a: 0.4 + 0.6 * depth,
      })
    }
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

// 8. Morph (Shaping)
const MORPH_POLYGONS: [number, number][][] = [
  [],
  [
    [0, -0.26],
    [0.24, 0.16],
    [-0.24, 0.16],
  ],
  [
    [0, -0.2],
    [0.2, -0.2],
    [0.2, 0.2],
    [-0.2, 0.2],
    [-0.2, -0.2],
  ],
]
const MORPH_SAMPLES = 160
const MORPH_HOLD_TIME = 1.4
const MORPH_TRANS_TIME = 0.9

function resamplePolygon(poly: [number, number][], samples: number): [number, number][] {
  const n = poly.length
  const segmentLengths: number[] = []
  let totalLen = 0
  for (let i = 0; i < n; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % n]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    segmentLengths.push(len)
    totalLen += len
  }

  const out: [number, number][] = []
  for (let i = 0; i < samples; i++) {
    let targetDist = (i / samples) * totalLen
    let segIndex = 0
    while (targetDist > segmentLengths[segIndex] && segIndex < n - 1) {
      targetDist -= segmentLengths[segIndex]
      segIndex++
    }
    const a = poly[segIndex]
    const b = poly[(segIndex + 1) % n]
    const segT = segmentLengths[segIndex] ? Math.min(1, targetDist / segmentLengths[segIndex]) : 0
    out.push([a[0] + (b[0] - a[0]) * segT, a[1] + (b[1] - a[1]) * segT])
  }
  return out
}

function getShapeOutline(shapeIndex: number, samples: number): [number, number][] {
  const poly = MORPH_POLYGONS[shapeIndex]
  if (!poly || poly.length === 0) {
    const out: [number, number][] = []
    for (let i = 0; i < samples; i++) {
      const angle = -Math.PI / 2 + (i / samples) * 2 * Math.PI
      out.push([Math.cos(angle) * 0.24, Math.sin(angle) * 0.24])
    }
    return out
  }
  return resamplePolygon(poly, samples)
}

export function renderMorph(size: number, time: number, opts: BaseConfig): RenderPassData {
  const shapeCount = 3
  const shapeCycle = 2.3
  const cycleTime = time % (shapeCycle * shapeCount)
  const currentShape = Math.floor(cycleTime / shapeCycle)
  const shapeTime = cycleTime - currentShape * shapeCycle
  const morphProgress = shapeTime > MORPH_HOLD_TIME ? smoothstep((shapeTime - MORPH_HOLD_TIME) / MORPH_TRANS_TIME) : 0
  const spread = opts.spread ?? 1

  const s1 = getShapeOutline(currentShape, MORPH_SAMPLES)
  const s2 = getShapeOutline((currentShape + 1) % shapeCount, MORPH_SAMPLES)
  const blended: [number, number][] = []

  for (let i = 0; i < MORPH_SAMPLES; i++) {
    blended.push([
      (s1[i][0] + (s2[i][0] - s1[i][0]) * morphProgress) * spread,
      (s1[i][1] + (s2[i][1] - s1[i][1]) * morphProgress) * spread,
    ])
  }

  const segmentLengths: number[] = []
  let totalLen = 0
  for (let i = 0; i < MORPH_SAMPLES; i++) {
    const a = blended[i]
    const b = blended[(i + 1) % MORPH_SAMPLES]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    segmentLengths.push(len)
    totalLen += len
  }

  const dotCount = Math.max(6, Math.round(34 * (opts.iconD ?? 1)))
  const dotRadius = (opts.rDot ?? 0.021) * 1.35 * spread
  const pulse = 1 + 0.02 * Math.sin(shapeTime * 3.1)
  const center = size / 2
  const dots: RenderDot[] = []

  let segIndex = 0
  let accumulatedDist = 0

  for (let i = 0; i < dotCount; i++) {
    const targetDist = (i / dotCount) * totalLen
    while (accumulatedDist + segmentLengths[segIndex] < targetDist && segIndex < MORPH_SAMPLES - 1) {
      accumulatedDist += segmentLengths[segIndex]
      segIndex++
    }
    const a = blended[segIndex]
    const b = blended[(segIndex + 1) % MORPH_SAMPLES]
    const segT = segmentLengths[segIndex] ? Math.min(1, (targetDist - accumulatedDist) / segmentLengths[segIndex]) : 0
    const px = (a[0] + (b[0] - a[0]) * segT) * pulse
    const py = (a[1] + (b[1] - a[1]) * segT) * pulse

    dots.push({
      x: center + px * size,
      y: center + py * size,
      z: 0,
      r: Math.max(0.35, dotRadius * size),
      white: 0.1,
    })
  }

  return filterAndSortElements(dots, [], opts.rMin)
}

export const RENDERERS: Record<ThinkingOrbMode, (size: number, time: number, opts: BaseConfig) => RenderPassData> = {
  orbits: renderOrbits,
  globe: renderGlobe,
  rubik: renderRubik,
  wave: renderWave,
  web: renderWeb,
  braid: renderBraid,
  ribbon: renderRibbonOrRing,
  ring: renderRibbonOrRing,
  morph: renderMorph,
}
