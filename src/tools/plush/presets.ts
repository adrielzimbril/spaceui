import { imagelib } from '@/lib/imagelib'
import type { PlushConfig, PlushPreset } from './types'

export const DEFAULT_PRESET_ID = 'logo'

const SIDE_COLORS: Record<string, string> = {
  logo: '#ffffff',
  kendo: '#0e0e11',
  doddle: '#f8faf5',
  'space-avatar-nigo': '#ffffff',
  'space-avatar-janusz-kaminski': '#e93a2c',
  squiggle: '#f8faf5',
  squish: '#ffffff',
  invader: '#9cc4e4',
  spaceui: '#ffffff',
  'image-1': '#1e272e',
}

export const PLUSH_PRESETS: PlushPreset[] = imagelib.tools.plush.map((item) => ({
  id: item.id,
  label: item.name,
  preview: item.url,
  sideColor: SIDE_COLORS[item.id] ?? '#ffffff',
  description: item.description ?? item.name,
  defaultRoundness: 1.0,
  defaultCornerRadius: 0.35,
  defaultPuffiness: 1.0,
  defaultAutoColor: item.id !== 'squish',
}))

export const DEFAULT_PRESET = PLUSH_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ?? PLUSH_PRESETS[0]

export const DEFAULT_CONFIG: PlushConfig = {
  furSize: 1.62,
  furThickness: 1.5,
  furHighlight: 0.85,
  handSize: 1.4,
  pressure: 1,
  iconOpacity: 1,
  sideColor: DEFAULT_PRESET.sideColor,
  roundness: DEFAULT_PRESET.defaultRoundness ?? 1.0,
  cornerRadius: DEFAULT_PRESET.defaultCornerRadius ?? 0.35,
  puffiness: DEFAULT_PRESET.defaultPuffiness ?? 1.0,
  autoColor: DEFAULT_PRESET.defaultAutoColor ?? true,
}
