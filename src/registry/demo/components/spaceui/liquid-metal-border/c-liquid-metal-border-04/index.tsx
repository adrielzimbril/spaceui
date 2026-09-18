'use client'

import { LiquidBorder, LIQUID_PRESETS, type LiquidPreset } from '@/registry/components/spaceui/liquid-metal-border'
import { Avatar } from '@usespaceui/avatars/react'

const PRESETS = Object.keys(LIQUID_PRESETS) as LiquidPreset[]

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      {PRESETS.map((preset) => (
        <LiquidBorder key={preset} preset={preset} className="inline-flex size-16 rounded-full p-0.75">
          <Avatar name={preset} variant="all" size={56} circle animate />
        </LiquidBorder>
      ))}
    </div>
  )
}
