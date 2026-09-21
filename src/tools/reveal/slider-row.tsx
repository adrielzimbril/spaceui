'use client'

import { TickSlider } from '@/registry/components/spaceui/tick-slider'

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const displayed = format ? format(value) : value % 1 === 0 ? value.toString() : value.toFixed(2)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[0.6875rem]">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{displayed}</span>
      </div>
      <TickSlider label={label} min={min} max={max} step={step} value={value} onChange={onChange} showValue={false} />
    </div>
  )
}
