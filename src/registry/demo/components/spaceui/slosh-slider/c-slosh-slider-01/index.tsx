'use client'

import * as React from 'react'
import { SloshSlider } from '@/registry/components/spaceui/slosh-slider'

export interface SloshSliderDemoProps {
  corner?: number
  viscosity?: number
  momentum?: number
  tilt?: number
}

export default function Demo({ corner = 13, viscosity = 15, momentum = 55, tilt = 45 }: SloshSliderDemoProps) {
  const [value, setValue] = React.useState(42)
  return (
    <div className="flex w-full max-w-md flex-col gap-3 px-6">
      <SloshSlider
        value={value}
        onValueChange={setValue}
        corner={Number(corner)}
        viscosity={Number(viscosity)}
        momentum={Number(momentum)}
        tilt={Number(tilt)}
      />
      <p className="text-center text-sm tabular-nums text-muted-foreground">{value}</p>
    </div>
  )
}
