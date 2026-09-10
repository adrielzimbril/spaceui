export interface ArtworkAnalysis {
  edgeColor: string
  hasAlpha: boolean
  hasWhiteBorder: boolean
  palette: string[]
}

export function analyzeArtwork(imgOrCanvas: HTMLImageElement | HTMLCanvasElement): ArtworkAnalysis {
  let width = 0
  let height = 0

  if (imgOrCanvas instanceof HTMLImageElement) {
    width = imgOrCanvas.naturalWidth || imgOrCanvas.width
    height = imgOrCanvas.naturalHeight || imgOrCanvas.height
  } else {
    width = imgOrCanvas.width
    height = imgOrCanvas.height
  }

  const fallback: ArtworkAnalysis = {
    edgeColor: '#ffffff',
    hasAlpha: false,
    hasWhiteBorder: true,
    palette: ['#ffffff', '#121214', '#0052ff', '#f7931a', '#6e54ff'],
  }

  if (!width || !height) return fallback

  const sampleW = Math.min(width, 128)
  const sampleH = Math.min(height, 128)

  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width = sampleW
  sampleCanvas.height = sampleH
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return fallback

  ctx.drawImage(imgOrCanvas, 0, 0, sampleW, sampleH)
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH)
  const data = imgData.data

  let transparentPixels = 0
  const totalPixels = sampleW * sampleH
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 128) {
      transparentPixels++
    }
  }

  let perimeterCount = 0
  let perimeterTransparent = 0
  let perimeterWhite = 0
  let rSum = 0
  let gSum = 0
  let bSum = 0
  let opaqueCount = 0

  const samplePixel = (idx: number) => {
    perimeterCount++
    const a = data[idx + 3]
    if (a < 128) {
      perimeterTransparent++
    } else {
      opaqueCount++
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      if (r > 230 && g > 230 && b > 230) {
        perimeterWhite++
      }
      rSum += r
      gSum += g
      bSum += b
    }
  }

  for (let x = 0; x < sampleW; x++) {
    samplePixel(x * 4)
    samplePixel(((sampleH - 1) * sampleW + x) * 4)
  }

  for (let y = 1; y < sampleH - 1; y++) {
    samplePixel(y * sampleW * 4)
    samplePixel((y * sampleW + sampleW - 1) * 4)
  }

  const isTransparentCutout =
    perimeterTransparent / Math.max(1, perimeterCount) > 0.12 ||
    (transparentPixels / totalPixels > 0.04 && perimeterTransparent > 0)

  const isWhiteBorder = !isTransparentCutout && perimeterWhite / Math.max(1, perimeterCount) > 0.7

  const toHex = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, '0')

  let edgeColor = '#ffffff'
  if (isTransparentCutout || isWhiteBorder) {
    edgeColor = '#ffffff'
  } else if (opaqueCount > 0) {
    const r = Math.round(rSum / opaqueCount)
    const g = Math.round(gSum / opaqueCount)
    const b = Math.round(bSum / opaqueCount)
    edgeColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const palette = extractDominantPalette(sampleCanvas)

  return {
    edgeColor,
    hasAlpha: isTransparentCutout,
    hasWhiteBorder: isWhiteBorder,
    palette,
  }
}

export function detectArtworkEdgeColor(imgOrCanvas: HTMLImageElement | HTMLCanvasElement): string {
  return analyzeArtwork(imgOrCanvas).edgeColor
}

export const detectEdgeColor = detectArtworkEdgeColor

export function extractDominantPalette(canvas: HTMLCanvasElement): string[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ['#ffffff', '#121214', '#0052ff', '#f7931a', '#6e54ff']

  const { width, height } = canvas
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>()

  const step = Math.max(1, Math.floor(Math.min(width, height) / 50))
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a > 60) {
        const qr = Math.round(data[idx] / 24) * 24
        const qg = Math.round(data[idx + 1] / 24) * 24
        const qb = Math.round(data[idx + 2] / 24) * 24
        const key = `${qr},${qg},${qb}`
        const entry = colorBuckets.get(key)
        if (entry) {
          entry.count++
        } else {
          colorBuckets.set(key, { r: data[idx], g: data[idx + 1], b: data[idx + 2], count: 1 })
        }
      }
    }
  }

  const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count)
  const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')

  const results: string[] = []
  for (const item of sorted) {
    const hex = `#${toHex(item.r)}${toHex(item.g)}${toHex(item.b)}`
    if (!results.includes(hex)) {
      results.push(hex)
    }
    if (results.length >= 5) break
  }

  while (results.length < 5) {
    results.push(['#ffffff', '#121214', '#0052ff', '#f7931a', '#6e54ff'][results.length])
  }

  return results
}
