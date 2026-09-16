import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Crown,
  Laptop,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { BuyButton } from '@/components/pricing/buy-button'
import { PricingCalculator } from '@/components/pricing/pricing-calculator'
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/registry/primitives/accordion'
import { Card, CardDescription, CardFooter, CardFrame, CardHeader, CardPanel, CardTitle } from '@/registry/primitives/card'
import { siteConfig } from '@/config/space-config'
import { LIFETIME_PRICE, PRO_YEARLY_NEXT_PRICE, PRO_YEARLY_PRICE, REGISTRY_STATS } from '@/lib/pricing-config'

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
    badgeVariant: 'outline' as const,
    description: 'Get started with Space UI and ship with the open-source primitives.',
    price: 0,
    priceSuffix: '/ forever',
    note: null as string | null,
    features: [
      'All base primitives & components',
      'Standard CLI installer',
      'Tailwind CSS & Motion support',
      'Community Wall access',
    ],
    recommended: false,
    cta: (
      <Button variant="base" full asPointer render={<Link href="/primitives" />}>
        Start for free
      </Button>
    ),
  },
  {
    key: 'pro',
    name: 'Pro Yearly',
    badgeLabel: 'Most popular',
    badgeVariant: 'primary' as const,
    description: 'For developers and studios shipping polished products every week.',
    price: PRO_YEARLY_PRICE,
    priceSuffix: '/ year',
    note: `Early-adopter price — increases to $${PRO_YEARLY_NEXT_PRICE}/year at our next milestone.`,
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
      <Button variant="primary" full size="lg" asPointer render={<Link href="/checkout?products=pro_yearly" />}>
        <Zap className="size-4" />
        <span>Get Pro</span>
      </Button>
    ),
  },
  {
    key: 'lifetime',
    name: 'Lifetime',
    badgeLabel: 'One-time',
    badgeVariant: 'outline' as const,
    description: 'Pay once, use Space UI forever. No recurring billing, ever.',
    price: LIFETIME_PRICE,
    priceSuffix: '/ once',
    note: 'Includes a team license for up to 3 developers.',
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
      <Button variant="secondary" full size="lg" asPointer render={<Link href="/checkout?products=lifetime" />}>
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
    icon: Laptop,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-pink-500/20',
  },
  {
    id: 'template_saas_dashboard',
    title: 'SaaS Dashboard & Analytics',
    price: '$69',
    description: 'A complete dashboard app with metrics, styled Recharts, virtualized tables, and role management.',
    icon: Terminal,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
  },
  {
    id: 'pack_motion_ui',
    title: 'Space Motion UI Pack',
    price: '$39',
    description: '30+ animations, elastic accordions, morphing icons, and interactive squircle effects.',
    icon: Sparkles,
    gradient: 'from-amber-500/20 via-orange-500/10 to-red-500/20',
  },
]

const stats = [
  { label: 'Primitives', value: REGISTRY_STATS.primitives },
  { label: 'Pro components', value: REGISTRY_STATS.proComponents },
  { label: 'Block collections', value: REGISTRY_STATS.blockCollections },
  { label: 'Examples & demos', value: REGISTRY_STATS.examples },
]

const included = [
  'CLI installer for every framework',
  'Tailwind CSS v4 & Motion support',
  'Full TypeScript types',
  'Dark mode out of the box',
  'Registry themes & tokens',
  'Weekly new components & blocks',
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
      "Yes. Reach out at " +
      siteConfig.email +
      ' and we will credit your current subscription toward a Lifetime license.',
  },
  {
    question: 'Will the price go up over time?',
    answer:
      `Pro Yearly is priced at an early-adopter rate of $${PRO_YEARLY_PRICE}/year. As we hit growth milestones, the price for new subscribers increases toward $${PRO_YEARLY_NEXT_PRICE}/year — your existing subscription price stays locked in.`,
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

export default function PricingPage() {
  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-87.5 w-150 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* Head CTA */}
      <div className="mx-auto max-w-3xl space-y-5 text-center">
        <Badge variant="outline" className="border-primary/30 px-3 py-1 text-primary text-xs">
          <Sparkles className="size-3.5" />
          Simple, transparent pricing
        </Badge>
        <h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
          Ship better interfaces at full speed.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Subscribe for unlimited access to the entire library, or buy the templates you need one at a time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="lg" asPointer render={<Link href="#plans" />}>
            <Rocket className="size-4" />
            <span>View plans</span>
          </Button>
          <Button variant="outline" size="lg" asPointer render={<Link href="/components" />}>
            Browse components
          </Button>
        </div>
      </div>

      {/* Pricing plans */}
      <div id="plans" className="mt-16 grid scroll-mt-24 grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <CardFrame
            key={plan.key}
            className={`squircle w-full rounded-4xl p-2 ${plan.recommended ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
          >
            {plan.recommended && (
              <div className="-top-3 absolute left-1/2 z-10 -translate-x-1/2">
                <Badge variant="primary" className="flex items-center gap-1 px-3 py-1 font-semibold text-xs">
                  <Crown className="size-3" />
                  {plan.badgeLabel}
                </Badge>
              </div>
            )}
            <Card className="flex h-full flex-col justify-between gap-6 p-5 sm:p-7">
              <div className="flex flex-col gap-4">
                <CardHeader className="flex-col items-stretch gap-3 p-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {!plan.recommended && (
                      <Badge variant={plan.badgeVariant} className="text-xs">
                        {plan.badgeLabel}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                </CardHeader>

                <CardPanel className="space-y-4 p-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-4xl text-foreground tracking-tight">${plan.price}</span>
                    <span className="text-muted-foreground text-xs">{plan.priceSuffix}</span>
                  </div>
                  {plan.note && <p className="text-[11px] text-muted-foreground">{plan.note}</p>}

                  <ul className="space-y-2.5 text-foreground/90 text-xs sm:text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardPanel>
              </div>

              <CardFooter className="p-0">{plan.cta}</CardFooter>
            </Card>
          </CardFrame>
        ))}
      </div>

      {/* Calculator */}
      <div className="mt-24 border-border/50 border-t pt-16">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Calculate your savings
          </Badge>
          <h2 className="font-bold text-2xl text-foreground sm:text-3xl">Which option is right for you?</h2>
          <p className="text-muted-foreground text-sm">
            Run the numbers before you decide between subscribing, buying templates individually, or going Lifetime.
          </p>
        </div>
        <PricingCalculator />
      </div>

      {/* Fixed-price templates */}
      <div className="mt-24 border-border/50 border-t pt-16">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            <Laptop className="size-3.5" />
            One-time, fixed-price purchases
          </Badge>
          <h2 className="font-bold text-2xl text-foreground sm:text-3xl">Ready-to-deploy templates & kits</h2>
          <p className="text-muted-foreground text-sm">
            Only need one specific product, no subscription? Buy templates separately at a fixed price.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="squircle group flex flex-col justify-between rounded-3xl border border-border/60 bg-card/30 p-5 transition-all hover:border-border"
            >
              <div className="space-y-3">
                <div
                  className={`flex aspect-video w-full items-center justify-center rounded-2xl border border-border/40 bg-linear-to-br ${template.gradient} text-muted-foreground transition-transform group-hover:scale-[1.01]`}
                >
                  <template.icon className="size-10 text-foreground opacity-70" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{template.title}</h3>
                  <span className="font-bold text-foreground">{template.price}</span>
                </div>
                <p className="text-muted-foreground text-xs">{template.description}</p>
              </div>

              <CardFooter className="p-0 pt-5">
                <BuyButton
                  productId={template.id}
                  price={template.price}
                  label="Buy this template"
                  variant="base"
                  full
                  size="sm"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="mt-24 border-border/50 border-t pt-16">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            What you get
          </Badge>
          <h2 className="font-bold text-2xl text-foreground sm:text-3xl">A growing, production-ready library</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="squircle items-center rounded-3xl bg-card/40 p-5 text-center">
              <CardPanel className="items-center gap-1 p-0">
                <span className="font-bold text-3xl text-foreground tabular-nums">{stat.value}+</span>
                <span className="text-muted-foreground text-xs">{stat.label}</span>
              </CardPanel>
            </Card>
          ))}
        </div>

        <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 text-muted-foreground text-sm sm:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="mt-24 border-border/50 border-t pt-16">
        <div className="mx-auto mb-8 max-w-2xl space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            FAQ
          </Badge>
          <h2 className="font-bold text-2xl text-foreground sm:text-3xl">Frequently asked questions</h2>
        </div>

        <Accordion className="mx-auto w-full max-w-2xl">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionPanel>{faq.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact for custom needs */}
      <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-muted/20 p-6 squircle sm:flex-row sm:p-8">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-semibold text-foreground">Need something custom?</h4>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Agency licensing, larger teams, or a custom bundle — let's talk.
          </p>
        </div>
        <Button variant="outline" size="sm" asPointer render={<a href={`mailto:${siteConfig.email}`} />}>
          <Mail className="size-3.5" />
          <span>Contact us</span>
        </Button>
      </div>

      {/* Customer portal */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-muted/20 p-6 squircle sm:flex-row sm:p-8">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-semibold text-foreground">Already subscribed?</h4>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage your subscription, invoices, and payment method through the secure customer portal.
          </p>
        </div>
        <Button variant="outline" size="sm" asPointer render={<a href="/api/customer-portal" />}>
          <span>Polar customer portal</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {/* Trust badges */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Secure payment via Polar</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span>Instant access after checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-amber-500" />
          <span>Updates included</span>
        </div>
      </div>
    </div>
  )
}
