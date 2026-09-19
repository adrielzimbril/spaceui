'use client'

import * as React from 'react'
import { HeatShade, type HeatShadeFrom } from '@/registry/components/shader/heat-shade'

export interface HeatShadeDemoProps {
  base?: string
  hot?: string
  speed?: number
  from?: HeatShadeFrom
}

export default function Demo({ base = '#2a7bba', hot = '#43c8ff', speed = 1, from = 'bottom' }: HeatShadeDemoProps) {
  return (
    <div className="relative size-full min-h-96 h-[stretch] overflow-hidden bg-background">
      <HeatShade className="absolute inset-0" variant="licks" from={from} base={base} hot={hot} speed={speed} />
    </div>
  )
}
