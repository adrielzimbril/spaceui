'use client'

import { IconDownload } from '@tabler/icons-react'
import { GlassButton } from '@/registry/components/spaceui/glass-button'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'

export default function Demo() {
  return (
    <div className="relative squircle rounded-2xl bg-muted flex w-full items-center justify-center overflow-hidden rounded-2xl p-16">
      <SilkGradient
        className="absolute inset-0 size-full"
        color1="#0ea5e9"
        color2="#22d3ee"
        color3="#a3e635"
        animate
        speed={1}
        grain
      />
      <GlassButton size="lg">
        <IconDownload className="size-4.5" />
        Download for iOS
      </GlassButton>
    </div>
  )
}
