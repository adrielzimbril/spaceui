'use client'

import * as React from 'react'
import { HeatShade } from '@/registry/components/shader/heat-shade'

export interface HeatShadeDemoProps {
  base?: string
  hot?: string
  speed?: number
}

export default function Demo({ base = '#304dff', hot = '#8298ff', speed = 1 }: HeatShadeDemoProps) {
  return (
    <div className="relative size-full min-h-96 overflow-hidden bg-background">
      <HeatShade className="absolute inset-0" base={base} hot={hot} speed={speed} />
    </div>
  )
}
