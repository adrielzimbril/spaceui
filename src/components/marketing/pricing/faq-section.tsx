import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { siteConfig } from '@/config/space-config'
import { PRO_YEARLY_MILESTONE_TARGET, PRO_YEARLY_NEXT_PRICE, PRO_YEARLY_PRICE } from '@/lib/pricing-config'
import { SectionHeader } from './section-header'

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

export function FaqSection() {
  return (
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
  )
}
