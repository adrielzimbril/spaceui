'use client'

import * as React from 'react'
import NumberFlow from '@number-flow/react'
import { TextMorph } from 'torph/react'
import { SloshSlider } from '@/registry/components/spaceui/slosh-slider'
import { IconClock } from '@tabler/icons-react'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Frame, FrameFooter } from '@/registry/primitives/frame'
import { POLAR_PRODUCTS } from '@/lib/pricing-config'
import type { PricingSnapshot } from '@/lib/pricing-tiers'
import { cn } from '@/registry/lib/utils'
import { BuyButton } from './buy-button'
import { SectionHeader } from './section-header'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'

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
    <SloshSlider
      height={24}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onChange}
      corner={8}
      viscosity={10}
      momentum={10}
      tilt={0}
      className="max-w-full"
    />
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

function SavingsCalculator({
  className,
  lifetimePrice,
  lifetimeDiscountId,
}: {
  className?: string
  lifetimePrice: number
  lifetimeDiscountId: string | null
}) {
  const [hours, setHours] = React.useState(160)
  const [rate, setRate] = React.useState(90)
  const scratch = hours * rate
  const savings = Math.max(0, scratch - lifetimePrice)
  const timeBack = React.useMemo(() => {
    if (hours < 40) {
      const n = hours / 8
      const shown = Number.isInteger(n) ? String(n) : n.toFixed(1)
      const unit = n === 1 ? 'day' : 'days'
      return { label: `${shown} ${unit} of your time back`, hint: 'Based on 8-hour workdays' }
    }
    const n = hours / 40
    const shown = Number.isInteger(n) ? String(n) : n.toFixed(1)
    const unit = n === 1 ? 'week' : 'weeks'
    return { label: `${shown} ${unit} of your time back`, hint: 'Based on a 40-hour workweek' }
  }, [hours])

  return (
    <div className={cn('mx-auto max-w-2xl space-y-4', className)}>
      <div className="relative overflow-hidden squircle rounded-3xl py-6 sm:py-8">
        <SilkGradient
          className="pointer-events-none absolute inset-0"
          color1="#6a68ee"
          color2="#c9a6ff"
          color3="#04106c"
          animate
          speed={2}
          grain
        />
        <div className="relative z-10 mx-auto max-w-xl p-4 py-8 sm:p-5 sm:py-8">
          <Frame className="rounded-3xl p-1.5">
            <Card className="flex flex-col gap-5 rounded-2xl bg-background p-5 before:rounded-2xl sm:p-6">
              <CardPanel className="overflow-hidden space-y-4 p-0">
                <StatusBadge
                  status="online"
                  size="lg"
                  primaryText="Estimated savings"
                  className="inline-flex select-none border-none"
                  secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
                >
                  Put the hours into the product
                  <AssetEmoji
                    codepoint="⏳"
                    source={EmojiSource.Telegram}
                    type={EmojiType.Anim}
                    size={22}
                    lazy={false}
                  />
                </StatusBadge>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <NumberFlow
                      value={savings}
                      format={currencyFormat}
                      className="isolate font-semibold text-5xl leading-none tracking-tight text-foreground tabular-nums sm:text-6xl"
                    />
                    <div className="flex flex-col items-end">
                      <span className="text-3xl md:text-4xl pt-3 font-semibold text-muted-foreground/60 line-through tabular-nums">
                        {new Intl.NumberFormat('en-US', currencyFormat).format(scratch)}
                      </span>
                    </div>
                  </div>{' '}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-md text-muted-foreground/90">
                      Saved with the ${lifetimePrice} one-time purchase.
                    </span>
                  </div>
                </div>
                <div className="space-y-3 border-t border-border/70 pt-4">
                  <Row
                    label="Hours this would take"
                    valueLabel={`${hours} hours`}
                    value={hours}
                    min={8}
                    max={400}
                    step={8}
                    onChange={setHours}
                  />
                  <Row
                    label="Blended hourly rate"
                    valueLabel={`$${rate}/hr`}
                    value={rate}
                    min={40}
                    max={300}
                    step={10}
                    onChange={setRate}
                  />
                  <p className="text-sm text-muted-foreground">
                    Estimated build cost:{' '}
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
                      <span className="text-sm font-medium text-foreground">
                        <TextMorph>{timeBack.label}</TextMorph>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <TextMorph>{timeBack.hint}</TextMorph>
                      </span>
                    </div>
                  </div>
                </div>
              </CardPanel>
            </Card>
            <FrameFooter className="p-2">
              <BuyButton
                productId={POLAR_PRODUCTS.allAccessLifetime}
                discountId={lifetimeDiscountId}
                label="Get lifetime access"
                variant="primary"
                full
                size="lg"
                border="violet"
              />
            </FrameFooter>
          </Frame>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Estimates build time only. Real savings depend on your workflow and how you ship.
      </p>
    </div>
  )
}

export function SavingsSection({ pricing }: { pricing: PricingSnapshot }) {
  return (
    <section id="savings" data-page-section className="mx-auto max-w-6xl scroll-mt-16 px-5 sm:px-6 py-16">
      <SectionHeader
        badge="Savings calculator"
        title="What is your time worth?"
        description="Tell us how long this would take to build and what an hour costs. We’ll do the math."
      />
      <div className="relative">
        <SavingsCalculator lifetimePrice={pricing.lifetimePrice} lifetimeDiscountId={pricing.lifetimeDiscountId} />
      </div>
    </section>
  )
}
