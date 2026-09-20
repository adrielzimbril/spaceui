'use client'

import * as React from 'react'
import { TickSlider } from '@/registry/components/spaceui/tick-slider'

export interface TickSliderDemoProps {
  min?: number
  max?: number
  step?: number
  majorEvery?: number
  unit?: string
  showValue?: boolean
  fixedPitch?: boolean
}

export default function Demo({
  min = 16,
  max = 48,
  step = 1,
  majorEvery = 8,
  unit = 'px',
  showValue = true,
  fixedPitch = true,
}: TickSliderDemoProps) {
  const [value, setValue] = React.useState(24)
  return (
    <div className="flex w-full items-center px-6">
      <TickSlider
        value={value}
        onChange={setValue}
        min={Number(min)}
        max={Number(max)}
        step={Number(step)}
        majorEvery={Number(majorEvery)}
        unit={unit}
        showValue={Boolean(showValue)}
        fixedPitch={Boolean(fixedPitch)}
        label="Font size"
      />
    </div>
  )
}
