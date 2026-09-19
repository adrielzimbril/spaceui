import type { Metadata } from 'next'
import { EmojiSource } from '@usespaceui/emoji'
import { HeroAvatar, MarketingHero } from '@/components/marketing/shared/hero'
import { PlansSection } from '@/components/marketing/pricing/plans-section'
import { SavingsSection } from '@/components/marketing/pricing/savings-section'
import { FaqSection } from '@/components/marketing/pricing/faq-section'
import { CtaSection } from '@/components/marketing/pricing/cta-section'
import { getPricingSnapshot } from '@/lib/pricing-tiers'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing. Subscribe for unlimited access or buy templates one at a time.',
}

// getPricingSnapshot() reads live sales counts from Supabase — genuinely dynamic, can't be a static shell.
export const instant = false

export default async function PricingPage() {
  const pricing = await getPricingSnapshot()

  return (
    <div className="relative min-h-dvh bg-background text-foreground selection:bg-primary/20 pb-20">
      <MarketingHero
        statusBadge={{
          primaryText: `${pricing.proYearlyDiscountPercent}% OFF`,
          secondaryText: 'Limited time offer',
          emojiCodepoint: '💎',
          emojiSource: EmojiSource.Telegram,
          href: '#plans',
        }}
        title={
          <>
            Ship <HeroAvatar name="pricing-space" variant="invader" animate /> in days, not months{' '}
            <HeroAvatar name="space" variant="pebble" />
          </>
        }
        description="Premium components, blocks, and templates ready to drop in with new drops every week."
      />

      <PlansSection pricing={pricing} />
      <SavingsSection pricing={pricing} />
      <FaqSection />
      <CtaSection pricing={pricing} />
    </div>
  )
}
