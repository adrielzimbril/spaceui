import type { Metadata } from 'next'
import { EmojiSource } from '@usespaceui/emoji'
import { HeroAvatar, MarketingHero } from '@/components/marketing/shared/hero'
import { PlansSection } from '@/components/marketing/pricing/plans-section'
import { SavingsSection } from '@/components/marketing/pricing/savings-section'
import { FaqSection } from '@/components/marketing/pricing/faq-section'
import { CtaSection } from '@/components/marketing/pricing/cta-section'
import { siteConfig } from '@/config/space-config'

export const metadata: Metadata = {
  title: `Pricing - ${siteConfig.appName}`,
  description: 'Simple, transparent pricing. Subscribe for unlimited access or buy templates one at a time.',
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
      />

      <PlansSection />
      <SavingsSection />
      <FaqSection />
      <CtaSection />
    </div>
  )
}
