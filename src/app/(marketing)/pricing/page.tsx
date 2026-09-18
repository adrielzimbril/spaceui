import type { Metadata } from 'next'
import Link from 'next/link'
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconDeviceLaptop,
  IconInfoCircle,
  IconSparkles,
  IconTerminal2,
} from '@tabler/icons-react'
import { EmojiSource } from '@usespaceui/emoji'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
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
  PRO_YEARLY_MILESTONE_CURRENT,
  PRO_YEARLY_MILESTONE_TARGET,
  PRO_YEARLY_NEXT_PRICE,
  PRO_YEARLY_PRICE,
  REGISTRY_STATS,
} from '@/lib/pricing-config'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { cn } from '@/registry/lib/utils'

export const metadata: Metadata = {
  title: `Pricing - ${siteConfig.appName}`,
  description: 'Simple, transparent pricing. Subscribe for unlimited access or buy templates one at a time.',
}

const POLAR_PRODUCTS = {
  proYearly: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_ID || '',
  allAccessLifetime: process.env.NEXT_PUBLIC_POLAR_LIFETIME_ID || '',
  templateImmersiveLens: process.env.NEXT_PUBLIC_POLAR_TEMPLATE_IMMERSIVE_ID || '',
}

const plans = [
  {
    key: 'free',
    name: 'Community',
    tag: 'COMMUNITY',
    description: 'Get started with Space UI and ship with the open-source primitives.',
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
      'All base primitives & components',
      'Standard CLI installer',
      'Tailwind CSS & Motion support',
      'Community Wall access',
    ],
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
    description: 'For developers and studios shipping polished products every week.',
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
      'Everything in Community',
      'All Pro components & shader effects',
      'All blocks & micro-interactions',
      'New components shipped every week',
      'Unlimited personal & commercial projects',
      'Priority support on Discord & email',
    ],
    recommended: true,
    cta: POLAR_PRODUCTS.proYearly ? (
      <BuyButton productId={POLAR_PRODUCTS.proYearly} label="Get Pro" variant="primary" full size="lg" />
    ) : (
      <LiquidBorder className="flex w-full [&_div]:size-full squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
        <Button
          variant="primary"
          className="bg-primary!"
          full
          size="lg"
          asPointer
          render={<Link href="/checkout?products=pro_yearly" />}
        >
          <IconBolt className="size-4" />
          <span>Get instant access</span>
        </Button>
      </LiquidBorder>
    ),
  },
  {
    key: 'lifetime',
    name: 'Lifetime',
    tag: 'LIFETIME',
    description: 'Pay once, use Space UI forever. No recurring billing, ever.',
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
      'Everything in Pro, forever',
      'All future updates included',
      'All premium templates included',
      'Team license for up to 3 developers',
    ],
    recommended: false,
    cta: POLAR_PRODUCTS.allAccessLifetime ? (
      <BuyButton
        productId={POLAR_PRODUCTS.allAccessLifetime}
        label="Get lifetime access"
        variant="secondary"
        full
        size="lg"
      />
    ) : (
      <Button
        variant="primary"
        full
        hover
        whileTap
        size="lg"
        asPointer
        render={<Link href="/checkout?products=lifetime" />}
      >
        Get lifetime access
      </Button>
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
    <div className="flex flex-col items-center justify-center gap-2 text-center">
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
        <Button
          render={<Link href="/components" />}
          data-space-hover
          className="inline-flex items-center gap-2 px-6 py-3.5 font-medium transition-all duration-300"
        >
          <span>Browse components</span>
        </Button>
      </MarketingHero>

      <section id="plans" data-page-section className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-6 py-10">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <Frame
              key={plan.key}
              className={cn(
                'flex h-full flex-col squircle rounded-7xl p-1.5 transition-all duration-300',
                plan.recommended && 'bg-primary/10',
              )}
            >
              <Card className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-background p-5 sm:p-6 before:rounded-7xl">
                <div className="relative flex min-h-40 flex-col justify-between gap-6 overflow-hidden squircle rounded-5xl border border-border/50 p-5 sm:p-6 bg-muted/20">
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
                      <span className="font-semibold text-4xl sm:text-5xl text-foreground tracking-tight">Free</span>
                    ) : (
                      <>
                        <span className="text-xl sm:text-2xl font-semibold text-muted-foreground dark:text-foreground/90 self-start mt-0.5">
                          $
                        </span>
                        <span className="font-semibold text-4xl sm:text-5xl text-foreground tracking-tight">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground dark:text-foreground/90 text-xs sm:text-sm ml-1 font-normal">
                          {plan.priceSuffix}
                        </span>
                        {plan.strikethrough && (
                          <span className="text-muted-foreground/50 dark:text-foreground/80 line-through text-xs sm:text-sm ml-1.5 font-normal">
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
                    {plan.key === 'pro' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            {PRO_YEARLY_MILESTONE_CURRENT}/{PRO_YEARLY_MILESTONE_TARGET} at ${PRO_YEARLY_PRICE}/year
                          </span>
                          <span>${PRO_YEARLY_NEXT_PRICE}/year after</span>
                        </div>
                        <Progress value={(PRO_YEARLY_MILESTONE_CURRENT / PRO_YEARLY_MILESTONE_TARGET) * 100}>
                          <ProgressTrack>
                            <ProgressIndicator />
                          </ProgressTrack>
                        </Progress>
                      </div>
                    )}
                    {plan.chip && (
                      <Badge size="sm" className="text-[11px]">
                        {plan.chip}
                      </Badge>
                    )}

                    <ul className="space-y-2.5 text-foreground/90 text-xs sm:text-sm pt-2 border-t border-border/50">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
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
        <div className="mt-12">
          <SavingsCalculator />
        </div>
      </section>

      <section data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-16">
        <SectionHeader
          badge="One-time, fixed-price purchases"
          title="Ready-to-deploy templates & kits"
          description="Only need one specific product, no subscription? Buy templates separately at a fixed price."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Frame key={template.id} className="flex flex-col h-full">
              <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden bg-background">
                <CardPanel className="flex-1 flex flex-col gap-3 p-5">
                  <div
                    className={`flex aspect-video w-full items-center justify-center rounded-lg bg-linear-to-br ${template.gradient} text-muted-foreground`}
                  >
                    <template.icon className="size-10 text-foreground opacity-70" stroke={1.5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">{template.title}</h3>
                    <span className="font-semibold text-foreground text-sm">{template.price}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{template.description}</p>
                </CardPanel>
              </Card>
              <FrameFooter className="p-2">
                <BuyButton
                  productId={template.id}
                  price={template.price}
                  label="Buy this template"
                  variant="base"
                  full
                  size="sm"
                />
              </FrameFooter>
            </Frame>
          ))}
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

      {/* Closing CTA */}
      <section data-page-section className="mx-auto max-w-3xl scroll-mt-16 px-5 sm:px-6 py-10">
        <div className="flex flex-col items-center gap-6 rounded-5xl bg-muted p-10 text-center sm:p-14">
          <h2 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[36px]">
            Ready to ship faster?
          </h2>
          <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
            Join Space UI Pro and get every component, block, and future drop — starting at ${PRO_YEARLY_PRICE}/year.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {POLAR_PRODUCTS.proYearly ? (
              <BuyButton productId={POLAR_PRODUCTS.proYearly} label="Get Pro" variant="primary" size="lg" />
            ) : (
              <LiquidBorder className="flex w-full squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
                <Button variant="primary" asPointer render={<Link href="/checkout?products=pro_yearly" />}>
                  <IconBolt className="size-4" />
                  <span>Get Pro</span>
                </Button>
              </LiquidBorder>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
