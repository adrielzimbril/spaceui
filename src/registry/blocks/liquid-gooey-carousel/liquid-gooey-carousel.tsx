'use client'

import * as React from 'react'
import NextImage from 'next/image'
import { cn } from '@/registry/lib/utils'
import { FULLSCREEN_VERTEX_SHADER, LIQUID_GOOEY_FRAGMENT_SHADER, MAX_CARDS, MAX_STRANDS } from './shaders'
import type { GooeyCardTransform, LiquidGooeyCarouselProps } from './types'

// Physical simulation constants (scaled relative to primary card edge)
const REST_FUSION_FACTOR = 0.095
const CORNER_CURVATURE = 0.015
const TEXTURE_CROSSFADE_SPAN = 0.035
const SLOT_SPACING_FACTOR = 1.55

// Pointer interaction dynamics
const POINTER_FUSION_BOOST = 0.085
const POINTER_INFLUENCE_RADIUS = 1.7
const CARD_LEAN_INTENSITY = 0.065
const SWELL_INTENSITY = 0.09
const ATTRACTION_RATE = 0.14
const RESTORATION_RATE = 0.06
const NEIGHBOR_DEFLECTION = 0.042
const NEIGHBOR_SCALE_DROP = 0.035
const NEIGHBOR_DIM_FACTOR = 0.15
const NEIGHBOR_FIELD_REACH = 2.4
const WAKE_AMPLITUDE = 0.01
const WAKE_FREQUENCY = 20
const WAKE_SPEED = 7

// Strand bridge dynamics
const STRAND_BASE_RADIUS = 0.2
const STRAND_RUPTURE_GAP = 1.15
const STRAND_MID_WAIST = 0.35
const STRAND_GRAVITY_SAG = 0.015
const STRAND_WELD_RADIUS = 0.035

// Boundary optical refraction
const REFRACTION_BAND_HEIGHT = 0.08
const REFRACTION_DISPLACEMENT = 0.15
const SQUEEZE_COEFFICIENT = 0.05
const BOUNDARY_RIPPLE = 0.0125
const BOUNDARY_RIPPLE_FREQ = 8
const CHROMATIC_FRINGE = 0.004
const BOUNDARY_SHEEN = 0.05

const SURFACE_TENSION_WOBBLE = 0.0075

// Kinetic deceleration & snapping
const WHEEL_SENSITIVITY = 0.0022
const DRAG_SENSITIVITY = 0.007
const TRACKING_EASING = 0.08
const SNAP_DELAY_MS = 260
const SNAP_EASING = 0.06
const CLICK_THRESHOLD_PX = 6
const NAV_ANIMATION_MS = 700

// Intro deployment duration
const INTRO_SPREAD_DURATION_MS = 2600
const COLOR_PROBE_INTERVAL = 20

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)

/** Compiles and links WebGL2 shaders into an active program. */
function compileGooeyProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const program = gl.createProgram()
  if (!program) return null

  for (const [stage, src] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const shader = gl.createShader(stage)
    if (!shader) return null
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return null
    }
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }

  gl.bindAttribLocation(program, 0, 'aPos')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }
  return program
}

/** Efficient uniform location lookup caching. */
function createUniformLocationGetter(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const cache = new Map<string, WebGLUniformLocation | null>()
  return (uniformName: string) => {
    let loc = cache.get(uniformName)
    if (loc === undefined) {
      loc = gl.getUniformLocation(program, uniformName)
      cache.set(uniformName, loc)
    }
    return loc
  }
}

/** Reads computed CSS theme colors safely from canvas 2D context. */
function createColorProbe() {
  const probe = document.createElement('canvas')
  probe.width = probe.height = 1
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  return (cssColor: string): [number, number, number] => {
    if (!ctx) return [0, 0, 0]
    ctx.fillStyle = '#000'
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
  }
}

const ATMOSPHERIC_PALETTES: [string, string, string, string][] = [
  ['#F0E6EB', '#B05A49', '#E9C88F', '#30334A'],
  ['#8FAAD7', '#B0CDF2', '#D4ECFC', '#7089B6'],
  ['#D0AE93', '#FAEDCE', '#D5CDCA', '#8C7874'],
  ['#EDF5F8', '#C8D5DA', '#2A2728', '#B6AAB0'],
  ['#EDEDEE', '#332D2D', '#CDB7AC', '#534B4B'],
  ['#FAF7EE', '#EBCA94', '#D5D0CF', '#CFAA78'],
  ['#524F4A', '#75706A', '#979287', '#B6B3A8'],
  ['#4D4C48', '#757167', '#959288', '#B7B3A7'],
  ['#4D4B46', '#D8D3C8', '#777066', '#B9B2A7'],
  ['#8999A7', '#F3EACF', '#4F4C34', '#D0C9B2'],
  ['#F3FBFE', '#B7C6D3', '#59564D', '#ECD8B5'],
  ['#D3E5F0', '#AFC8DC', '#7193B0', '#B4CFE6'],
]

function drawAtmosphericPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  index: number
) {
  const palette = ATMOSPHERIC_PALETTES[index % ATMOSPHERIC_PALETTES.length]
  const grad = ctx.createLinearGradient(x, y, x + w, y + h)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.33, palette[1])
  grad.addColorStop(0.66, palette[2])
  grad.addColorStop(1, palette[3])
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)

  const cx = x + w * 0.5
  const cy = y + h * 0.5
  const r = Math.hypot(w, h) * 0.55
  const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
  radial.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)')
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
  ctx.fillStyle = radial
  ctx.fillRect(x, y, w, h)
}

/**
 * Builds a single 2D canvas texture sheet containing all artwork tiles cover-fitted.
 * Avoids temporal dead zone by computing cell coordinates at the top of the loop.
 */
function buildTextureAtlas(images: HTMLImageElement[], cols: number, cell: number, ratio: number) {
  const rows = Math.ceil(images.length / cols)
  const sheet = document.createElement('canvas')
  sheet.width = cols * cell
  sheet.height = rows * Math.round(cell / ratio)
  const ctx = sheet.getContext('2d')
  if (!ctx) return sheet

  const cellH = Math.round(cell / ratio)
  images.forEach((image, i) => {
    const x = (i % cols) * cell
    const y = Math.floor(i / cols) * cellH

    if (!image.naturalWidth || !image.naturalHeight) {
      drawAtmosphericPlaceholder(ctx, x, y, cell, cellH, i)
      return
    }

    const scale = Math.max(cell / image.naturalWidth, cellH / image.naturalHeight)
    const targetW = image.naturalWidth * scale
    const targetH = image.naturalHeight * scale

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cell, cellH)
    ctx.clip()
    ctx.drawImage(image, x + (cell - targetW) / 2, y + (cellH - targetH) / 2, targetW, targetH)
    ctx.restore()
  })

  return sheet
}

export function LiquidGooeyCarousel({
  items,
  brand,
  arc = 1.0,
  cardSize = 0.38,
  cardRatio = 1.15,
  fuse = REST_FUSION_FACTOR,
  threads = true,
  glass = true,
  className,
  ...props
}: LiquidGooeyCarouselProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [activeSlot, setActiveSlot] = React.useState(0)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(true)

  const runtimeSettings = React.useRef({ arc, cardSize, cardRatio, fuse, threads, glass })
  runtimeSettings.current = { arc, cardSize, cardRatio, fuse, threads, glass }

  const stepNavigation = React.useRef<(stepOffset: number) => void>(() => {})

  const totalCount = Math.min(items.length, MAX_CARDS)
  const sourceFingerprint = items.map((it) => it.image).join(' ')

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(mediaQuery.matches)
    updateMotion()
    mediaQuery.addEventListener('change', updateMotion)
    return () => mediaQuery.removeEventListener('change', updateMotion)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !totalCount) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    })

    if (!gl) {
      setIsSupported(false)
      return
    }

    const colorReader = createColorProbe()
    const program = compileGooeyProgram(gl, FULLSCREEN_VERTEX_SHADER, LIQUID_GOOEY_FRAGMENT_SHADER)
    if (!program) return
    const getUniform = createUniformLocationGetter(gl, program)

    // Fullscreen quad buffer setup
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    // Artwork texture atlas synthesis
    const COLS = Math.min(4, totalCount)
    const CELL_RESOLUTION = 1024 // High resolution for crisp cards
    let textureAtlas: WebGLTexture | null = null
    let loadedImages = 0

    const images = items.slice(0, totalCount).map((item) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'

      const onImageSettle = () => {
        if (++loadedImages < totalCount) return
        textureAtlas = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, textureAtlas)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          buildTextureAtlas(images, COLS, CELL_RESOLUTION, runtimeSettings.current.cardRatio),
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      }

      img.onload = onImageSettle
      img.onerror = () => {
        console.warn('liquid-gooey-carousel: failed to load image', item.image)
        onImageSettle()
      }
      img.src = item.image
      return img
    })

    // Physical state variables
    let stageW = 0
    let stageH = 0
    let currentAngle = 0
    let targetAngle = 0
    let lastInteractionTime = 0
    let isSettled = true
    let hoverIndex = -1
    let cursorX = -1
    let cursorY = -1
    let cursorVelocity = 0
    let deploymentT = 0
    let elapsedTime = 0
    let lastTimestamp = 0
    let tickCount = 0
    let animFrame = 0
    let targetTransition: { from: number; to: number; startMs: number } | null = null
    let foregroundInk: [number, number, number] = [0, 0, 0]

    const cardLeanX = new Float32Array(totalCount)
    const cardLeanY = new Float32Array(totalCount)
    const cardSwell = new Float32Array(totalCount)
    const cardDimming = new Float32Array(totalCount)

    const cardPositions = new Float32Array(MAX_CARDS * 2)
    const cardRotations = new Float32Array(MAX_CARDS)
    const cardScales = new Float32Array(MAX_CARDS * 4)
    const strandStartPoints = new Float32Array(MAX_STRANDS * 2)
    const strandEndPoints = new Float32Array(MAX_STRANDS * 2)
    const strandParameters = new Float32Array(MAX_STRANDS * 4)

    const cardTransforms: GooeyCardTransform[] = Array.from({ length: totalCount }, () => ({
      x: 0,
      y: 0,
      angle: 0,
      scale: 1,
    }))

    const CENTER_SLOT = Math.floor(totalCount / 2)

    const handleResize = () => {
      const rectW = canvas.clientWidth
      const rectH = canvas.clientHeight
      if (!rectW || !rectH) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      stageW = rectW
      stageH = rectH
      canvas.width = Math.round(rectW * dpr)
      canvas.height = Math.round(rectH * dpr)
    }
    handleResize()
    const resizeWatcher = new ResizeObserver(handleResize)
    resizeWatcher.observe(canvas)

    // Pointer & Gesture Event Listeners
    const onCanvasWheel = (evt: WheelEvent) => {
      evt.preventDefault()
      targetTransition = null
      targetAngle += evt.deltaY * WHEEL_SENSITIVITY
      lastInteractionTime = performance.now()
      isSettled = false
    }
    canvas.addEventListener('wheel', onCanvasWheel, { passive: false })

    stepNavigation.current = (stepDelta: number) => {
      targetTransition = {
        from: targetAngle,
        to: Math.round(targetAngle) + stepDelta,
        startMs: performance.now(),
      }
      lastInteractionTime = performance.now()
      isSettled = true
    }

    let dragOriginY: number | null = null
    let accumulatedDrag = 0

    const onPointerDown = (evt: PointerEvent) => {
      dragOriginY = evt.clientY
      accumulatedDrag = 0
      targetTransition = null
      canvas.setPointerCapture(evt.pointerId)
    }

    const onPointerMove = (evt: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const localX = evt.clientX - rect.left
      const localY = evt.clientY - rect.top
      cursorVelocity = Math.hypot(localX - cursorX, localY - cursorY)
      cursorX = localX
      cursorY = localY

      if (dragOriginY !== null) {
        const delta = dragOriginY - evt.clientY
        accumulatedDrag += Math.abs(delta)
        dragOriginY = evt.clientY
        targetAngle += delta * DRAG_SENSITIVITY
        lastInteractionTime = performance.now()
        isSettled = false
      }
    }

    const onPointerUp = () => {
      const wasTap = dragOriginY !== null && accumulatedDrag < CLICK_THRESHOLD_PX
      dragOriginY = null
      if (!wasTap || hoverIndex < 0) return

      const targetSlotDiff = (((hoverIndex - CENTER_SLOT) % totalCount) + totalCount) % totalCount
      targetTransition = {
        from: targetAngle,
        to: targetSlotDiff + Math.round((targetAngle - targetSlotDiff) / totalCount) * totalCount,
        startMs: performance.now(),
      }
      isSettled = true
    }

    const onPointerLeave = () => {
      cursorX = -1
      cursorY = -1
      hoverIndex = -1
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)

    // Main WebGL2 render animation loop
    const renderFrame = (timestamp: number) => {
      animFrame = requestAnimationFrame(renderFrame)
      if (!stageW || !stageH) return

      const deltaSec = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 1 / 20) : 0
      lastTimestamp = timestamp
      elapsedTime += deltaSec
      const cfg = runtimeSettings.current

      if (tickCount++ % COLOR_PROBE_INTERVAL === 0) {
        foregroundInk = colorReader(getComputedStyle(canvas).color)
      }

      if (textureAtlas) {
        deploymentT = reducedMotion ? 1 : Math.min(1, deploymentT + (deltaSec * 1000) / INTRO_SPREAD_DURATION_MS)
      }
      const spreadFactor = easeInOutCubic(deploymentT)

      // Kinetic tracking and auto-snap interpolation
      if (targetTransition) {
        const t = clamp((timestamp - targetTransition.startMs) / NAV_ANIMATION_MS, 0, 1)
        targetAngle = targetTransition.from + (targetTransition.to - targetTransition.from) * easeOutCubic(t)
        if (t >= 1) targetTransition = null
      } else if (!isSettled && timestamp - lastInteractionTime > SNAP_DELAY_MS) {
        targetAngle = Math.round(targetAngle)
        isSettled = true
      }

      currentAngle += (targetAngle - currentAngle) * (reducedMotion ? 1 : isSettled ? SNAP_EASING : TRACKING_EASING)
      const angularVelocity = Math.abs(targetAngle - currentAngle)

      const activeIdx = (((Math.round(targetAngle) + CENTER_SLOT) % totalCount) + totalCount) % totalCount
      setActiveSlot((prev) => (prev === activeIdx ? prev : activeIdx))

      // Radial cylinder geometry calculations
      const cardPrimaryLength = stageW * cfg.cardSize
      const cardSecondaryLength = cardPrimaryLength / cfg.cardRatio
      const cylinderRadius = stageW * cfg.arc
      const slotStepRadian = (cardSecondaryLength * SLOT_SPACING_FACTOR) / cylinderRadius
      const cylinderOriginX = -cylinderRadius

      for (let i = 0; i < totalCount; i++) {
        const slotOffset = ((((i - currentAngle) % totalCount) + totalCount) % totalCount) - CENTER_SLOT
        const angle = slotOffset * slotStepRadian * spreadFactor
        cardTransforms[i].angle = angle
        cardTransforms[i].x = cylinderOriginX + Math.cos(angle) * cylinderRadius
        cardTransforms[i].y = Math.sin(angle) * cylinderRadius
      }

      // Pointer influence & card hover testing
      const shaderPointerX = cursorX >= 0 ? cursorX - stageW / 2 : 0
      const shaderPointerY = cursorY >= 0 ? stageH / 2 - cursorY : 0
      const pointerEngaged = cursorX >= 0 ? 1 : 0

      if (pointerEngaged && cursorVelocity < 24) {
        hoverIndex = -1
        let closestDist = Infinity
        for (let i = 0; i < totalCount; i++) {
          const dx = Math.abs(shaderPointerX - cardTransforms[i].x)
          const dy = Math.abs(shaderPointerY - cardTransforms[i].y)
          if (dx > cardPrimaryLength / 2 || dy > cardSecondaryLength / 2) continue
          const dist = dx + dy
          if (dist < closestDist) {
            closestDist = dist
            hoverIndex = i
          }
        }
      }
      cursorVelocity *= 0.85

      let activeStrandCount = 0
      for (let i = 0; i < totalCount; i++) {
        const deltaX = shaderPointerX - cardTransforms[i].x
        const deltaY = shaderPointerY - cardTransforms[i].y
        const attractionWeight = pointerEngaged
          ? Math.max(0, 1 - Math.hypot(deltaX, deltaY) / (cardPrimaryLength * POINTER_INFLUENCE_RADIUS))
          : 0
        const isHovered = i === hoverIndex ? 1 : 0

        const pullX = deltaX * (attractionWeight * attractionWeight) * CARD_LEAN_INTENSITY * cardPrimaryLength * 0.02
        const pullY = deltaY * (attractionWeight * attractionWeight) * CARD_LEAN_INTENSITY * cardPrimaryLength * 0.02

        cardLeanX[i] += (pullX - cardLeanX[i]) * (attractionWeight > 0 ? ATTRACTION_RATE : RESTORATION_RATE)
        cardLeanY[i] += (pullY - cardLeanY[i]) * (attractionWeight > 0 ? ATTRACTION_RATE : RESTORATION_RATE)

        let neighbourOffset = 0
        let targetDimming = 0
        if (hoverIndex >= 0 && i !== hoverIndex) {
          let ringDelta = Math.abs(i - hoverIndex)
          ringDelta = Math.min(ringDelta, totalCount - ringDelta)
          const falloff = Math.max(0, 1 - ringDelta / NEIGHBOR_FIELD_REACH)
          neighbourOffset =
            Math.sign(cardTransforms[i].y - cardTransforms[hoverIndex].y || 1) *
            falloff *
            NEIGHBOR_DEFLECTION *
            cardPrimaryLength
          targetDimming = falloff * NEIGHBOR_DIM_FACTOR
        }
        cardDimming[i] +=
          (targetDimming - cardDimming[i]) * (targetDimming > cardDimming[i] ? ATTRACTION_RATE : RESTORATION_RATE)

        const targetSwell =
          attractionWeight * attractionWeight * SWELL_INTENSITY +
          isHovered * NEIGHBOR_SCALE_DROP -
          targetDimming * (NEIGHBOR_SCALE_DROP / NEIGHBOR_DIM_FACTOR)
        cardSwell[i] += (targetSwell - cardSwell[i]) * (targetSwell > cardSwell[i] ? ATTRACTION_RATE : RESTORATION_RATE)

        cardTransforms[i].x += cardLeanX[i]
        cardTransforms[i].y += cardLeanY[i] + neighbourOffset
        cardTransforms[i].scale = (0.18 + 0.82 * spreadFactor) * (1 + cardSwell[i])

        cardPositions[i * 2] = cardTransforms[i].x
        cardPositions[i * 2 + 1] = cardTransforms[i].y
        cardRotations[i] = cardTransforms[i].angle
        cardScales[i * 4] = cardTransforms[i].scale
        cardScales[i * 4 + 1] = cardTransforms[i].scale
        cardScales[i * 4 + 2] = 1 - cardDimming[i]
        cardScales[i * 4 + 3] = i
      }

      // Synthesize organic metaball strand bridges
      if (cfg.threads) {
        for (let i = 0; i < totalCount && activeStrandCount < MAX_STRANDS; i++) {
          const nextIdx = (i + 1) % totalCount
          const gapDist = Math.hypot(
            cardTransforms[nextIdx].x - cardTransforms[i].x,
            cardTransforms[nextIdx].y - cardTransforms[i].y,
          )
          const openingRatio = (gapDist - cardSecondaryLength) / (cardSecondaryLength * STRAND_RUPTURE_GAP)
          if (openingRatio > 1 || openingRatio < -1) continue

          const strandWeight = Math.max(1 - spreadFactor, hoverIndex === i || hoverIndex === nextIdx ? 1 : 0)
          if (strandWeight < 0.02) continue

          const endRadius =
            cardSecondaryLength * 0.5 * STRAND_BASE_RADIUS * strandWeight * (1 - clamp(openingRatio, 0, 1))
          if (endRadius <= 0.5) continue

          strandStartPoints[activeStrandCount * 2] = cardTransforms[i].x
          strandStartPoints[activeStrandCount * 2 + 1] = cardTransforms[i].y
          strandEndPoints[activeStrandCount * 2] = cardTransforms[nextIdx].x
          strandEndPoints[activeStrandCount * 2 + 1] = cardTransforms[nextIdx].y
          strandParameters[activeStrandCount * 4] = endRadius
          strandParameters[activeStrandCount * 4 + 1] = endRadius * STRAND_MID_WAIST
          strandParameters[activeStrandCount * 4 + 2] =
            STRAND_GRAVITY_SAG * cardPrimaryLength * clamp(openingRatio, 0, 1)
          strandParameters[activeStrandCount * 4 + 3] = STRAND_WELD_RADIUS * cardPrimaryLength
          activeStrandCount++
        }
      }

      // Draw WebGL pass
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindVertexArray(vao)

      gl.uniform2f(getUniform('uResolution'), stageW, stageH)
      gl.uniform2f(getUniform('uSize'), cardPrimaryLength, cardSecondaryLength)
      gl.uniform1f(getUniform('uCorner'), CORNER_CURVATURE * cardPrimaryLength)
      gl.uniform1f(getUniform('uCount'), totalCount)
      gl.uniform2fv(getUniform('uCentre'), cardPositions)
      gl.uniform1fv(getUniform('uAngle'), cardRotations)
      gl.uniform4fv(getUniform('uCardState'), cardScales)
      gl.uniform1f(getUniform('uStrandCount'), activeStrandCount)
      gl.uniform2fv(getUniform('uStrandA'), strandStartPoints)
      gl.uniform2fv(getUniform('uStrandB'), strandEndPoints)
      gl.uniform4fv(getUniform('uStrandPar'), strandParameters)
      gl.uniform1f(getUniform('uFuse'), cfg.fuse * cardPrimaryLength)
      gl.uniform1f(
        getUniform('uJitter'),
        reducedMotion
          ? 0
          : SURFACE_TENSION_WOBBLE * cardPrimaryLength * clamp(angularVelocity * 2 + (1 - spreadFactor), 0, 1),
      )
      gl.uniform1f(getUniform('uTime'), reducedMotion ? 0 : elapsedTime)
      gl.uniform3fv(getUniform('uColor'), foregroundInk)
      gl.uniform1f(getUniform('uCrossfade'), TEXTURE_CROSSFADE_SPAN * cardPrimaryLength)
      gl.uniform1f(getUniform('uHasArt'), textureAtlas ? 1 : 0)
      gl.uniform2f(getUniform('uGrid'), COLS, Math.ceil(totalCount / COLS))
      gl.uniform4f(
        getUniform('uCursor'),
        shaderPointerX,
        shaderPointerY,
        pointerEngaged,
        POINTER_FUSION_BOOST * cardPrimaryLength,
      )
      gl.uniform4f(
        getUniform('uWake'),
        POINTER_INFLUENCE_RADIUS * cardPrimaryLength,
        reducedMotion ? 0 : WAKE_AMPLITUDE * cardPrimaryLength * clamp(cursorVelocity / 40, 0, 1),
        WAKE_FREQUENCY / cardPrimaryLength,
        WAKE_SPEED,
      )
      gl.uniform1f(getUniform('uLipDepth'), cfg.glass ? REFRACTION_BAND_HEIGHT * stageH : 0)
      gl.uniform4f(
        getUniform('uLip'),
        REFRACTION_DISPLACEMENT * cardPrimaryLength,
        SQUEEZE_COEFFICIENT,
        BOUNDARY_RIPPLE * cardPrimaryLength,
        BOUNDARY_RIPPLE_FREQ / cardPrimaryLength,
      )
      gl.uniform1f(getUniform('uFringe'), CHROMATIC_FRINGE)
      gl.uniform1f(getUniform('uSheen'), BOUNDARY_SHEEN)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textureAtlas)
      gl.uniform1i(getUniform('uAtlas'), 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    animFrame = requestAnimationFrame(renderFrame)

    return () => {
      cancelAnimationFrame(animFrame)
      resizeWatcher.disconnect()
      canvas.removeEventListener('wheel', onCanvasWheel)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      for (const img of images) img.onload = null
      if (textureAtlas) gl.deleteTexture(textureAtlas)
      gl.deleteBuffer(vbo)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFingerprint, totalCount, reducedMotion])

  const activeItem = items[activeSlot]

  if (!isSupported) {
    return (
      <section
        aria-roledescription="carousel"
        aria-label={brand ?? 'Liquid Gooey Carousel'}
        className={cn('bg-background text-foreground relative h-full min-h-108 w-full', className)}
        {...props}
      >
        <ul className="flex h-full snap-y snap-mandatory flex-col items-center gap-4 overflow-y-auto py-8">
          {items.map((entry) => (
            <li key={entry.image} className="relative w-[64%] shrink-0 snap-center" style={{ aspectRatio: cardRatio }}>
              <NextImage
                src={entry.image}
                alt={entry.title}
                fill
                sizes="(max-width: 768px) 80vw, 50vw"
                className="bg-muted rounded-2xl object-cover"
                unoptimized
              />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={brand ?? 'Liquid Gooey Carousel'}
      className={cn(
        'bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none',
        className,
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="listbox"
        aria-label={brand ?? 'Liquid Gooey Carousel'}
        aria-activedescendant={'liquid-gooey-card-' + activeSlot}
        className="text-foreground focus-visible:outline-foreground absolute inset-0 h-full w-full cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        onKeyDown={(evt) => {
          if (evt.key === 'ArrowDown') stepNavigation.current(1)
          else if (evt.key === 'ArrowUp') stepNavigation.current(-1)
          else return
          evt.preventDefault()
        }}
      />

      <ul className="sr-only">
        {items.map((entry, idx) => (
          <li key={entry.image} id={'liquid-gooey-card-' + idx} role="option" aria-selected={idx === activeSlot}>
            {entry.title}
            {entry.meta ? '. ' + entry.meta : ''}
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute top-1/2 left-[5%] -translate-y-1/2 select-none">
        <div className="text-muted-foreground text-xs font-medium tabular-nums tracking-wider">
          {String(activeSlot + 1).padStart(2, '0')}
        </div>
        <div className="mt-1 text-2xl md:text-3xl font-medium tracking-tight text-foreground">{activeItem?.title}</div>
      </div>
    </section>
  )
}
