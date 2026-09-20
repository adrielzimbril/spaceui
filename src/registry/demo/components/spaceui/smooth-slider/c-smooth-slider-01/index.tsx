'use client'

import * as React from 'react'
import { SmoothSlider } from '@/registry/components/spaceui/smooth-slider'

export interface SmoothSliderDemoProps {
  min?: number
  max?: number
  step?: number
  height?: number
  showTicks?: boolean
  fillFrom?: string
  fillVia?: string
  fillTo?: string
}

export default function Demo({
  min = 0,
  max = 100,
  step = 5,
  height = 32,
  showTicks = true,
  fillFrom = '#bae6fd',
  fillVia = '#e0e7ff',
  fillTo = '#60a5fa',
}: SmoothSliderDemoProps) {
  const [value, setValue] = React.useState(50)

  return (
    <div className="flex w-full flex-col items-center content-center justify-center gap-3">
      <SmoothSlider
        value={value}
        onValueChange={setValue}
        min={Number(min)}
        max={Number(max)}
        step={Number(step)}
        height={Number(height)}
        showTicks={Boolean(showTicks)}
        fillFrom={fillFrom}
        fillVia={fillVia}
        fillTo={fillTo}
        label="Volume"
      />
      <p className="text-center text-sm tabular-nums text-muted-foreground">{value}</p>
    </div>
  )
}
