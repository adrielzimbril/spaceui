'use client'

import * as React from 'react'
import NumberFlow from '@number-flow/react'
import { TextMorph } from 'torph/react'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { IconClock } from '@tabler/icons-react'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Frame, FrameFooter } from '@/registry/primitives/frame'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'
import { LIFETIME_PRICE } from '@/lib/pricing-config'
import { cn } from '@/registry/lib/utils'
import Link from 'next/link'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'

const currencyFormat = {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
} as const

function EstimateSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <SliderPrimitive.Root
      className="w-full"
      min={min}
      max={max}
      step={step}
      value={value}
      thumbAlignment="edge"
      onValueChange={(next) => onChange(Array.isArray(next) ? (next[0] ?? value) : next)}
    >
      <SliderPrimitive.Control className="flex h-8 w-full touch-none select-none items-center">
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="absolute inset-y-0 start-0 rounded-full bg-foreground/15" />
          <SliderPrimitive.Thumb
            index={0}
            className="block h-5 w-1.5 shrink-0 rounded-full bg-foreground shadow-none outline-none ring-0"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

function Row({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  valueLabel: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{valueLabel}</span>
      </div>
      <EstimateSlider value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  )
}

export function SavingsCalculator({ className }: { className?: string }) {
  const [hours, setHours] = React.useState(120)
  const [rate, setRate] = React.useState(100)
  const scratch = hours * rate
  const savings = Math.max(0, scratch - LIFETIME_PRICE)
  const weeksLabel = `${(hours / 40).toFixed(1)} workweeks recovered`

  return (
    <div className={cn('mx-auto max-w-2xl space-y-4', className)}>
      <div className="relative overflow-hidden squircle rounded-3xl py-6 sm:py-8">
        <SilkGradient
          className="pointer-events-none absolute inset-0"
          color1="#4c9bff"
          color2="#1f4fd8"
          color3="#0a1a4a"
          animate
          grain
        />
        <div className="relative z-10 mx-auto max-w-xl p-4 py-8 sm:p-5 sm:py-8">
          <Frame className="rounded-3xl p-1.5">
            <Card className="flex flex-col gap-5 rounded-2xl bg-background p-5 before:rounded-2xl sm:p-6">
              <CardPanel className="space-y-4 p-0">
                <StatusBadge
                  status="online"
                  size="lg"
                  primaryText="Estimated savings"
                  className="inline-flex select-none border-none"
                  secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
                >
                  Take your time on your product
                  <AssetEmoji
                    codepoint="⏳"
                    source={EmojiSource.Telegram}
                    type={EmojiType.Anim}
                    size={22}
                    lazy={false}
                  />
                </StatusBadge>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through tabular-nums">
                      {new Intl.NumberFormat('en-US', currencyFormat).format(scratch)}
                    </span>
                    <Badge size="sm" variant="success">
                      ${LIFETIME_PRICE}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <NumberFlow
                      value={savings}
                      format={currencyFormat}
                      className="font-semibold text-5xl leading-none tracking-tight text-foreground tabular-nums sm:text-6xl"
                    />
                    <span className="pb-0.5 text-md leading-tight text-muted-foreground/80">
                      Saved with
                      <span className="block">lifetime</span>
                    </span>
                  </div>
                </div>
                <div className="space-y-3 border-t border-border/70 pt-4">
                  <Row
                    label="Hours to build it"
                    valueLabel={`${hours} hours`}
                    value={hours}
                    min={8}
                    max={400}
                    step={8}
                    onChange={setHours}
                  />
                  <Row
                    label="What an hour of time costs"
                    valueLabel={`$${rate}/hr`}
                    value={rate}
                    min={40}
                    max={300}
                    step={10}
                    onChange={setRate}
                  />
                  <p className="text-sm text-muted-foreground">
                    Building from scratch:{' '}
                    <span className="font-medium text-foreground tabular-nums">
                      {new Intl.NumberFormat('en-US', currencyFormat).format(scratch)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6 border-t border-border/70 pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge size="xs" square>
                      <IconClock className="size-5" stroke={2.5} />
                    </Badge>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{weeksLabel}</span>
                      <span className="text-xs text-muted-foreground">Based on a 40-hour workweek</span>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-sm text-foreground">
                    Start from finished source.
                    <span className="mt-0.5 block text-muted-foreground">Customize it and ship.</span>
                  </p>
                </div>
              </CardPanel>
            </Card>
            <FrameFooter className="p-2">
              <LiquidBorder className="flex w-full squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
                <Button variant="primary" variant="lg" full asPointer render={<Link href="#plans" />}>
                  Get lifetime access
                </Button>
              </LiquidBorder>
            </FrameFooter>
          </Frame>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Calculator estimates the value of build time only. Your actual cost and time saved depend on your team and
        implementation.
      </p>
    </div>
  )
}
