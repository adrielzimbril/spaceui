'use client'

import * as React from 'react'
import NextImage from 'next/image'
import { cn } from '@/registry/lib/utils'
import {
  BLUR_FRAG,
  CARD_FRAG,
  CARD_H,
  CARD_VERT,
  CAMERA_Z,
  COMPOSITE_FRAG,
  FOV,
  NEAR,
  QUAD_VERT,
  RADIUS,
  RADIUS_STEP,
} from './shaders'
import type { DitherCarouselItem, DitherCarouselProps } from './types'

const WHEEL = 0.0022
const DRAG = 0.007
const EASE = 0.075
const SNAP_IDLE = 300
const SNAP_EASE = 0.055
const CLICK_SLOP = 6

const BEND_EASE = 0.12
const BEND_MAX = 0.07

const HOVER_IN = 0.095
const HOVER_OUT = 0.07
const HOVER_SETTLE = 8
const FOCUS_FALLOFF = 0.7

const ENTRY_MS = 1050
const ENTRY_STAGGER_MS = 60
const ENTRY_SPIN = 9.4
const ENTRY_SPIN_MS = 2400

const CLICK_MS = 1300
const THEME_EVERY = 20

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function buildProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const program = gl.createProgram()
  if (!program) return null
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
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

function getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const cache = new Map<string, WebGLUniformLocation | null>()
  return (name: string) => {
    let loc = cache.get(name)
    if (loc === undefined) {
      loc = gl.getUniformLocation(program, name)
      cache.set(name, loc)
    }
    return loc
  }
}

function createColorReader() {
  const probe = document.createElement('canvas')
  probe.width = probe.height = 1
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  return (css: string): [number, number, number] => {
    if (!ctx) return [0, 0, 0]
    ctx.fillStyle = '#000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
  }
}

function createTexture(gl: WebGL2RenderingContext, w: number, h: number) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
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

function drawAtmosphericPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number, index: number) {
  const palette = ATMOSPHERIC_PALETTES[index % ATMOSPHERIC_PALETTES.length]
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.33, palette[1])
  grad.addColorStop(0.66, palette[2])
  grad.addColorStop(1, palette[3])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const cx = w * 0.5
  const cy = h * 0.5
  const r = Math.hypot(w, h) * 0.55
  const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
  radial.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)')
  radial.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, w, h)
}

export function DitherCarousel({
  items,
  brand,
  accent,
  cell = 7.5,
  focusBand = 0.25,
  twist = 0.8,
  rise = 0.79,
  cardHeight = CARD_H,
  cardRatio = 0.82,
  entry: playEntry = true,
  gooey = 0.4,
  ditherShape = 'dots',
  className,
  ...props
}: DitherCarouselProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [active, setActive] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const [supported, setSupported] = React.useState(true)

  const settings = React.useRef({ accent, cell, focusBand, twist, rise, cardHeight, cardRatio, gooey, ditherShape })
  settings.current = { accent, cell, focusBand, twist, rise, cardHeight, cardRatio, gooey, ditherShape }
  const step = React.useRef<(by: number) => void>(() => {})

  const count = items.length
  const sources = items.map((item) => item.image).join(' ')

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => setReduced(query.matches)
    read()
    query.addEventListener('change', read)
    return () => query.removeEventListener('change', read)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !count) return
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false })
    if (!gl) {
      setSupported(false)
      return
    }

    const readColor = createColorReader()
    const cardProgram = buildProgram(gl, CARD_VERT, CARD_FRAG)
    const blurProgram = buildProgram(gl, QUAD_VERT, BLUR_FRAG)
    const compositeProgram = buildProgram(gl, QUAD_VERT, COMPOSITE_FRAG)
    if (!cardProgram || !blurProgram || !compositeProgram) return
    const cardU = getUniforms(gl, cardProgram)
    const blurU = getUniforms(gl, blurProgram)
    const compositeU = getUniforms(gl, compositeProgram)

    const COLS = 40
    const ROWS = 8
    const verts: number[] = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const x0 = x / COLS
        const x1 = (x + 1) / COLS
        const y0 = y / ROWS
        const y1 = (y + 1) / ROWS
        verts.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1)
      }
    }
    const cardMesh = gl.createVertexArray()
    gl.bindVertexArray(cardMesh)
    const cardBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cardBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const cardVertexCount = verts.length / 2

    const quad = gl.createVertexArray()
    gl.bindVertexArray(quad)
    const quadBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const sceneFbo = gl.createFramebuffer()
    let sceneTex = createTexture(gl, 1, 1)
    let metaTex = createTexture(gl, 1, 1)
    const depth = gl.createRenderbuffer()
    const blurFbos = [0, 1, 2, 3].map(() => gl.createFramebuffer())
    let blurTex = [0, 1, 2, 3].map(() => createTexture(gl, 1, 1))

    const attach = (w: number, h: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo)
      gl.deleteTexture(sceneTex)
      gl.deleteTexture(metaTex)
      sceneTex = createTexture(gl, w, h)
      metaTex = createTexture(gl, w, h)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, metaTex, 0)
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth)
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth)
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])

      blurTex.forEach((tex) => gl.deleteTexture(tex))
      blurTex = blurFbos.map((fbo, i) => {
        const tex = createTexture(gl, Math.max(1, w >> (i + 1)), Math.max(1, h >> (i + 1)))
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
        return tex
      })
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    const cards = items.map(() => ({ texture: null as WebGLTexture | null, aspect: 1.5 }))
    const images = items.map((item, i) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.decoding = 'async'

      const bindTex = (source: TexImageSource, naturalAspect = 1.5) => {
        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.generateMipmap(gl.TEXTURE_2D)
        cards[i].texture = tex
        cards[i].aspect = naturalAspect
      }

      image.onload = () => {
        bindTex(image, image.naturalWidth / Math.max(image.naturalHeight, 1))
      }
      image.onerror = () => {
        const placeholderCanvas = document.createElement('canvas')
        placeholderCanvas.width = 512
        placeholderCanvas.height = 768
        const pctx = placeholderCanvas.getContext('2d')
        if (pctx) {
          drawAtmosphericPlaceholder(pctx, 512, 768, i)
        }
        bindTex(placeholderCanvas, 512 / 768)
      }
      image.src = item.image
      return image
    })

    let width = 0
    let height = 0
    let progress = 0
    let goal = 0
    let smoothed = 0
    let lastInput = 0
    let snapped = true
    let hovered = -1
    let pointerX = -1
    let pointerY = -1
    let pointerSpeed = 0
    let ticks = 0
    let frame = 0
    let entryStart = 0
    let background: [number, number, number] = [0, 0, 0]
    let accentRgb: [number, number, number] = [1, 1, 1]

    let tween: { from: number; to: number; at: number } | null = null

    const dim = new Float32Array(count)
    const hover = new Float32Array(count)
    const entryOf = new Float32Array(count).fill(playEntry && !reduced ? 1 : 0)
    const order = items.map((_, i) => i).sort(() => Math.random() - 0.5)

    const focal = 1 / Math.tan((FOV * Math.PI) / 360)
    const FRONT = Math.floor(count / 2)

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = w
      height = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      attach(canvas.width, canvas.height)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const project = (index: number) => {
      const { twist: turn, rise: pitch, cardHeight: cH, cardRatio: ratio } = settings.current
      const slot = ((((index - progress) % count) + count) % count) - FRONT
      const angle = slot * turn
      const y = slot * pitch * cH
      const z = Math.cos(angle) * (RADIUS + slot * RADIUS_STEP)
      const away = CAMERA_Z - z
      if (away <= NEAR) return null
      const aspect = width / Math.max(height, 1)
      const sx = ((Math.sin(angle) * (RADIUS + slot * RADIUS_STEP) * focal) / aspect / away) * 0.5 + 0.5
      const sy = 0.5 - ((y * focal) / away) * 0.5
      return {
        x: sx * width,
        y: sy * height,
        halfW: ((cH * ratio * focal) / aspect / away) * 0.5 * width * 0.5,
        halfH: ((cH * focal) / away) * 0.5 * height * 0.5,
        away,
      }
    }

    const pick = (px: number, py: number) => {
      let best = -1
      let bestAway = Infinity
      for (let i = 0; i < count; i++) {
        const at = project(i)
        if (!at) continue
        if (Math.abs(px - at.x) > at.halfW || Math.abs(py - at.y) > at.halfH) continue
        if (at.away < bestAway) {
          bestAway = at.away
          best = i
        }
      }
      return best
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      tween = null
      goal += event.deltaY * WHEEL
      lastInput = performance.now()
      snapped = false
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })

    step.current = (by: number) => {
      tween = { from: goal, to: Math.round(goal) + by, at: performance.now() }
      lastInput = performance.now()
      snapped = true
    }

    let dragFrom: number | null = null
    let dragTravel = 0
    const onDown = (event: PointerEvent) => {
      dragFrom = event.clientY
      dragTravel = 0
      tween = null
      canvas.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      const nx = event.clientX - box.left
      const ny = event.clientY - box.top
      pointerSpeed = Math.hypot(nx - pointerX, ny - pointerY)
      pointerX = nx
      pointerY = ny
      if (dragFrom !== null) {
        const travel = dragFrom - event.clientY
        dragTravel += Math.abs(travel)
        dragFrom = event.clientY
        goal += travel * DRAG
        lastInput = performance.now()
        snapped = false
      }
    }
    const onUp = (event: PointerEvent) => {
      const wasClick = dragFrom !== null && dragTravel < CLICK_SLOP
      dragFrom = null
      if (!wasClick) return
      const hit = pick(pointerX, pointerY)
      if (hit >= 0) {
        const want = (((hit - FRONT) % count) + count) % count
        const to = want + Math.round((goal - want) / count) * count
        tween = { from: goal, to, at: performance.now() }
        snapped = true
      }
    }
    const onLeave = () => {
      pointerX = -1
      pointerY = -1
      hovered = -1
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('pointerleave', onLeave)

    const drawQuad = () => {
      gl.bindVertexArray(quad)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (!width || !height) return
      const {
        cell: cellPx,
        focusBand: band,
        twist: turn,
        rise: pitch,
        cardRatio: ratio,
        cardHeight: cH,
      } = settings.current
      const cardW = cH * ratio

      if (ticks++ % THEME_EVERY === 0) {
        background = readColor(getComputedStyle(canvas).backgroundColor)
        accentRgb = readColor(settings.current.accent ?? getComputedStyle(canvas).color)
      }

      const ready = cards.every((card) => card.texture)
      if (ready && !entryStart) entryStart = now
      const elapsed = entryStart ? now - entryStart : 0
      if (ready && playEntry && !reduced) {
        for (let rank = 0; rank < count; rank++) {
          const t = (elapsed - rank * ENTRY_STAGGER_MS) / ENTRY_MS
          entryOf[order[rank]] = 1 - clamp(t, 0, 1)
        }
        const spin = clamp(elapsed / ENTRY_SPIN_MS, 0, 1)
        progress = goal - ENTRY_SPIN * (1 - inOutCubic(spin))
      } else if (ready) {
        entryOf.fill(0)
      }
      const arriving = playEntry && !reduced && ready && elapsed < ENTRY_SPIN_MS

      if (tween) {
        const t = clamp((now - tween.at) / CLICK_MS, 0, 1)
        goal = tween.from + (tween.to - tween.from) * inOutCubic(t)
        if (t >= 1) tween = null
      } else if (!snapped && now - lastInput > SNAP_IDLE) {
        goal = Math.round(goal)
        snapped = true
      }

      const before = progress
      if (!arriving) {
        progress += (goal - progress) * (reduced ? 1 : snapped ? SNAP_EASE : EASE)
      }
      const velocity = progress - before
      smoothed += (clamp(velocity, -BEND_MAX, BEND_MAX) - smoothed) * BEND_EASE

      const near = (((Math.round(goal) + FRONT) % count) + count) % count
      setActive((prev) => (prev === near ? prev : near))

      if (pointerX >= 0 && pointerSpeed < HOVER_SETTLE) hovered = pick(pointerX, pointerY)
      pointerSpeed *= 0.8
      for (let i = 0; i < count; i++) {
        const isHovered = i === hovered
        const wantHover = isHovered ? 1 : 0
        hover[i] += (wantHover - hover[i]) * (wantHover > hover[i] ? HOVER_IN : HOVER_OUT)
        let wantDim = 0
        if (hovered >= 0) {
          let gapTo = Math.abs(i - hovered)
          gapTo = Math.min(gapTo, count - gapTo)
          wantDim = clamp(gapTo / FOCUS_FALLOFF, 0, 1)
        }
        dim[i] += (wantDim - dim[i]) * (wantDim > dim[i] ? HOVER_IN : HOVER_OUT)
      }

      // --- pass one: the cards -------------------------------------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.enable(gl.DEPTH_TEST)
      gl.clearBufferfv(gl.COLOR, 0, [background[0], background[1], background[2], 1])
      gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 1])
      gl.clear(gl.DEPTH_BUFFER_BIT)
      gl.useProgram(cardProgram)
      gl.bindVertexArray(cardMesh)
      gl.uniform1f(cardU('uCount'), count)
      gl.uniform1f(cardU('uProgress'), progress)
      gl.uniform1f(cardU('uAngleStep'), turn)
      gl.uniform1f(cardU('uPitch'), pitch * cH)
      gl.uniform1f(cardU('uVelocity'), smoothed)
      gl.uniform2f(cardU('uCard'), cardW, cH)
      gl.uniform1f(cardU('uFocal'), focal)
      gl.uniform1f(cardU('uAspect'), width / height)
      gl.uniform3fv(cardU('uBackground'), background)
      gl.uniform1i(cardU('uMap'), 0)
      gl.uniform1f(cardU('uEntryScale'), 9.5)
      gl.uniform1f(cardU('uEntryAspect'), ratio)
      gl.activeTexture(gl.TEXTURE0)

      for (let i = 0; i < count; i++) {
        const card = cards[i]
        if (!card.texture) continue
        gl.bindTexture(gl.TEXTURE_2D, card.texture)
        gl.uniform1f(cardU('uIndex'), i)
        gl.uniform1f(cardU('uHover'), hover[i])
        gl.uniform1f(cardU('uDim'), dim[i])
        gl.uniform1f(cardU('uEntry'), entryOf[i])
        gl.uniform2f(
          cardU('uImageRatio'),
          card.aspect < ratio ? 1 : ratio / card.aspect,
          card.aspect < ratio ? card.aspect / ratio : 1,
        )
        gl.drawArrays(gl.TRIANGLES, 0, cardVertexCount)
      }
      gl.disable(gl.DEPTH_TEST)

      // --- pass two: the blur chain ---------------------------------------
      gl.useProgram(blurProgram)
      gl.uniform1i(blurU('uMap'), 0)
      gl.uniform1f(blurU('uSpread'), 4.5)
      let source = sceneTex
      for (let i = 0; i < 4; i++) {
        const w = Math.max(1, canvas.width >> (i + 1))
        const h = Math.max(1, canvas.height >> (i + 1))
        gl.bindFramebuffer(gl.FRAMEBUFFER, blurFbos[i])
        gl.viewport(0, 0, w, h)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, source)
        gl.uniform2f(blurU('uTexel'), 1 / w, 1 / h)
        drawQuad()
        source = blurTex[i]
      }

      // --- pass three: the composite --------------------------------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(compositeProgram)
      const bound = [sceneTex, metaTex, ...blurTex]
      const names = ['uScene', 'uMeta', 'uBlur1', 'uBlur2', 'uBlur3', 'uBlur4']
      bound.forEach((tex, unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.uniform1i(compositeU(names[unit]), unit)
      })
      gl.uniform2f(compositeU('uResolution'), canvas.width, canvas.height)
      gl.uniform3fv(compositeU('uBackground'), background)
      gl.uniform3fv(compositeU('uAccent'), accentRgb)
      gl.uniform1f(compositeU('uFocusSize'), band)
      gl.uniform1f(compositeU('uDitherScale'), cellPx)
      gl.uniform1f(compositeU('uEntryScale'), 9.5)
      const currentGooey = settings.current.gooey
      const gooeyVal = typeof currentGooey === 'number' ? currentGooey : currentGooey ? 0.4 : 0.0
      const currentShape = settings.current.ditherShape ?? 'dots'
      const patternCode =
        currentShape === 'bayer'
          ? 0
          : currentShape === 'diamond'
            ? 2
            : currentShape === 'cross'
              ? 3
              : currentShape === 'fluid'
                ? 4
                : 1
      gl.uniform1f(compositeU('uGooey'), gooeyVal)
      gl.uniform1f(compositeU('uTime'), now * 0.001)
      gl.uniform1i(compositeU('uDitherPattern'), patternCode)
      drawQuad()
      gl.activeTexture(gl.TEXTURE0)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      for (const image of images) image.onload = null
      for (const card of cards) if (card.texture) gl.deleteTexture(card.texture)
      gl.deleteTexture(sceneTex)
      gl.deleteTexture(metaTex)
      blurTex.forEach((tex) => gl.deleteTexture(tex))
      blurFbos.forEach((fbo) => gl.deleteFramebuffer(fbo))
      gl.deleteFramebuffer(sceneFbo)
      gl.deleteRenderbuffer(depth)
      gl.deleteBuffer(cardBuffer)
      gl.deleteBuffer(quadBuffer)
      gl.deleteVertexArray(cardMesh)
      gl.deleteVertexArray(quad)
      gl.deleteProgram(cardProgram)
      gl.deleteProgram(blurProgram)
      gl.deleteProgram(compositeProgram)
    }
  }, [sources, count, reduced, playEntry])

  if (!supported) {
    return (
      <section
        aria-roledescription="carousel"
        aria-label={brand ?? 'Gallery'}
        className={cn('bg-background text-foreground relative h-full min-h-full w-full', className)}
        {...props}
      >
        <ul className="flex h-full snap-y snap-mandatory flex-col items-center gap-4 overflow-y-auto py-[6%]">
          {items.map((entry) => (
            <li key={entry.image} className="relative w-[62%] shrink-0 snap-center" style={{ aspectRatio: cardRatio }}>
              <NextImage
                src={entry.image}
                alt={entry.title}
                fill
                sizes="(max-width: 768px) 80vw, 50vw"
                className="bg-muted rounded-xl object-cover"
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
      aria-label={brand ?? 'Gallery'}
      className={cn(
        'bg-background text-foreground relative h-full min-h-full w-full overflow-hidden select-none',
        className,
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="listbox"
        aria-label={brand ?? 'Gallery'}
        aria-activedescendant={`dither-carousel-${active}`}
        className="bg-background text-foreground focus-visible:outline-foreground absolute inset-0 h-full w-full cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') step.current(1)
          else if (event.key === 'ArrowUp') step.current(-1)
          else return
          event.preventDefault()
        }}
      />

      <ul className="sr-only">
        {items.map((item, i) => (
          <li key={item.image} id={`dither-carousel-${i}`} role="option" aria-selected={i === active}>
            <NextImage src={item.image} alt={item.title} width={512} height={768} unoptimized />
            <h3>{item.title}</h3>
          </li>
        ))}
      </ul>

      {brand ? (
        <div className="pointer-events-none absolute top-[6%] left-[5%] text-sm font-medium tracking-tight">
          {brand}
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-[7%] left-[5%] text-2xl leading-none font-medium tracking-tight">
        {items[active]?.title}
      </div>

      <div className="text-muted-foreground pointer-events-none absolute right-[5%] bottom-[7%] text-sm tabular-nums">
        {String(active + 1).padStart(2, '0')}
        <span className="opacity-50"> / {String(count).padStart(2, '0')}</span>
      </div>
    </section>
  )
}
