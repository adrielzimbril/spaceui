'use client'

import * as React from 'react'
import { SilkFlare, type SilkFlareFrom } from '@/registry/components/shader/silk-flare'

export interface SilkFlareDemoProps {
  color1?: string
  color1Opacity?: number
  color2?: string
  color2Opacity?: number
  color3?: string
  color3Opacity?: number
  heatBaseColor?: string
  heatBaseColorOpacity?: number
  hotColor?: string
  heatOpacity?: number
  from?: SilkFlareFrom
  speed?: number
  animate?: boolean
  grain?: boolean
}

export default function Demo({
  color1 = '#6a68ee',
  color1Opacity = 0.3,
  color2 = '#c9a6ff',
  color2Opacity = 0.3,
  color3 = '#04106c',
  color3Opacity = 0.3,
  heatBaseColor = '#6a68ee',
  heatBaseColorOpacity = 0.5,
  hotColor = '#04106c',
  heatOpacity = 0.5,
  from = 'bottom',
  speed = 1,
  animate = true,
  grain = true,
}: SilkFlareDemoProps) {
  return (
    <div className="relative size-full min-h-96 h-[stretch] overflow-hidden bg-background">
      <SilkFlare
        className="absolute inset-0"
        color1={color1}
        color1Opacity={color1Opacity}
        color2={color2}
        color2Opacity={color2Opacity}
        color3={color3}
        color3Opacity={color3Opacity}
        heatBaseColor={heatBaseColor}
        heatBaseColorOpacity={heatBaseColorOpacity}
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
