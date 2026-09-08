export type VideoAspect = '1:1' | '16:9' | '9:16' | '4:3'
export type VideoExportSize = 512 | 720 | 1080 | 1440 | 2160 | 4092

const MAX_EDGE = 4092

export function videoDims(aspect: VideoAspect, size: VideoExportSize) {
  let width = size
  let height = size
  if (aspect === '16:9') width = Math.round((size * 16) / 9)
  else if (aspect === '9:16') height = Math.round((size * 16) / 9)
  else if (aspect === '4:3') width = Math.round((size * 4) / 3)
  const edge = Math.max(width, height)
  if (edge > MAX_EDGE) {
    const scale = MAX_EDGE / edge
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  return { width, height }
}
