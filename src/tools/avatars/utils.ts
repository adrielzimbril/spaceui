import { AvatarVariant, getAvatarDetails, type AvatarDetails } from '@usespaceui/avatars'
import { PRESET_PALETTES } from '@usespaceui/gradients'

export function resolvePaletteColors(paletteIndex: number, customColors: string[]): string[] | undefined {
  if (paletteIndex === -2) return undefined
  if (paletteIndex >= 0 && paletteIndex < PRESET_PALETTES.length) {
    return [...PRESET_PALETTES[paletteIndex].colors]
  }
  return customColors.length === 5 ? [...customColors] : undefined
}

export function getSelectedAvatarDetails(pattern: AvatarVariant | 'all'): AvatarDetails {
  return getAvatarDetails(pattern === 'all' ? AvatarVariant.triton : pattern) ?? getAvatarDetails(AvatarVariant.triton)!
}

export { getRandomPersonas, shufflePersonas, toLabel } from '@/tools/shared/utils'
export type { ResourceViewMode as AvatarViewMode } from '@/tools/shared/types'
