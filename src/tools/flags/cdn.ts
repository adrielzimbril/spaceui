import type { FlagMode, FlagShape } from './types'

export const CDN_DOMAINS = ['https://cdn.spaceui.one', 'https://cdn.aurthle.one', 'https://cdn.aurthle.com'] as const

export const DEFAULT_CDN = CDN_DOMAINS[0]

export function resolveFlagPath(code: string, shape: FlagShape, mode: FlagMode = 'country'): string {
  const normalized = code.trim().toLowerCase()
  // Languages only have circle and square assets
  const resolvedShape = mode === 'language' && shape === '4x3' ? 'circle' : shape

  if (mode === 'language') {
    const langCode = normalized === 'cn' ? 'zh' : normalized
    return `/common/flags/language/${resolvedShape}/${langCode}.svg`
  }
  return `/common/flags/${resolvedShape}/${normalized}.svg`
}

export function resolveFlagUrl(
  code: string,
  shape: FlagShape,
  mode: FlagMode = 'country',
  base: string = DEFAULT_CDN,
): string {
  const path = resolveFlagPath(code, shape, mode)
  return `${base.replace(/\/+$/, '')}${path}`
}

export function getFlagAspectRatio(shape: FlagShape): { widthRatio: number; heightRatio: number; cssRatio: string } {
  if (shape === '4x3') {
    return { widthRatio: 4, heightRatio: 3, cssRatio: '4 / 3' }
  }
  return { widthRatio: 1, heightRatio: 1, cssRatio: '1 / 1' }
}

export function snippetFor(code: string, shape: FlagShape, mode: FlagMode, size: number, title?: string) {
  const url = resolveFlagUrl(code, shape, mode)
  const isRect = shape === '4x3'
  const width = isRect ? Math.round((size * 4) / 3) : size
  const height = size
  const alt = title ? `${title} flag` : `${code.toUpperCase()} flag`

  const react = `<img
  src="${url}"
  alt="${alt}"
  width={${width}}
  height={${height}}
  loading="lazy"
  className="${shape === 'circle' ? 'rounded-full' : 'rounded-sm'} object-cover shadow-xs"
/>`

  const html = `<img
  src="${url}"
  alt="${alt}"
  width="${width}"
  height="${height}"
  loading="lazy"
/>`

  return { react, html, url }
}
