export type Ratio = number | 'original'

export interface SplitConfig {
  cols: number
  ratio: Ratio
  fit: 'cover' | 'contain'
  zoom: number
  panX: number
  panY: number
  gap: number
  bg: string
  padding: number
  radius: number
  scale: number
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality: number
  prefix: string
  reverse: boolean
}

export const MAX_STAGE = 8000

export type Source = HTMLImageElement | HTMLCanvasElement

export function prepareSource(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

export function frameAspect(src: Source, cfg: SplitConfig): number {
  const w = src.width
  const h = src.height
  if (cfg.ratio === 'original') return w / h
  return cfg.ratio
}

export function renderStage(src: Source, cfg: SplitConfig): HTMLCanvasElement {
  const w = src.width
  const h = src.height
  const aspect = frameAspect(src, cfg)
  const baseW = Math.min(w, h * aspect)
  const baseH = baseW / aspect

  let stageW = Math.max(cfg.cols * 8, Math.round(baseW * cfg.scale))
  let stageH = Math.max(8, Math.round(stageW / aspect))
  const over = Math.max(stageW, stageH) / MAX_STAGE
  if (over > 1) {
    stageW = Math.round(stageW / over)
    stageH = Math.round(stageH / over)
  }

  const canvas = document.createElement('canvas')
  canvas.width = stageW
  canvas.height = stageH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = cfg.bg
  ctx.fillRect(0, 0, stageW, stageH)

  if (cfg.fit === 'cover') {
    const cropW = baseW / cfg.zoom
    const cropH = baseH / cfg.zoom
    const cropX = cfg.panX * (w - cropW)
    const cropY = cfg.panY * (h - cropH)
    ctx.drawImage(src, cropX, cropY, cropW, cropH, 0, 0, stageW, stageH)
  } else {
    const s = Math.min(stageW / w, stageH / h) * cfg.zoom
    const dw = w * s
    const dh = h * s
    ctx.drawImage(src, (stageW - dw) * cfg.panX, (stageH - dh) * cfg.panY, dw, dh)
  }
  return canvas
}

export interface Tile {
  index: number
  col: number
  canvas: HTMLCanvasElement
}

function roundedPath(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(rr, 0)
  ctx.arcTo(w, 0, w, h, rr)
  ctx.arcTo(w, h, 0, h, rr)
  ctx.arcTo(0, h, 0, 0, rr)
  ctx.arcTo(0, 0, w, 0, rr)
  ctx.closePath()
}

export function sliceStage(stage: HTMLCanvasElement, cfg: SplitConfig): Tile[] {
  const gap = cfg.gap
  const tw = (stage.width - gap * (cfg.cols - 1)) / cfg.cols
  const th = stage.height
  const pad = cfg.padding
  const tiles: Tile[] = []

  for (let c = 0; c < cfg.cols; c++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(tw) + pad * 2)
    canvas.height = Math.max(1, Math.round(th) + pad * 2)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = cfg.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    if (cfg.radius > 0) {
      roundedPath(ctx, canvas.width, canvas.height, cfg.radius)
      ctx.clip()
      ctx.fillStyle = cfg.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(stage, c * (tw + gap), 0, tw, th, pad, pad, Math.round(tw), Math.round(th))
    ctx.restore()
    tiles.push({ index: c, col: c, canvas })
  }
  return cfg.reverse ? tiles.slice().reverse() : tiles
}

export function toBlob(canvas: HTMLCanvasElement, cfg: SplitConfig): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      cfg.format,
      cfg.format === 'image/png' ? undefined : cfg.quality,
    )
  })
}

export function extFor(format: SplitConfig['format']) {
  return format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
