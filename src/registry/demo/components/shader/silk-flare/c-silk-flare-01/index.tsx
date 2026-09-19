'use client'

import * as React from 'react'
import { SilkFlare, type SilkFlareFrom } from '@/registry/components/shader/silk-flare'

export interface SilkFlareDemoProps {
  color1?: string
  color2?: string
  color3?: string
  hotColor?: string
  heatOpacity?: number
  from?: SilkFlareFrom
  speed?: number
  animate?: boolean
  grain?: boolean
}

export default function Demo({
  color1 = '#7c3aed',
  color2 = '#6366f1',
  color3 = '#a855f7',
  hotColor = '#38bdf8',
  heatOpacity = 0.5,
  from = 'bottom',
  speed = 0.8,
  animate = true,
  grain = true,
}: SilkFlareDemoProps) {
  return (
    <div className="relative size-full min-h-96 h-[stretch] overflow-hidden bg-background">
      <SilkFlare
        className="absolute inset-0"
        color1={color1}
        color2={color2}
        color3={color3}
        hotColor={hotColor}
        heatOpacity={heatOpacity}
        from={from}
        speed={speed}
        animate={animate}
        grain={grain}
      />
    </div>
  )
}
