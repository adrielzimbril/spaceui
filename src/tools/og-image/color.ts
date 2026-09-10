/**
 * Color utilities for Space UI OG Image Generator
 * Supports rgb(r, g, b), rgba(r, g, b, a), and hex strings interchangeably.
 */

/**
 * Converts any CSS color (hex, rgb, rgba) to a 6-digit hex string (#rrggbb)
 * for use in HTML5 <input type="color">
 */
export function colorToHex(color: string): string {
  if (!color || typeof color !== 'string') return '#000000'
  const trimmed = color.trim()

  // Hex format
  if (trimmed.startsWith('#')) {
    const raw = trimmed.replace('#', '')
    if (raw.length === 3) {
      return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase()
    }
    if (raw.length >= 6) {
      return `#${raw.slice(0, 6)}`.toLowerCase()
    }
  }

  // rgb(...) or rgba(...) format
  const rgbMatch = trimmed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)))
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)))
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toLowerCase()
  }

  return '#000000'
}

/**
 * Converts a hex string (#rrggbb or #rgb) to an rgb(r, g, b) string
 */
export function hexToRgbString(hex: string): string {
  if (!hex || typeof hex !== 'string') return 'rgb(0, 0, 0)'
  const clean = hex.trim().replace('#', '')
  let r = 0
  let g = 0
  let b = 0

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  }

  return `rgb(${isNaN(r) ? 0 : r}, ${isNaN(g) ? 0 : g}, ${isNaN(b) ? 0 : b})`
}

/**
 * Parses any color (hex, rgb, rgba) into normalized [0..1, 0..1, 0..1]
 * for WebGL shader uniforms.
 */
export function parseColorToRgb(color: string): [number, number, number] {
  if (!color || typeof color !== 'string') return [0, 0, 0]
  const trimmed = color.trim()

  // Match rgb / rgba
  const rgbMatch = trimmed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))) / 255
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))) / 255
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))) / 255
    return [r, g, b]
  }

  // Hex format
  const clean = trimmed.replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255
    const g = parseInt(clean[1] + clean[1], 16) / 255
    const b = parseInt(clean[2] + clean[2], 16) / 255
    return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b]
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.slice(0, 2), 16) / 255
    const g = parseInt(clean.slice(2, 4), 16) / 255
    const b = parseInt(clean.slice(4, 6), 16) / 255
    return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b]
  }

  return [0, 0, 0]
}
