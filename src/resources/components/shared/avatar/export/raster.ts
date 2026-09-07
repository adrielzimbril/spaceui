function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = name
  link.href = url
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function svgMarkup(svg: SVGSVGElement | string) {
  let source = typeof svg === 'string' ? svg : new XMLSerializer().serializeToString(svg)
  if (!source.includes('xmlns=')) source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  return source
}

function viewBoxOf(source: string) {
  return source.match(/viewBox="([^"]+)"/i)?.[1] ?? null
}

function svgForRaster(svg: SVGSVGElement | string, size: number) {
  const inner = svgMarkup(svg)
  const viewBox = viewBoxOf(inner) ?? `0 0 ${size} ${size}`
  const content = inner.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${content}</svg>`
}

async function imageFor(svg: SVGSVGElement | string, size: number, reuse?: HTMLImageElement) {
  const image = reuse ?? new Image()
  image.crossOrigin = 'anonymous'
  const url = URL.createObjectURL(new Blob([svgForRaster(svg, size)], { type: 'image/svg+xml;charset=utf-8' }))
  const previous = image.dataset.blobUrl
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('SVG could not be rasterized'))
    image.src = url
  })
  if (previous) URL.revokeObjectURL(previous)
  image.dataset.blobUrl = url
  return image
}

export async function exportRaster(
  svg: SVGSVGElement | string | null,
  fileName: string,
  format: 'png' | 'webp' = 'png',
  size = 1000,
  width?: number,
  height?: number,
  background = 'transparent',
) {
  if (!svg) return
  const w = width ?? size
  const h = height ?? size
  const side = Math.min(w, h)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d')!
  if (background !== 'transparent') {
    context.fillStyle = background
    context.fillRect(0, 0, w, h)
  }
  context.drawImage(await imageFor(svg, side), (w - side) / 2, (h - side) / 2, side, side)
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not encode image'))
        return
      }
      save(blob, `${fileName}.${format}`)
      resolve()
    }, `image/${format}`)
  })
}

export async function exportSvgMarkup(
  svg: SVGSVGElement | string,
  fileName: string,
  background = 'transparent',
  width?: number,
  height?: number,
) {
  const inner = svgMarkup(svg)
  const w = width ?? 1000
  const h = height ?? 1000
  const side = Math.min(w, h)
  const ox = (w - side) / 2
  const oy = (h - side) / 2
  const viewBox = viewBoxOf(inner) ?? `0 0 ${side} ${side}`
  const content = inner.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '')
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${
    background !== 'transparent' ? `<rect width="${w}" height="${h}" fill="${background}"/>` : ''
  }<svg x="${ox}" y="${oy}" width="${side}" height="${side}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${content}</svg></svg>`
  save(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }), `${fileName}.svg`)
}

export { save, imageFor }
