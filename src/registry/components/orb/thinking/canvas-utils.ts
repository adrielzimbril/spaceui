export interface RenderDot {
  x: number
  y: number
  z: number
  r: number
  white: number
  a?: number
}

export interface RenderLine {
  x1: number
  y1: number
  x2: number
  y2: number
  white: number
  a?: number
  w: number
}

export interface RenderPassData {
  dots: RenderDot[]
  lines: RenderLine[]
}

export function drawDots(ctx: CanvasRenderingContext2D, dots: RenderDot[], isDarkSurface: boolean) {
  for (const dot of dots) {
    const alpha = dot.a ?? 1
    const white = Math.min(1, Math.max(0, dot.white))
    // On dark surface (isDarkSurface = true), white value of 0.72 becomes (1 - 0.72)*255 = 71 (faint),
    // and white value of 0.05 becomes (1 - 0.05)*255 = 242 (bright white highlight).
    const gray = Math.round((isDarkSurface ? 1 - white : white) * 255)
    ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawLines(ctx: CanvasRenderingContext2D, lines: RenderLine[], isDarkSurface: boolean) {
  for (const line of lines) {
    const alpha = line.a ?? 1
    const white = Math.min(1, Math.max(0, line.white))
    const gray = Math.round((isDarkSurface ? 1 - white : white) * 255)
    ctx.strokeStyle = `rgba(${gray},${gray},${gray},${alpha})`
    ctx.lineWidth = line.w
    ctx.beginPath()
    ctx.moveTo(line.x1, line.y1)
    ctx.lineTo(line.x2, line.y2)
    ctx.stroke()
  }
}

export function filterAndSortElements(dots: RenderDot[], lines: RenderLine[], minRadius = 0.3): RenderPassData {
  const validDots: RenderDot[] = []
  for (const dot of dots) {
    if ((dot.a ?? 1) < 0.02) continue
    dot.r = Math.max(minRadius, dot.r)
    validDots.push(dot)
  }
  validDots.sort((a, b) => a.z - b.z)
  return {
    dots: validDots,
    lines: lines.filter((l) => (l.a ?? 1) >= 0.02),
  }
}

export function renderOrbScene(ctx: CanvasRenderingContext2D, scene: RenderPassData, isDarkSurface: boolean) {
  if (scene.lines.length) {
    drawLines(ctx, scene.lines, isDarkSurface)
  }
  drawDots(ctx, scene.dots, isDarkSurface)
}

export function setupCanvasDpr(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): { ctx: CanvasRenderingContext2D; w: number; h: number } {
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1)
  const w = Math.max(1, Math.round(cssWidth))
  const h = Math.max(1, Math.round(cssHeight))

  const physW = Math.round(w * dpr)
  const physH = Math.round(h * dpr)

  if (canvas.width !== physW || canvas.height !== physH) {
    canvas.width = physW
    canvas.height = physH
  }

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, w, h }
}
