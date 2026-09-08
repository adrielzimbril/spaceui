'use client'

import { Avatar } from '@usespaceui/avatars/react'
import { generatePalette } from '@usespaceui/gradients'
import { resolveVariant, type AvatarEffect, type AvatarVariant } from '@usespaceui/avatars'
import { ResourceGallery } from '@/tools/components/shared/layout/gallery'
import type { SelectedAvatar } from './types'

interface GalleryViewProps {
  pool: string[]
  pattern: AvatarVariant | 'all'
  effect: AvatarEffect
  animate: boolean
  circle: boolean
  parsedColors?: string[]
  paletteIndex: number
  onSelectAvatar: (avatar: SelectedAvatar) => void
  sidebarLeft?: boolean
  sidebarRight?: boolean
}

export function GalleryView({
  pool,
  pattern,
  effect,
  animate,
  circle,
  parsedColors,
  paletteIndex,
  onSelectAvatar,
  sidebarLeft = false,
  sidebarRight = false,
}: GalleryViewProps) {
  return (
    <ResourceGallery
      pool={pool}
      loop
      sidebarLeft={sidebarLeft}
      sidebarRight={sidebarRight}
      onSelect={(seed) => {
        const currentColors = paletteIndex === -2 ? generatePalette(seed).colors : parsedColors
        onSelectAvatar({
          seed,
          variant: pattern,
          colors: currentColors ? [...currentColors] : undefined,
        })
      }}
      renderMedia={(seed) => {
        const currentColors = paletteIndex === -2 ? generatePalette(seed).colors : parsedColors
        return (
          <Avatar
            name={seed}
            size={96}
            variant={pattern}
            colors={currentColors}
            animate={animate}
            effect={effect}
            circle={circle}
            className="flex size-full max-h-full max-w-full items-center justify-center [&_svg]:size-full"
          />
        )
      }}
      caption={(seed) =>
        pattern === 'all' ? resolveVariant(seed, 'all').replace(/-/g, ' ') : pattern.replace(/-/g, ' ')
      }
    />
  )
}
