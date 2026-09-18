import type { Metadata } from 'next'
import Link from 'next/link'
import {
  IconApi,
  IconArrowRight,
  IconBlocks,
  IconBook2,
  IconBrain,
  IconBrandTailwind,
  IconCalendarBolt,
  IconClockHour4,
  IconCode,
  IconComponents,
  IconContrast,
  IconCpu,
  IconPlugConnected,
  IconDeviceLaptop,
  IconFileCheck,
  IconFileText,
  IconHeadset,
  IconInfinity,
  IconInfoCircle,
  IconLayersUnion,
  IconLock,
  IconRefresh,
  IconRobot,
  IconSparkles,
  IconStarsFilled,
  IconTerminal2,
  IconTrendingUp,
  IconUsers,
  type Icon,
  IconCheck,
} from '@tabler/icons-react'
import { EmojiSource } from '@usespaceui/emoji'
import { Badge, type BadgeProps } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { HeroAvatar, MarketingHero } from '@/components/marketing/shared/hero'
import { AnimatedStat } from '@/components/pricing/animated-stat'
import { BuyButton } from '@/components/pricing/buy-button'
import { SavingsCalculator } from '@/components/pricing/savings-calculator'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Frame, FrameFooter, FrameHeader } from '@/registry/primitives/frame'
import { Progress, ProgressIndicator, ProgressTrack } from '@/registry/primitives/progress'
import { siteConfig } from '@/config/space-config'
import {
  LIFETIME_PRICE,
  POLAR_PRODUCTS,
  PRO_YEARLY_MILESTONE_CURRENT,
  PRO_YEARLY_MILESTONE_TARGET,
  PRO_YEARLY_NEXT_PRICE,
  PRO_YEARLY_PRICE,
  REGISTRY_STATS,
} from '@/lib/pricing-config'
import { HeatShade } from '@/registry/components/shader/heat-shade'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { cn } from '@/registry/lib/utils'

export const metadata: Metadata = {
  title: `Pricing - ${siteConfig.appName}`,
  description: 'Simple, transparent pricing. Subscribe for unlimited access or buy templates one at a time.',
}

type PlanFeature = {
  icon: Icon
  text: string
  badge?: string
  badgeVariant?: BadgeProps['variant']
  badgeIcon?: Icon
  badgeClassName?: string
}

const plans = [
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
      fallback: 'from-slate-400/10 via-slate-300/5 to-transparent',
      opacity: 'opacity-25 dark:opacity-100',
    },
    features: [
      {
        icon: IconComponents,
        text: `${REGISTRY_STATS.primitivesFree}+ free primitives & components`,
        // badge: 'Growing',
        // badgeVariant: 'accent',
        // badgeIcon: IconTrendingUp,
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
    price: PRO_YEARLY_PRICE,
    priceSuffix: '/ year',
    strikethrough: `$${PRO_YEARLY_NEXT_PRICE}`,
    chip: null as string | null,
    silk: {
      color1: '#ff6b4a',
      color2: '#ffa07a',
      color3: '#ff4071',
      fallback: 'from-rose-500/25 via-amber-500/15 to-transparent',
      opacity: 'opacity-20 dark:opacity-100',
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
    price: LIFETIME_PRICE,
    priceSuffix: '/ once',
    strikethrough: null,
    chip: 'Team license · 3 developers',
    silk: {
      color1: '#7c3aed',
      color2: '#6366f1',
      color3: '#a855f7',
      fallback: 'from-violet-500/25 via-indigo-500/15 to-transparent',
      opacity: 'opacity-20 dark:opacity-100',
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
        label="Get lifetime access"
        variant="primary"
        full
        hover
        whileTap
        size="lg"
      />
    ),
  },
]

const templates = [
  {
    id: POLAR_PRODUCTS.templateImmersiveLens || 'template_immersive_lens',
    title: 'Immersive Lens Template',
    price: '$49',
    description:
      'An interactive 3D portfolio & showcase template with WebGL shaders, fluid galleries, and premium typography.',
    icon: IconDeviceLaptop,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-pink-500/20',
  },
  {
    id: 'template_saas_dashboard',
    title: 'SaaS Dashboard & Analytics',
    price: '$69',
    description: 'A complete dashboard app with metrics, styled Recharts, virtualized tables, and role management.',
    icon: IconTerminal2,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
  },
  {
    id: 'pack_motion_ui',
    title: 'Space Motion UI Pack',
    price: '$39',
    description: '30+ animations, elastic accordions, morphing icons, and interactive squircle effects.',
    icon: IconSparkles,
    gradient: 'from-amber-500/20 via-orange-500/10 to-red-500/20',
  },
]

const stats = [
  { label: 'Base Primitives', value: REGISTRY_STATS.primitives },
  { label: 'Pro Components', value: REGISTRY_STATS.proComponents },
  { label: 'Templates', value: REGISTRY_STATS.templatesTotal },
  { label: 'Block Collections', value: REGISTRY_STATS.blockCollections },
  { label: 'Demos & Examples', value: REGISTRY_STATS.examples },
]

const faqs = [
  {
    question: 'What is the difference between Pro Yearly and Lifetime?',
    answer:
      'Pro Yearly gives you full access to every component, block, and template for one year, billed once a year. Lifetime is a single one-time payment that unlocks everything forever, including all future updates, with no renewal.',
  },
  {
    question: 'Can I upgrade from Pro Yearly to Lifetime later?',
    answer:
      'Yes. Reach out at ' +
      siteConfig.email +
      ' and we will credit your current subscription toward a Lifetime license.',
  },
  {
    question: 'Will the price go up over time?',
    answer: `Pro Yearly is priced at an early-adopter rate of $${PRO_YEARLY_PRICE}/year. As we hit growth milestones, the price for new subscribers increases toward $${PRO_YEARLY_NEXT_PRICE}/year — your existing subscription price stays locked in.`,
  },
  {
    question: 'What happens when the price increases?',
    answer: `The progress bar on the Pro Yearly plan tracks subscribers toward the next milestone (${PRO_YEARLY_MILESTONE_TARGET} subscribers). Once it's reached, new subscribers pay $${PRO_YEARLY_NEXT_PRICE}/year — everyone who joined before keeps their $${PRO_YEARLY_PRICE}/year rate for as long as they stay subscribed.`,
  },
  {
    question: 'Can I use Space UI in commercial and client projects?',
    answer: 'Yes. Every paid plan, including the fixed-price templates, includes a commercial usage license.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "If Space UI isn't a fit, contact us within 14 days of purchase and we'll issue a full refund, no questions asked.",
  },
  {
    question: 'Do you support teams or agencies?',
    answer:
      'The Lifetime plan includes a license for up to 3 developers. For larger teams or custom agency licensing, contact us and we will put together a plan that fits.',
  },
]

function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-12 text-center">
      <Badge size="md" className="px-3.5 py-1.5 font-semibold text-xs tracking-tight">
        {badge}
      </Badge>
      <div className="max-w-2xl">
        <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[46px] md:text-[54px]">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="relative min-h-dvh bg-background text-foreground selection:bg-primary/20 pb-20">
      <MarketingHero
        statusBadge={{
          primaryText: 'Pricing',
          secondaryText: 'Simple, transparent',
          emojiCodepoint: '💎',
          emojiSource: EmojiSource.Telegram,
          href: '#plans',
        }}
        title={
          <>
            Ship better interfaces <HeroAvatar name="pricing-space" variant="invader" animate /> at full speed{' '}
            <HeroAvatar name="space" variant="pebble" />
          </>
        }
        description="Subscribe for unlimited access to the entire library, or buy the templates you need one at a time."
      >
        {/* <Button
          render={<Link href="/components" />}
          data-space-hover
          size="lg"
          className="inline-flex items-center gap-2 px-6 py-3.5 font-medium transition-all duration-300"
        >
          <span>Browse components</span>
        </Button> */}
      </MarketingHero>

      <section id="plans" data-page-section className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-6 py-10">
        <SectionHeader
          badge="Plans"
          title="Choose your plan"
          description="Free to start. Upgrade any time for the full Pro library, or grab lifetime access once."
        />
        <div className="relative grid grid-cols-1 items-stretch gap-2 md:grid-cols-3 lg:gap-4">
          {plans.map((plan) => (
            <Frame
              key={plan.key}
              className={cn(
                'flex h-full flex-col squircle rounded-5xl p-1.5 transition-all duration-300',
                plan.recommended && 'bg-primary/10',
              )}
            >
              <Card className="relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl bg-background p-4 sm:p-5 before:rounded-7xl">
                <div className="relative flex min-h-40 flex-col justify-between gap-6 overflow-hidden squircle rounded-5xl p-4 sm:p-5 bg-muted">
                  {plan.silk && (
                    <>
                      <div
                        className={cn(
                          'pointer-events-none absolute inset-0 bg-linear-to-b opacity-45 transition-opacity',
                          plan.silk.fallback,
                        )}
                      />
                      <div className={cn('pointer-events-none absolute inset-0 transition-opacity', plan.silk.opacity)}>
                        <SilkGradient
                          className="size-full"
                          color1={plan.silk.color1}
                          color2={plan.silk.color2}
                          color3={plan.silk.color3}
                          speed={0.65}
                          animate
                          grain={false}
                        />
                      </div>
                      <div className={cn('pointer-events-none absolute inset-0 transition-opacity opacity-50')}>
                        <HeatShade
                          className="size-full"
                          variant="licks"
                          from="bottom"
                          base={plan.silk.color1}
                          hot={plan.silk.color3}
                          speed={0.95}
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

                  {/* Big Price Display matching screenshot */}
                  <div className="relative z-10 flex items-baseline gap-1 pt-1">
                    {plan.price === 0 ? (
                      <span className="font-semibold text-4xl sm:text-5xl text-white tracking-tight">Free</span>
                    ) : (
                      <>
                        <span className="text-xl sm:text-2xl font-semibold text-white/90 self-start mt-0.5">$</span>
                        <span className="font-semibold text-4xl sm:text-5xl text-white tracking-tight">
                          {plan.price}
                        </span>
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
                          {/* <feature.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" stroke={1.75} /> */}
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

      <section id="savings" data-page-section className="mx-auto max-w-6xl scroll-mt-16 px-5 sm:px-6 py-16">
        <SectionHeader
          badge="Savings calculator"
          title="What is your time worth?"
          description="Tell us how long this would take to build and what an hour costs. We’ll do the math."
        />
        <div className="relative">
          <SavingsCalculator />
        </div>
      </section>
      <section data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-16">
        <SectionHeader badge="FAQ" title="Frequently asked questions" description="Still unsure? Here's the rundown." />

        <BouncyAccordion
          className="mx-auto mt-10 squircle w-full max-w-xl"
          defaultValue={0}
          items={faqs.map((faq) => ({ title: faq.question, description: faq.answer }))}
        />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still have questions? email at{' '}
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            {siteConfig.email}
          </a>
        </p>
      </section>

      <section data-page-section className="mx-auto max-w-3xl scroll-mt-16 px-5 sm:px-6 py-10">
        <div className="flex flex-col items-center gap-6 rounded-5xl bg-muted p-10 text-center sm:p-14">
          <h2 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[36px]">
            Ready to ship faster?
          </h2>
          <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
            Join Space UI Pro and get every component, block, and future drop — starting at ${PRO_YEARLY_PRICE}/year.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BuyButton productId={POLAR_PRODUCTS.proYearly} label="Get Pro" variant="primary" size="lg" border />
          </div>
        </div>
      </section>
    </div>
  )
}
