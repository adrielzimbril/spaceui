import type { Metadata } from 'next'
import Link from 'next/link'
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconBoxMultiple,
  IconCheck,
  IconDeviceLaptop,
  IconInfoCircle,
  IconMail,
  IconPalette,
  IconRocket,
  IconShieldCheck,
  IconSparkles,
  IconTerminal2,
} from '@tabler/icons-react'
import { EmojiSource } from '@usespaceui/emoji'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { HeroAvatar, MarketingHero } from '@/components/marketing/shared/hero'
import { AnimatedStat } from '@/components/pricing/animated-stat'
import { BuyButton } from '@/components/pricing/buy-button'
import { PricingCalculator } from '@/components/pricing/pricing-calculator'
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
    badgeLabel: 'Free',
    description: 'Get started with Space UI and ship with the open-source primitives.',
    price: 0,
    priceSuffix: '/ forever',
    chip: null as string | null,
    features: [
      'All base primitives & components',
      'Standard CLI installer',
      'Tailwind CSS & Motion support',
      'Community Wall access',
    ],
    recommended: false,
    cta: (
      <Button variant="outline" full hover whileTap asPointer render={<Link href="/components" />}>
        Browse components
      </Button>
    ),
  },
  {
    key: 'pro',
    name: 'Pro Yearly',
    badgeLabel: 'Most popular',
    description: 'For developers and studios shipping polished products every week.',
    price: PRO_YEARLY_PRICE,
    priceSuffix: '/ year',
    chip: null as string | null,
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
      <LiquidBorder className="flex w-full squircle rounded-full p-0.75 hover:scale-105 transition-all duration-300">
        <Button variant="primary" full size="lg" asPointer render={<Link href="/checkout?products=pro_yearly" />}>
          <IconBolt className="size-4" />
          <span>Get instant access</span>
        </Button>
      </LiquidBorder>
    ),
  },
  {
    key: 'lifetime',
    name: 'Lifetime',
    badgeLabel: 'One-time',
    description: 'Pay once, use Space UI forever. No recurring billing, ever.',
    price: LIFETIME_PRICE,
    priceSuffix: '/ once',
    chip: 'Team license · 3 developers',
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
      <>
        {/* <LiquidBorder className="flex w-full squircle rounded-full p-0.75"> */}
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
        {/* </LiquidBorder> */}
      </>
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
  { label: 'Primitives', value: REGISTRY_STATS.primitives },
  { label: 'Pro components', value: REGISTRY_STATS.proComponents },
  { label: 'Block collections', value: REGISTRY_STATS.blockCollections },
  { label: 'Examples & demos', value: REGISTRY_STATS.examples },
]

const featureGrid = [
  {
    icon: IconBoxMultiple,
    title: 'Every primitive & Pro component',
    description: `${REGISTRY_STATS.primitives}+ base primitives and ${REGISTRY_STATS.proComponents}+ Pro components, ready to drop in.`,
  },
  {
    icon: IconBolt,
    title: 'New drops every week',
    description: 'Fresh components, blocks, and effects ship weekly at no extra charge.',
  },
  {
    icon: IconTerminal2,
    title: 'CLI installer, everywhere',
    description: 'One command installs into Next.js, Vite, Remix, or any React setup.',
  },
  {
    icon: IconPalette,
    title: 'Themes & design tokens',
    description: 'Registry themes, Tailwind CSS v4 tokens, and full dark mode out of the box.',
  },
  {
    icon: IconSparkles,
    title: 'Motion & micro-interactions',
    description: 'Built on Motion, with squircle effects and animated primitives throughout.',
  },
  {
    icon: IconShieldCheck,
    title: 'Full TypeScript, fully typed',
    description: 'Every component ships with complete types, no `any`, no guesswork.',
  },
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
              className={cn('flex h-full flex-col rounded-3xl p-1.5', plan.recommended && 'bg-primary/10')}
            >
              {/* {plan.recommended && (
                <FrameHeader className="flex flex-row items-center justify-center px-3 py-2">
                  <Badge variant="primary" size="sm" className="font-semibold text-xs">
                    {plan.badgeLabel}
                  </Badge>
                </FrameHeader>
              )} */}
              <Card className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-background p-6 before:rounded-2xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{plan.name}</h3>
                    {!plan.recommended ? (
                      <Badge size="sm" className="text-xs">
                        {plan.badgeLabel}
                      </Badge>
                    ) : (
                      <LiquidBorder className="inline-flex squircle rounded-full p-0.75">
                        <Badge size="sm" className="text-xs">
                          {plan.badgeLabel}
                        </Badge>
                      </LiquidBorder>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">{plan.description}</p>

                  <CardPanel className="space-y-4 p-0">
                    <div className="flex items-baseline gap-1">
                      <span className="font-semibold text-4xl text-foreground tracking-tight">${plan.price}</span>
                      <span className="text-muted-foreground text-xs">{plan.priceSuffix}</span>
                    </div>

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

                    <ul className="space-y-2.5 text-foreground/90 text-xs sm:text-sm">
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
          badge="Compare plans"
          title="Which option is right for you?"
          description="Run the numbers before you decide between subscribing, buying templates individually, or going Lifetime."
        />
        <div className="mt-12">
          <PricingCalculator />
        </div>
      </section>

      {/* Fixed-price templates */}
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

      {/* What's included */}
      <section data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-16">
        <SectionHeader
          badge="What you get"
          title="A growing, production-ready library"
          description="Every plan builds on the same foundation — Base UI, Tailwind CSS v4, and a registry that ships new work weekly."
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureGrid.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center squircle rounded-full bg-primary/10 text-primary">
                <feature.icon className="size-4.5" stroke={1.75} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
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
