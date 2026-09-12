'use client'

import * as React from 'react'
import NextImage from 'next/image'
import { cn } from '@/registry/lib/utils'
import { LENS_FRAG, LENS_VERT, PANEL_FRAG, PANEL_VERT } from './shaders'
import type { PrismCarouselItem, PrismCarouselProps } from './types'

/* Motion characteristics */
const EASE = 0.09
const SNAP_EASE = 0.05
const DRAG_EASE = 0.24
const WHEEL = 1.4
const DRAG = 1.6
const FRICTION = 0.865
const SNAP_IDLE = 120
const CLICK_SLOP = 6

const SHRINK_MAX = 60
const SHRINK_ATTACK = 0.25
const SHRINK_DECAY = 0.06

const FOCUS_EASE = 0.085
const FOCUS_STAGGER = 0.055
const FOCUS_DROP = 1.4
const FOCUS_GROW = 0.18

const ENTRY_SECONDS = 1.15
const ENTRY_STAGGER = 0.07
const ENTRY_START = 0.22

const THEME_EVERY = 20

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const outQuint = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 5)

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
  w: number,
  h: number,
  index: number
) {
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

type Panel = { texture: WebGLTexture | null; aspect: number; fade: number }

export function PrismCarousel({
  items,
  brand,
  panelHeight = 0.62,
  gap = 12,
  radius = 6,
  tint = 'oklch(0.70 0.12 250)',
  focusable = false,
  closeLabel = 'Close',
  className,
  ...props
}: PrismCarouselProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [active, setActive] = React.useState(0)
  const [focused, setFocused] = React.useState<number | null>(null)
  const [reduced, setReduced] = React.useState(false)
  const [supported, setSupported] = React.useState(true)

  const settings = React.useRef({ panelHeight, gap, radius, tint, focusable })
  settings.current = { panelHeight, gap, radius, tint, focusable }
  const focusRef = React.useRef<number | null>(null)
  focusRef.current = focused
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
    const panelProgram = buildProgram(gl, PANEL_VERT, PANEL_FRAG)
    const lensProgram = buildProgram(gl, LENS_VERT, LENS_FRAG)
    if (!panelProgram || !lensProgram) return
    const panelU = getUniforms(gl, panelProgram)
    const lensU = getUniforms(gl, lensProgram)

    const quad = gl.createVertexArray()
    gl.bindVertexArray(quad)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const target = gl.createFramebuffer()
    const rowTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, rowTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, target)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rowTexture, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    const panels: Panel[] = items.map(() => ({ texture: null, aspect: 1.5, fade: 0 }))
    const images = items.map((item, i) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.decoding = 'async'

      const bindTex = (source: TexImageSource, naturalAspect = 1.5) => {
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.generateMipmap(gl.TEXTURE_2D)
        panels[i].texture = texture
        panels[i].aspect = naturalAspect
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

    // --- state ------------------------------------------------------------
    let width = 0
    let height = 0
    let scroll = 0
    let goal = 0
    let velocity = 0
    let energy = 0
    let lastInput = 0
    let snapped = true
    let entry = 0
    let focus = 0
    let focusIndex = 0
    let clock = 0
    let previous = 0
    let ticks = 0
    let frame = 0
    let background: [number, number, number] = [0, 0, 0]
    let tintRgb: [number, number, number] = [0.35, 0.65, 0.95]

    const widths = new Float32Array(count)
    const centers = new Float32Array(count)
    const screenX = new Float32Array(count)
    let total = 1
    let panelPx = 1

    const measure = () => {
      panelPx = height * settings.current.panelHeight
      let x = 0
      for (let i = 0; i < count; i++) {
        widths[i] = panelPx * panels[i].aspect
        centers[i] = x + widths[i] / 2
        x += widths[i] + settings.current.gap
      }
      total = Math.max(x, 1)
    }

    const centerFor = (i: number, from: number) => centers[i] + Math.round((from - centers[i]) / total) * total

    const nearest = (from: number) => {
      let best = 0
      let bestGap = Infinity
      for (let i = 0; i < count; i++) {
        const distance = Math.abs(centerFor(i, from) - from)
        if (distance < bestGap) {
          bestGap = distance
          best = i
        }
      }
      return best
    }

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = w
      height = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gl.bindTexture(gl.TEXTURE_2D, rowTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      measure()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // --- input ------------------------------------------------------------
    const push = (delta: number) => {
      goal += delta
      lastInput = performance.now()
      snapped = false
    }
    step.current = (by: number) => {
      if (focusRef.current !== null) return
      const from = nearest(goal)
      const next = (((from + by) % count) + count) % count
      goal = centerFor(next, goal)
      lastInput = performance.now()
      snapped = true
      velocity = 0
    }

    const onWheel = (event: WheelEvent) => {
      if (focusRef.current !== null) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      event.preventDefault()
      push(delta * WHEEL)
      velocity = 0
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })

    let dragFrom: number | null = null
    let dragTravel = 0
    let dragLast = 0
    let dragStep = 0
    let dragging = false

    const onDown = (event: PointerEvent) => {
      if (focusRef.current !== null) return
      dragFrom = event.clientX
      dragTravel = 0
      dragStep = 0
      dragging = true
      dragLast = performance.now()
      velocity = 0
      canvas.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (dragFrom === null) return
      const travel = dragFrom - event.clientX
      dragStep = travel * (event.pointerType === 'touch' ? 1 : DRAG)
      dragTravel += Math.abs(travel)
      dragFrom = event.clientX
      dragLast = performance.now()
      push(dragStep)
    }
    const onUp = (event: PointerEvent) => {
      if (dragFrom === null) return
      const slop = event.pointerType === 'touch' ? 12 : CLICK_SLOP
      const wasClick = dragTravel < slop
      dragFrom = null
      dragging = false
      if (!wasClick && performance.now() - dragLast < 90) velocity = dragStep
      if (wasClick && settings.current.focusable) {
        const hit = pick(event.clientX)
        if (hit >= 0) {
          goal = centerFor(hit, goal)
          setFocused(hit)
        }
      }
    }

    const pick = (clientX: number) => {
      const x = clientX - canvas.getBoundingClientRect().left - width / 2
      const scale = 1 - 0.25 * energy
      for (let i = 0; i < count; i++) {
        if (Math.abs(x - screenX[i]) <= (widths[i] * scale) / 2) return i
      }
      return -1
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    // --- frame ------------------------------------------------------------
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (!width || !height) return
      const dt = previous ? Math.min((now - previous) / 1000, 1 / 20) : 0
      previous = now
      clock += dt
      measure()

      if (ticks++ % THEME_EVERY === 0) {
        background = readColor(getComputedStyle(canvas).backgroundColor)
        tintRgb = readColor(settings.current.tint)
      }

      if (panels.some((panel) => panel.texture)) {
        entry = reduced ? 1 : Math.min(1, entry + dt / ENTRY_SECONDS)
      }

      const wanted = focusRef.current
      if (wanted !== null) focusIndex = wanted
      const focusGoal = wanted === null ? 0 : 1
      focus = reduced ? focusGoal : focus + (focusGoal - focus) * FOCUS_EASE
      if (Math.abs(focus - focusGoal) < 0.002) focus = focusGoal

      if (Math.abs(velocity) > 0.4) {
        goal += velocity
        velocity *= FRICTION
        lastInput = now
        snapped = false
      } else velocity = 0

      if (!snapped && !dragging && now - lastInput > SNAP_IDLE && !velocity) {
        goal = centerFor(nearest(goal), goal)
        snapped = true
      }

      const before = scroll
      const ease = dragging ? DRAG_EASE : snapped ? SNAP_EASE : EASE
      scroll += (goal - scroll) * (reduced ? 1 : ease)
      const speed = Math.abs(scroll - before)
      const want = clamp(speed / SHRINK_MAX, 0, 1)
      energy += (want - energy) * (want > energy ? SHRINK_ATTACK : SHRINK_DECAY)

      const near = nearest(scroll)
      setActive((prev) => (prev === near ? prev : near))

      // --- pass one: the row, into a texture -----------------------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, target)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(background[0], background[1], background[2], 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(panelProgram)
      gl.bindVertexArray(quad)
      gl.uniform2f(panelU('uRes'), width, height)
      gl.uniform3fv(panelU('uBg'), background)
      gl.uniform1i(panelU('uTex'), 0)
      gl.uniform1f(panelU('uRadius'), settings.current.radius)
      gl.activeTexture(gl.TEXTURE0)

      const shrink = 1 - 0.25 * energy
      const half = width / 2
      const copies = Math.ceil(width / total) + 2

      for (let i = 0; i < count; i++) {
        const panel = panels[i]
        panel.fade += ((panel.texture ? 1 : 0) - panel.fade) * 0.1
        if (panel.fade < 0.005) continue
        gl.bindTexture(gl.TEXTURE_2D, panel.texture)
        gl.uniform1f(panelU('uFade'), panel.fade)

        const w0 = widths[i] * shrink
        const h0 = panelPx * shrink
        const focusOffset = (i - focusIndex) * FOCUS_STAGGER
        const panelFocus = clamp((focus - Math.abs(focusOffset)) / (1 - FOCUS_STAGGER), 0, 1)
        const isFocused = i === focusIndex
        const drop = (1 - panelFocus) * height * FOCUS_DROP
        const scale = isFocused ? 1 + FOCUS_GROW * panelFocus : 1

        const centerDistance = Math.abs(centers[i] - ((scroll % total) + total) % total)
        const entryDelay = (centerDistance / total) * ENTRY_STAGGER * count
        const panelEntry = outQuint(clamp((entry - entryDelay) / (1 - ENTRY_STAGGER), 0, 1))
        const entryScale = lerp(ENTRY_START, 1, panelEntry)
        const entryLift = (1 - panelEntry) * height * 0.35

        const w = w0 * scale * entryScale
        const h = h0 * scale * entryScale

        const xBase = centers[i] - scroll
        const kMin = Math.floor((-half - xBase - widths[i]) / total) - 1
        const kMax = Math.ceil((half - xBase + widths[i]) / total) + 1

        for (let k = kMin; k <= kMax; k++) {
          const cx = xBase + k * total
          if (Math.abs(cx) < half + 1) screenX[i] = cx
          if (cx + w / 2 < -half || cx - w / 2 > half) continue

          const cy = isFocused ? 0 : -drop - entryLift
          gl.uniform4f(panelU('uRect'), cx, cy, w, h)
          gl.drawArrays(gl.TRIANGLES, 0, 6)
        }
      }

      // --- pass two: fullscreen optic over the row texture ---------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(lensProgram)
      gl.bindVertexArray(quad)
      gl.uniform1i(lensU('uTex'), 0)
      gl.uniform1f(lensU('uAspect'), width / Math.max(height, 1))
      gl.uniform1f(lensU('uTime'), clock)
      gl.uniform1f(lensU('uStrength'), entry * (1 - focus))
      gl.uniform3fv(lensU('uTint'), tintRgb)
      gl.bindTexture(gl.TEXTURE_2D, rowTexture)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
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
      images.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
      panels.forEach((p) => p.texture && gl.deleteTexture(p.texture))
      gl.deleteTexture(rowTexture)
      gl.deleteFramebuffer(target)
      gl.deleteProgram(panelProgram)
      gl.deleteProgram(lensProgram)
    }
  }, [count, sources, reduced])

  const item = items[active]
  const open = focused !== null

  if (!supported) {
    return (
      <section
        aria-roledescription="carousel"
        aria-label={brand ?? 'Gallery'}
        className={cn('bg-background text-foreground relative h-full w-full overflow-hidden', className)}
        {...props}
      >
        <ul className="flex h-full w-full items-center gap-4 overflow-x-auto p-8">
          {items.map((entryItem, i) => (
            <li key={entryItem.image} className="flex-none">
              <div className="relative aspect-[3/2] h-[60vh] overflow-hidden rounded-md">
                <NextImage
                  src={entryItem.image}
                  alt={entryItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={i === 0}
                />
              </div>
              <div className="mt-2 text-sm font-medium">{entryItem.title}</div>
              {entryItem.caption ? (
                <div className="text-muted-foreground text-xs">{entryItem.caption}</div>
              ) : null}
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
        aria-activedescendant={`prism-carousel-${active}`}
        className="bg-background text-foreground focus-visible:outline-foreground absolute inset-0 h-full w-full cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step.current(1)
          else if (event.key === 'ArrowLeft') step.current(-1)
          else if (event.key === 'Escape' && open) setFocused(null)
          else return
          event.preventDefault()
        }}
      />

      <ul className="sr-only">
        {items.map((fallbackItem, i) => (
          <li key={fallbackItem.image} id={`prism-carousel-${i}`} role="option" aria-selected={i === active}>
            <NextImage
              src={fallbackItem.image}
              alt={fallbackItem.title}
              width={512}
              height={768}
              unoptimized
            />
            <h3>{fallbackItem.title}</h3>
            {fallbackItem.caption ? <p>{fallbackItem.caption}</p> : null}
          </li>
        ))}
      </ul>

      {brand ? (
        <div className="pointer-events-none absolute top-[6%] left-[5%] text-sm font-medium tracking-tight">
          {brand}
        </div>
      ) : null}

      <div
        className={cn(
          'pointer-events-none absolute bottom-[7%] left-[5%] max-w-[70%] transition-opacity duration-500',
          open ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="text-2xl leading-none font-medium tracking-tight">{item?.title}</div>
        {item?.caption ? <div className="text-muted-foreground mt-1.5 text-sm">{item.caption}</div> : null}
      </div>

      <div className="text-muted-foreground pointer-events-none absolute right-[5%] bottom-[7%] text-sm tabular-nums">
        {String(active + 1).padStart(2, '0')}
        <span className="opacity-50"> / {String(count).padStart(2, '0')}</span>
      </div>

      {focusable ? (
        <button
          type="button"
          onClick={() => setFocused(null)}
          className={cn(
            'border-border bg-background/70 text-foreground focus-visible:outline-foreground absolute top-[6%] right-[5%] cursor-pointer rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-sm transition outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          {closeLabel}
        </button>
      ) : null}
    </section>
  )
}
