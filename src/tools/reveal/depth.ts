/**
 * Fallback pseudo-depth map generated from image luminance. Zero-dependency,
 * runs in-browser instantly. Returns a data URL (grayscale PNG) matching the
 * source dimensions.
 */
export async function pseudoDepth(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('no 2d ctx'))
      ctx.drawImage(img, 0, 0)
      const im = ctx.getImageData(0, 0, c.width, c.height)
      const d = im.data
      for (let i = 0; i < d.length; i += 4) {
        const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
        const v = Math.max(0, Math.min(255, Math.round(y)))
        d[i] = d[i + 1] = d[i + 2] = v
        d[i + 3] = 255
      }
      ctx.putImageData(im, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

export async function imageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}
