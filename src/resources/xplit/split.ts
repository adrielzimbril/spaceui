export type Ratio = number | 'original'

export interface SplitConfig {
  cols: number
  colFlex?: number[]
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

export function getColFlex(cfg: SplitConfig): number[] {
  if (cfg.colFlex && cfg.colFlex.length === cfg.cols) {
    return cfg.colFlex
  }
  return Array(cfg.cols).fill(1)
}

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
  ctx.clearRect(0, 0, stageW, stageH)
  if (cfg.bg && cfg.bg !== 'transparent' && cfg.bg !== '#09090b') {
    ctx.fillStyle = cfg.bg
    ctx.fillRect(0, 0, stageW, stageH)
  }

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
  width: number
  height: number
  flex: number
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
  const gap = cfg.gap || 0
  const flexes = getColFlex(cfg)
  const totalFlex = flexes.reduce((acc, val) => acc + val, 0)
  const availWidth = Math.max(1, stage.width - gap * (cfg.cols - 1))
  const th = stage.height
  const pad = cfg.padding || 0
  const tiles: Tile[] = []

  let currentX = 0
  for (let c = 0; c < cfg.cols; c++) {
    const flex = flexes[c] ?? 1
    const tw = c === cfg.cols - 1
      ? Math.max(1, stage.width - currentX)
      : Math.max(1, Math.round((availWidth * flex) / totalFlex))

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, tw + pad * 2)
    canvas.height = Math.max(1, Math.round(th) + pad * 2)
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (cfg.bg && cfg.bg !== 'transparent' && cfg.bg !== '#09090b') {
      ctx.fillStyle = cfg.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.save()
    if (cfg.radius > 0) {
      roundedPath(ctx, canvas.width, canvas.height, cfg.radius)
      ctx.clip()
    }
    ctx.drawImage(stage, currentX, 0, tw, th, pad, pad, tw, Math.round(th))
    ctx.restore()
    tiles.push({ index: c, col: c, canvas, width: tw, height: Math.round(th), flex })
    currentX += tw + gap
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

// -----------------------------------------------------------------------------
// Pure JavaScript ZIP creation (zero dependencies, 100% browser native)
// -----------------------------------------------------------------------------

const CRC32_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC32_TABLE[i] = c >>> 0
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

export async function createZipArchive(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const fileEntries: {
    nameBytes: Uint8Array
    dataBytes: Uint8Array
    crc: number
    offset: number
  }[] = []

  const encoder = new TextEncoder()
  const localChunks: Uint8Array[] = []
  let currentOffset = 0

  for (const f of files) {
    const nameBytes = encoder.encode(f.name)
    const arrayBuffer = await f.blob.arrayBuffer()
    const dataBytes = new Uint8Array(arrayBuffer)
    const crc = crc32(dataBytes)

    const header = new Uint8Array(30 + nameBytes.length)
    const view = new DataView(header.buffer)

    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0x0800, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, dataBytes.length, true)
    view.setUint32(22, dataBytes.length, true)
    view.setUint16(26, nameBytes.length, true)
    view.setUint16(28, 0, true)
    header.set(nameBytes, 30)

    fileEntries.push({
      nameBytes,
      dataBytes,
      crc,
      offset: currentOffset,
    })

    localChunks.push(header, dataBytes)
    currentOffset += header.length + dataBytes.length
  }

  const centralDirStartOffset = currentOffset
  const centralChunks: Uint8Array[] = []
  let centralDirSize = 0

  for (const entry of fileEntries) {
    const cHeader = new Uint8Array(46 + entry.nameBytes.length)
    const view = new DataView(cHeader.buffer)

    view.setUint32(0, 0x02014b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 20, true)
    view.setUint16(8, 0x0800, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint16(14, 0, true)
    view.setUint32(16, entry.crc, true)
    view.setUint32(20, entry.dataBytes.length, true)
    view.setUint32(24, entry.dataBytes.length, true)
    view.setUint16(28, entry.nameBytes.length, true)
    view.setUint16(30, 0, true)
    view.setUint16(32, 0, true)
    view.setUint16(34, 0, true)
    view.setUint16(36, 0, true)
    view.setUint32(38, 0, true)
    view.setUint32(42, entry.offset, true)
    cHeader.set(entry.nameBytes, 46)

    centralChunks.push(cHeader)
    centralDirSize += cHeader.length
  }

  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, fileEntries.length, true)
  endView.setUint16(10, fileEntries.length, true)
  endView.setUint32(12, centralDirSize, true)
  endView.setUint32(16, centralDirStartOffset, true)
  endView.setUint16(20, 0, true)

  return new Blob([...localChunks, ...centralChunks, endRecord] as unknown as BlobPart[], { type: 'application/zip' })
}
