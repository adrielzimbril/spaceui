import type { RevealConfig } from './state'

export interface Point {
  x: number
  y: number
}

export class BrushTrail {
  head: Point = { x: 0, y: 0 }
  points: Point[] = []

  reset(x: number, y: number) {
    this.head.x = x
    this.head.y = y
    this.points = []
  }

  resize(count: number) {
    while (this.points.length < count) this.points.push({ x: this.head.x, y: this.head.y })
    if (this.points.length > count) this.points.length = count
  }

  step(lerpFactor: number) {
    if (this.points.length === 0) return
    this.points[0].x = this.head.x
    this.points[0].y = this.head.y
    for (let i = 1; i < this.points.length; i++) {
      this.points[i].x += (this.points[i - 1].x - this.points[i].x) * lerpFactor
      this.points[i].y += (this.points[i - 1].y - this.points[i].y) * lerpFactor
    }
  }

  paint(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cfg: RevealConfig,
    intensity: number,
    revealFactor: number,
  ) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    if (revealFactor <= 0.001 || this.points.length === 0) return
    ctx.strokeStyle = '#fff'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 0; i < this.points.length - 1; i++) {
      const w = cfg.thickness * intensity * (1 - (i / this.points.length) * 0.98) * revealFactor
      if (w > 0.5) {
        ctx.beginPath()
        ctx.moveTo(this.points[i].x, this.points[i].y)
        ctx.lineTo(this.points[i + 1].x, this.points[i + 1].y)
        ctx.lineWidth = w
        ctx.stroke()
      }
    }
    const hr = (cfg.thickness / 2) * intensity * revealFactor
    if (hr > 0.5) {
      ctx.beginPath()
      ctx.arc(this.points[0].x, this.points[0].y, hr, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
    }
  }
}
