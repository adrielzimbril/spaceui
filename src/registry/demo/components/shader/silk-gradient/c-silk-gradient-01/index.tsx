'use client'

import * as React from 'react'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'

export interface SilkGradientDemoProps {
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  animate?: boolean
  grain?: boolean
}

export default function Demo({
  color1 = '#4c9bff',
  color2 = '#1f4fd8',
  color3 = '#0a1a4a',
  speed = 1,
  animate = true,
  grain = true,
}: SilkGradientDemoProps) {
  return (
    <div className="relative size-full min-h-96 overflow-hidden bg-background">
      <SilkGradient
        className="absolute inset-0"
        color1={color1}
        color2={color2}
        color3={color3}
        speed={speed}
        animate={animate}
        grain={grain}
      />
    </div>
  )
}
