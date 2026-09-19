'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  IconBlocks,
  IconBook2,
  IconBrain,
  IconBrandTailwind,
  IconCalendarBolt,
  IconCheck,
  IconClockHour4,
  IconCode,
  IconComponents,
  IconContrast,
  IconCpu,
  IconDeviceLaptop,
  IconFileCheck,
  IconFileText,
  IconHeadset,
  IconInfinity,
  IconInfoCircle,
  IconLayersUnion,
  IconLock,
  IconPlugConnected,
  IconRefresh,
  IconRobot,
  IconSparkles,
  IconStarsFilled,
  IconTerminal2,
  IconTrendingUp,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { Badge, type BadgeProps } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { AnimatedStat } from './animated-stat'
import { BuyButton } from './buy-button'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Frame, FrameFooter } from '@/registry/primitives/frame'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { SilkFlare } from '@/registry/components/shader/silk-flare'
import { siteConfig } from '@/config/space-config'
import { POLAR_PRODUCTS, REGISTRY_STATS } from '@/lib/pricing-config'
import type { PricingSnapshot } from '@/lib/pricing-tiers'
import { cn } from '@/registry/lib/utils'
import { SectionHeader } from './section-header'
import { sleep } from '@/registry/utils/sleep'

type PlanFeature = {
  icon: Icon
  text: string
  badge?: string
  badgeVariant?: BadgeProps['variant']
  badgeIcon?: Icon
  badgeClassName?: string
}

function buildPlans(pricing: PricingSnapshot) {
  return [
    {
      key: 'free',
      name: 'Community',
      tag: 'COMMUNITY',
      description: 'Everything you need to start shipping with Space UI, free forever.',
      price: 0,
      priceSuffix: '/ forever',
      strikethrough: null,
      chip: null as string | null,
      silk: {
        color1: '#94a3b8',
        color2: '#cbd5e1',
        color3: '#64748b',
        fallback:
          'from-slate-400/40 via-slate-300/25 to-slate-500/15 dark:from-slate-400/85 dark:via-slate-300/70 dark:to-slate-500/55',
        background:
          'data-[shade=ready]:from-slate-400/25 data-[shade=ready]:via-slate-300/15 data-[shade=ready]:to-transparent data-[shade=ready]:opacity-45',
        opacity: 'opacity-65 dark:opacity-100',
      },
      features: [
        {
          icon: IconComponents,
          text: `${REGISTRY_STATS.primitivesFree}+ free primitives & components`,
        },
        {
          icon: IconFileCheck,
          text: `${REGISTRY_STATS.examples}+ component examples`,
          badge: 'Expanding',
          badgeVariant: 'info',
          badgeIcon: IconTrendingUp,
        },
        { icon: IconContrast, text: 'Light & dark theme support' },
        { icon: IconBrandTailwind, text: 'Tailwind CSS & Motion support' },
        { icon: IconCode, text: 'Clean, developer-friendly code' },
        { icon: IconBook2, text: 'Complete documentation & usage examples' },
        { icon: IconTerminal2, text: 'Standard CLI installer' },
        { icon: IconUsers, text: 'Community Wall access' },
      ] as PlanFeature[],
      recommended: false,
      cta: (
        <Button
          variant="outline"
          full
          size="lg"
          hover
          whileTap
          asPointer
          render={<Link href="/components" />}
          className="bg-background!"
        >
          Browse components
        </Button>
      ),
    },
    {
      key: 'pro',
      name: 'Pro Yearly',
      tag: 'PRO',
      badgeLabel: 'Best value',
      description: 'Every Pro component, block, and shader — new drops every week.',
      price: pricing.proYearlyPrice,
      priceSuffix: '/ year',
      strikethrough: pricing.proYearlyNextPrice ? `$${pricing.proYearlyNextPrice}` : null,
      chip: null as string | null,
      silk: {
        color1: '#ff6b4a',
        color2: '#ffa07a',
        color3: '#ff4071',
        fallback:
          'from-rose-500/40 via-amber-500/25 to-rose-600/15 dark:from-rose-500/85 dark:via-amber-500/70 dark:to-rose-600/55',
        background:
          'data-[shade=ready]:from-rose-500/25 data-[shade=ready]:via-amber-500/15 data-[shade=ready]:to-transparent data-[shade=ready]:opacity-45',
        opacity: 'opacity-60 dark:opacity-100',
      },
      features: [
        { icon: IconLayersUnion, text: 'Everything in Community' },
        {
          icon: IconSparkles,
          text: 'All Pro components & shader effects',
          badge: 'New',
          badgeVariant: 'success',
          badgeIcon: IconStarsFilled,
        },
        { icon: IconBlocks, text: `All Pro blocks & micro-interactions` },
        { icon: IconDeviceLaptop, text: 'Access to all premium templates' },
        { icon: IconCalendarBolt, text: 'New drops every week' },
        {
          icon: IconRobot,
          text: 'AI Agent Skills for UI engineering',
          badge: 'Skills AI',
          badgeVariant: 'accent',
          badgeIcon: IconBrain,
        },
        {
          icon: IconCpu,
          text: 'Plug straight into Claude Code, Cursor & VS Code',
          badge: 'MCP',
          badgeVariant: 'warning',
          badgeIcon: IconPlugConnected,
          badgeClassName: 'bg-violet-100! text-violet-600!',
        },
        {
          icon: IconFileText,
          text: 'AI context files & llms-full.txt per component',
          badge: '.md',
          badgeVariant: 'secondary',
          badgeIcon: IconFileCheck,
        },
        { icon: IconInfinity, text: 'Unlimited personal & commercial projects' },
        {
          icon: IconHeadset,
          text: 'Priority support on Discord & email',
          badge: '24/7',
          badgeVariant: 'warning',
          badgeIcon: IconClockHour4,
        },
      ] as PlanFeature[],
      recommended: true,
      cta: (
        <BuyButton
          productId={POLAR_PRODUCTS.proYearly}
          discountId={pricing.proYearlyDiscountId}
          label="Get instant access"
          variant="primary"
          full
          size="lg"
          border
        />
      ),
    },
    {
      key: 'lifetime',
      name: 'Lifetime',
      tag: 'LIFETIME',
      description: 'Pay once. Every Pro feature, forever — no renewal.',
      price: pricing.lifetimePrice,
      priceSuffix: '/ once',
      strikethrough: null,
      chip: 'Team license · 3 developers',
      silk: {
        color1: '#7c3aed',
        color2: '#6366f1',
        color3: '#a855f7',
        fallback:
          'from-violet-600/40 via-indigo-500/25 to-purple-500/15 dark:from-violet-600/85 dark:via-indigo-500/70 dark:to-purple-500/55',
        background:
          'data-[shade=ready]:from-violet-500/25 data-[shade=ready]:via-indigo-500/15 data-[shade=ready]:to-transparent data-[shade=ready]:opacity-45',
        opacity: 'opacity-60 dark:opacity-100',
      },
      features: [
        { icon: IconInfinity, text: 'Everything in Pro, forever' },
        { icon: IconRefresh, text: 'All future updates & new drops included' },
        { icon: IconDeviceLaptop, text: 'All premium templates, current & future' },
        { icon: IconRobot, text: 'Full AI agent toolkit — Skills, MCP, context files' },
        {
          icon: IconHeadset,
          text: 'Priority support on Discord & email',
          badge: '24/7',
          badgeVariant: 'warning',
          badgeIcon: IconClockHour4,
        },
        {
          icon: IconLock,
          text: 'No renewal — pay once, access forever',
          badge: 'Forever',
          badgeVariant: 'info',
          badgeIcon: IconInfinity,
        },
      ] as PlanFeature[],
      recommended: false,
      cta: (
        <BuyButton
          productId={POLAR_PRODUCTS.allAccessLifetime}
          discountId={pricing.lifetimeDiscountId}
          label="Get lifetime access"
          variant="primary"
          full
          size="lg"
          border="violet"
        />
      ),
    },
  ]
}

const stats = [
  { label: 'Base Primitives', value: REGISTRY_STATS.primitives },
  { label: 'Pro Components', value: REGISTRY_STATS.proComponents },
  { label: 'Templates', value: REGISTRY_STATS.templatesTotal },
  { label: 'Block Collections', value: REGISTRY_STATS.blockCollections },
  { label: 'Demos & Examples', value: REGISTRY_STATS.examples },
]

export function PlansSection({ pricing }: { pricing: PricingSnapshot }) {
  const [isShaderReady, setIsShaderReady] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const plans = React.useMemo(() => buildPlans(pricing), [pricing])
  const spotsLeft =
    pricing.proYearlyMilestoneTarget != null
      ? Math.max(0, pricing.proYearlyMilestoneTarget - pricing.proYearlyMilestoneCurrent)
      : null
  const silkColorOpacity = mounted && resolvedTheme === 'dark' ? 1 : 0.2

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    sleep(1800).then(() => setIsShaderReady(true))
  }, [])

  return (
    <section
      id="plans"
      data-page-section
      className="mt-24c md:mt-34c mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-6 py-10"
    >
      <SectionHeader
        badge={
          spotsLeft != null ? (
            <span className="inline-flex items-center gap-1">
              <span>{spotsLeft}</span>
              <span>spots left at this price</span>
            </span>
          ) : (
            'Final price now active'
          )
        }
        badgeVariant="info"
        title="Claim your price before it climbs"
        description="Get unlimited access to the entire library, shaders, and AI skills. Stop rebuilding UI from scratch and ship what actually matters."
      />
      <div className="relative grid grid-cols-1 items-stretch gap-2 md:grid-cols-3 lg:gap-4">
        {plans.map((plan) => (
          <Frame
            key={plan.key}
            className={cn(
              'flex h-full flex-col squircle rounded-3xl p-1.5 transition-all duration-300',
              plan.recommended && 'bg-primary/10',
            )}
          >
            <Card className="relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl bg-background p-4 sm:p-5 before:rounded-7xl">
              <div
                data-shade={isShaderReady ? 'ready' : 'fallback'}
                className="relative flex min-h-40 flex-col justify-between gap-6 overflow-hidden squircle rounded-3xl p-4 sm:p-5 bg-muted"
              >
                {plan.silk && (
                  <>
                    <div
                      data-shade={isShaderReady ? 'ready' : 'fallback'}
                      className={cn(
                        'pointer-events-none absolute inset-0 bg-linear-to-b transition-all duration-300',
                        plan.silk.fallback,
                        plan.silk.background,
                      )}
                    />
                    <div className="pointer-events-none absolute inset-0 transition-opacity">
                      <SilkFlare
                        className="size-full"
                        color1={plan.silk.color1}
                        color2={plan.silk.color2}
                        color3={plan.silk.color3}
                        heatBaseColor={plan.silk.color1}
                        color1Opacity={silkColorOpacity}
                        color2Opacity={silkColorOpacity}
                        color3Opacity={silkColorOpacity}
                        hotColor={plan.silk.color3}
                        from="bottom"
                        speed={0.75}
                        animate
                        // grain={false}
                        dpr={1}
                      />
                    </div>
                  </>
                )}

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <Badge size="xs" variant="outline" className="select-none rounded-full bg-background!   uppercase">
                    {plan.tag}
                  </Badge>

                  {plan.badgeLabel &&
                    (plan.recommended ? (
                      <LiquidBorder className="inline-flex squircle rounded-full p-0.75 shadow-xs">
                        <Badge size="xs" variant="primary" className="select-none bg-primary!">
                          {plan.badgeLabel}
                        </Badge>
                      </LiquidBorder>
                    ) : (
                      <Badge size="xs" variant="secondary" className="bg-muted!">
                        {plan.badgeLabel}
                      </Badge>
                    ))}
                </div>

                <div className="relative z-10 flex items-baseline gap-1 pt-1">
                  {plan.price === 0 ? (
                    <span className="font-semibold text-4xl sm:text-5xl text-white tracking-tight">Free</span>
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl font-semibold text-white/90 self-start mt-0.5">$</span>
                      <span className="font-semibold text-4xl sm:text-5xl text-white tracking-tight">{plan.price}</span>
                      <span className="text-white/90 text-xs sm:text-sm ml-1 font-normal">{plan.priceSuffix}</span>
                      {plan.strikethrough && (
                        <span className="text-white/80 line-through text-xs sm:text-sm ml-1.5 font-normal">
                          {plan.strikethrough}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1 px-1">
                <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">{plan.description}</p>

                <CardPanel className="space-y-4 p-0">
                  <ul className="space-y-2.5 text-foreground/90 text-xs sm:text-sm pt-2 border-t border-border/90">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-muted-foreground">
                        <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <span className="flex-1">{feature.text}</span>
                        {feature.badge && (
                          <Badge
                            size="xs"
                            variant={feature.badgeVariant ?? 'secondary'}
                            className={cn('shrink-0 text-[10px]', feature.badgeClassName)}
                          >
                            {feature.badge}
                            {feature.badgeIcon && <feature.badgeIcon className="size-3" stroke={2} />}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardPanel>
              </div>
            </Card>
            <FrameFooter className="p-2">{plan.cta}</FrameFooter>
          </Frame>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl bg-muted px-4 py-3.5">
        <Badge size="xs" square className="bg-background shrink-0">
          <IconInfoCircle className="size-4" stroke={1.75} />
        </Badge>
        <p className="text-sm text-foreground">
          Students, or if list price is steep where you live — we can work something out.
          <span className="mt-0.5 block text-muted-foreground">
            Send a student ID, license, or similar proof to{' '}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {siteConfig.email}
            </a>
          </span>
        </p>
      </div>
    </section>
  )
}
