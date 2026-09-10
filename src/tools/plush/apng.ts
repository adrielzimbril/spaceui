const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

function crc32(buf: Uint8Array, offset: number, length: number): number {
  let c = 0xffffffff
  for (let i = 0; i < length; i++) {
    c = crcTable[(c ^ buf[offset + i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

const pngSig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const iendChunk = new Uint8Array([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])

export interface APNGFrame {
  width: number
  height: number
  x: number
  y: number
  delay: number
  disposeOp: number
  blendOp: number
  imageBitmap?: ImageBitmap
  imageElement?: HTMLImageElement
}

export interface APNGData {
  width: number
  height: number
  numPlays: number
  playTime: number
  frames: APNGFrame[]
}

export function isAPNG(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 16) return false
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return false
  }

  const view = new DataView(buffer)
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const len = view.getUint32(offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    if (type === 'acTL') return true
    if (type === 'IEND') break
    offset += 12 + len
  }
  return false
}

export async function parseAPNG(buffer: ArrayBuffer): Promise<APNGData | null> {
  if (!isAPNG(buffer)) return null

  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 8
  let colorType = 6
  let compression = 0
  let filter = 0
  let interlace = 0
  let numPlays = 0

  const paletteChunks: Uint8Array[] = []
  interface RawFrame {
    width: number
    height: number
    x: number
    y: number
    delay: number
    disposeOp: number
    blendOp: number
    dataChunks: Uint8Array[]
  }

  const rawFrames: RawFrame[] = []
  let currentRawFrame: RawFrame | null = null

  while (offset + 8 <= bytes.length) {
    const len = view.getUint32(offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const chunkDataOffset = offset + 8

    if (type === 'IHDR') {
      width = view.getUint32(chunkDataOffset)
      height = view.getUint32(chunkDataOffset + 4)
      bitDepth = bytes[chunkDataOffset + 8]
      colorType = bytes[chunkDataOffset + 9]
      compression = bytes[chunkDataOffset + 10]
      filter = bytes[chunkDataOffset + 11]
      interlace = bytes[chunkDataOffset + 12]
    } else if (type === 'acTL') {
      numPlays = view.getUint32(chunkDataOffset + 4)
    } else if (type === 'PLTE' || type === 'tRNS') {
      paletteChunks.push(bytes.slice(offset, offset + 12 + len))
    } else if (type === 'fcTL') {
      const fWidth = view.getUint32(chunkDataOffset + 4)
      const fHeight = view.getUint32(chunkDataOffset + 8)
      const fX = view.getUint32(chunkDataOffset + 12)
      const fY = view.getUint32(chunkDataOffset + 16)
      const delayNum = view.getUint16(chunkDataOffset + 20)
      const delayDen = view.getUint16(chunkDataOffset + 22) || 100
      let delay = (delayNum / delayDen) * 1000
      if (delay <= 10) delay = 100

      const disposeOp = bytes[chunkDataOffset + 24]
      const blendOp = bytes[chunkDataOffset + 25]

      currentRawFrame = {
        width: fWidth,
        height: fHeight,
        x: fX,
        y: fY,
        delay,
        disposeOp,
        blendOp,
        dataChunks: [],
      }
      rawFrames.push(currentRawFrame)
    } else if (type === 'IDAT') {
      if (currentRawFrame) {
        currentRawFrame.dataChunks.push(bytes.slice(offset, offset + 12 + len))
      }
    } else if (type === 'fdAT') {
      if (currentRawFrame) {
        const payloadLen = len - 4
        const idatChunk = new Uint8Array(12 + payloadLen)
        const idatView = new DataView(idatChunk.buffer)
        idatView.setUint32(0, payloadLen)
        idatChunk[4] = 0x49
        idatChunk[5] = 0x44
        idatChunk[6] = 0x41
        idatChunk[7] = 0x54
        idatChunk.set(bytes.subarray(chunkDataOffset + 4, chunkDataOffset + len), 8)
        const check = crc32(idatChunk, 4, 4 + payloadLen)
        idatView.setUint32(8 + payloadLen, check)
        currentRawFrame.dataChunks.push(idatChunk)
      }
    } else if (type === 'IEND') {
      break
    }

    offset += 12 + len
  }

  const BATCH_SIZE = 8
  const frames: APNGFrame[] = []
  let totalPlayTime = 0

  const maxDim = Math.max(width, height)
  const targetDim = Math.min(512, maxDim)
  const scale = maxDim > 0 ? targetDim / maxDim : 1.0
  const scaledWidth = Math.max(1, Math.round(width * scale))
  const scaledHeight = Math.max(1, Math.round(height * scale))

  for (let b = 0; b < rawFrames.length; b += BATCH_SIZE) {
    const batch = rawFrames.slice(b, b + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (rf) => {
        totalPlayTime += rf.delay

        const ihdrChunk = new Uint8Array(12 + 13)
        const ihdrView = new DataView(ihdrChunk.buffer)
        ihdrView.setUint32(0, 13)
        ihdrChunk[4] = 0x49
        ihdrChunk[5] = 0x48
        ihdrChunk[6] = 0x44
        ihdrChunk[7] = 0x52
        ihdrView.setUint32(8, rf.width)
        ihdrView.setUint32(12, rf.height)
        ihdrChunk[16] = bitDepth
        ihdrChunk[17] = colorType
        ihdrChunk[18] = compression
        ihdrChunk[19] = filter
        ihdrChunk[20] = interlace
        const ihdrCrc = crc32(ihdrChunk, 4, 4 + 13)
        ihdrView.setUint32(8 + 13, ihdrCrc)

        const parts: Uint8Array[] = [pngSig, ihdrChunk, ...paletteChunks, ...rf.dataChunks, iendChunk]
        const totalLen = parts.reduce((acc, p) => acc + p.byteLength, 0)
        const fullPng = new Uint8Array(totalLen)
        let cur = 0
        for (const p of parts) {
          fullPng.set(p, cur)
          cur += p.byteLength
        }

        const blob = new Blob([fullPng as unknown as BlobPart], { type: 'image/png' })

        const targetFrameW = Math.max(1, Math.round(rf.width * scale))
        const targetFrameH = Math.max(1, Math.round(rf.height * scale))
        const targetFrameX = Math.round(rf.x * scale)
        const targetFrameY = Math.round(rf.y * scale)

        const frameItem: APNGFrame = {
          width: targetFrameW,
          height: targetFrameH,
          x: targetFrameX,
          y: targetFrameY,
          delay: rf.delay,
          disposeOp: rf.disposeOp,
          blendOp: rf.blendOp,
        }

        if (typeof createImageBitmap !== 'undefined') {
          try {
            frameItem.imageBitmap = await createImageBitmap(blob, {
              resizeWidth: targetFrameW,
              resizeHeight: targetFrameH,
              resizeQuality: 'medium',
            })
          } catch {
            try {
              frameItem.imageBitmap = await createImageBitmap(blob)
            } catch {
              const img = new Image()
              const url = URL.createObjectURL(blob)
              img.src = url
              await img.decode()
              URL.revokeObjectURL(url)
              frameItem.imageElement = img
            }
          }
        } else {
          const img = new Image()
          const url = URL.createObjectURL(blob)
          img.src = url
          await img.decode()
          URL.revokeObjectURL(url)
          frameItem.imageElement = img
        }

        return frameItem
      }),
    )
    frames.push(...batchResults)
  }

  return {
    width: scaledWidth,
    height: scaledHeight,
    numPlays,
    playTime: totalPlayTime,
    frames,
  }
}

export class APNGPlayer {
  public apng: APNGData
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private prevCanvas: HTMLCanvasElement
  private prevCtx: CanvasRenderingContext2D
  private currentFrame = 0
  private isPlaying = false
  private animFrameId: number | null = null
  private onFrameCallback?: (canvas: HTMLCanvasElement) => void

  constructor(apng: APNGData) {
    this.apng = apng
    this.canvas = document.createElement('canvas')
    this.canvas.width = apng.width
    this.canvas.height = apng.height
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!

    this.prevCanvas = document.createElement('canvas')
    this.prevCanvas.width = apng.width
    this.prevCanvas.height = apng.height
    this.prevCtx = this.prevCanvas.getContext('2d', { willReadFrequently: true })!
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  private renderFrame(index: number) {
    const frame = this.apng.frames[index]
    const img = frame.imageBitmap || frame.imageElement
    if (!img) return

    if (frame.disposeOp === 2) {
      this.prevCtx.clearRect(0, 0, this.apng.width, this.apng.height)
      this.prevCtx.drawImage(this.canvas, 0, 0)
    }

    if (frame.blendOp === 0) {
      this.ctx.clearRect(frame.x, frame.y, frame.width, frame.height)
    }

    this.ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height)

    if (this.onFrameCallback) {
      this.onFrameCallback(this.canvas)
    }
  }

  public play(onFrame: (canvas: HTMLCanvasElement) => void): () => void {
    this.onFrameCallback = onFrame
    this.isPlaying = true
    this.currentFrame = 0
    let lastFrameTime = performance.now()

    this.renderFrame(this.currentFrame)

    const loop = (now: number) => {
      if (!this.isPlaying) return

      const frame = this.apng.frames[this.currentFrame]
      const delay = Math.max(16, frame.delay)
      const elapsed = now - lastFrameTime

      if (elapsed >= delay) {
        lastFrameTime = now - (elapsed % delay)

        if (frame.disposeOp === 1) {
          this.ctx.clearRect(frame.x, frame.y, frame.width, frame.height)
        } else if (frame.disposeOp === 2) {
          this.ctx.clearRect(0, 0, this.apng.width, this.apng.height)
          this.ctx.drawImage(this.prevCanvas, 0, 0)
        }

        this.currentFrame = (this.currentFrame + 1) % this.apng.frames.length
        this.renderFrame(this.currentFrame)
      }

      this.animFrameId = requestAnimationFrame(loop)
    }

    this.animFrameId = requestAnimationFrame(loop)

    return () => {
      this.stop()
    }
  }

  public stop() {
    this.isPlaying = false
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }
}
