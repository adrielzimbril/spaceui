'use client'

import * as React from 'react'
import NumberFlow from '@number-flow/react'
import { Minus, PiggyBank, Plus, Sparkles } from 'lucide-react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/registry/primitives/card'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/registry/primitives/tabs'
import { cn } from '@/registry/lib/utils'
import { PRO_YEARLY_PRICE, LIFETIME_PRICE, AVERAGE_ITEM_PRICE } from '@/lib/pricing-config'

const currencyFormat = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } as const

function Stepper({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  suffix: string
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <Button
        variant="outline"
        size="icon-sm"
        asPointer
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </Button>
      <div className="flex min-w-20 flex-col items-center">
        <NumberFlow value={value} className="font-bold text-3xl text-foreground tabular-nums" />
        <span className="text-muted-foreground text-xs">{suffix}</span>
      </div>
      <Button
        variant="outline"
        size="icon-sm"
        asPointer
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

function PriceStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-muted-foreground text-xs">{label}</span>
      <NumberFlow
        value={value}
        format={currencyFormat}
        className={cn('font-bold text-2xl tabular-nums', highlight ? 'text-primary' : 'text-foreground')}
      />
    </div>
  )
}

export function PricingCalculator() {
  const [years, setYears] = React.useState(2)
  const [items, setItems] = React.useState(4)

  const yearlyCost = years * PRO_YEARLY_PRICE
  const lifetimeSavings = yearlyCost - LIFETIME_PRICE
  const breakEvenYear = Math.ceil(LIFETIME_PRICE / PRO_YEARLY_PRICE)

  const individualCost = items * AVERAGE_ITEM_PRICE
  const subscriptionSavings = individualCost - PRO_YEARLY_PRICE

  return (
    <Tabs defaultValue="breakeven" className="w-full items-center gap-8">
      <TabsList>
        <TabsTab value="breakeven">Yearly vs Lifetime</TabsTab>
        <TabsTab value="components">Templates & components</TabsTab>
      </TabsList>

      <TabsPanel value="breakeven" className="w-full">
        <Card className="squircle mx-auto max-w-2xl gap-6 rounded-3xl bg-card/60 p-6 sm:p-8">
          <CardHeader className="items-center p-0 text-center">
            <CardTitle>How long will you use Space UI?</CardTitle>
            <CardDescription>See when Lifetime access starts paying off compared to renewing yearly.</CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col items-center gap-8 p-0">
            <Stepper value={years} onChange={setYears} min={1} max={10} suffix={years === 1 ? 'year' : 'years'} />
            <div className="grid w-full grid-cols-2 gap-4 sm:gap-8">
              <PriceStat label={`Pro Yearly × ${years}`} value={yearlyCost} />
              <PriceStat label="Lifetime (once)" value={LIFETIME_PRICE} highlight />
            </div>
            {lifetimeSavings > 0 ? (
              <Badge variant="primary" className="px-3 py-1.5">
                <Sparkles className="size-3.5" />
                <span>
                  Lifetime saves you {new Intl.NumberFormat('en-US', currencyFormat).format(lifetimeSavings)} over{' '}
                  {years} {years === 1 ? 'year' : 'years'}
                </span>
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1.5">
                Break-even happens at year {breakEvenYear}
              </Badge>
            )}
          </CardPanel>
        </Card>
      </TabsPanel>

      <TabsPanel value="components" className="w-full">
        <Card className="squircle mx-auto max-w-2xl gap-6 rounded-3xl bg-card/60 p-6 sm:p-8">
          <CardHeader className="items-center p-0 text-center">
            <CardTitle>How many templates do you need?</CardTitle>
            <CardDescription>
              Compare buying templates individually against a Pro subscription (avg.{' '}
              {new Intl.NumberFormat('en-US', currencyFormat).format(AVERAGE_ITEM_PRICE)} each).
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col items-center gap-8 p-0">
            <Stepper
              value={items}
              onChange={setItems}
              min={1}
              max={20}
              suffix={items === 1 ? 'template' : 'templates'}
            />
            <div className="grid w-full grid-cols-2 gap-4 sm:gap-8">
              <PriceStat label="Buying individually" value={individualCost} />
              <PriceStat label="Pro Yearly (unlimited)" value={PRO_YEARLY_PRICE} highlight />
            </div>
            {subscriptionSavings > 0 ? (
              <Badge variant="primary" className="px-3 py-1.5">
                <PiggyBank className="size-3.5" />
                <span>
                  Subscribing saves you {new Intl.NumberFormat('en-US', currencyFormat).format(subscriptionSavings)}
                </span>
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1.5">
                Buying individually is cheaper at this quantity
              </Badge>
            )}
          </CardPanel>
        </Card>
      </TabsPanel>
    </Tabs>
  )
}
