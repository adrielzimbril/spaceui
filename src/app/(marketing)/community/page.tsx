import type { Metadata } from 'next'
import { MarketingHero, HeroAvatar } from '@/components/marketing/shared/hero'
import { CommunityView } from './community-view'

export const metadata: Metadata = {
  title: 'Community Wall — Space UI',
  description:
    'An interactive infinite canvas where developers, designers, and creators pin notes, love letters, and ideas for Space UI.',
}

export default function CommunityPage() {
  return (
    <div className="relative min-h-dvh bg-background text-foreground selection:bg-primary/20 pb-20">
      <MarketingHero
        statusBadge={{
          primaryText: 'Community Wall',
          secondaryText: 'Live Canvas & Guestbook',
          emojiCodepoint: '🪐',
          href: '/community',
        }}
        title={
          <>
            Leave your <HeroAvatar name="heart" variant="lumina" animate /> mark on{' '}
            Space UI <HeroAvatar name="space" variant="invader" />
          </>
        }
        description="Explore messages from creators worldwide on our draggable infinite canvas. Add your note, customize your card pattern, and join the constellation."
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CommunityView />
      </main>
    </div>
  )
}
