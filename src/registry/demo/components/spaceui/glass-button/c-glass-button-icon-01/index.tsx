'use client'

import { IconHeart, IconBookmark, IconShare2 } from '@tabler/icons-react'
import { GlassButton } from '@/registry/components/spaceui/glass-button'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'

export default function Demo() {
  return (
    <div className="relative squircle rounded-2xl bg-muted flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl p-16">
      <SilkGradient
        className="absolute inset-0 size-full"
        color1="#6a68ee"
        color2="#c9a6ff"
        color3="#ffb199"
        animate
        speed={1}
        grain
      />
      <GlassButton size="icon-lg" aria-label="Like">
        <IconHeart className="size-4.5" />
      </GlassButton>
      <GlassButton size="icon-lg" aria-label="Bookmark">
        <IconBookmark className="size-4.5" />
      </GlassButton>
      <GlassButton size="icon-lg" aria-label="Share">
        <IconShare2 className="size-4.5" />
      </GlassButton>
    </div>
  )
}
