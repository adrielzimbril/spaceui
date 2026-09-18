'use client'

import { SilkBorder, SILK_PRESETS, type SilkPreset } from '@/registry/components/spaceui/silk-border'
import { Avatar } from '@usespaceui/avatars/react'

const PRESETS = Object.keys(SILK_PRESETS) as SilkPreset[]

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      {PRESETS.map((preset) => (
        <SilkBorder key={preset} preset={preset} className="inline-flex size-16 rounded-full p-0.75">
          <Avatar name={preset} variant="all" size={56} circle animate />
        </SilkBorder>
      ))}
    </div>
  )
}
