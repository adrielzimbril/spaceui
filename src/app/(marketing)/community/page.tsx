import type { Metadata } from 'next'
import { MarketingHero, HeroAvatar } from '@/components/marketing/shared/hero'
import { CommunityView } from './community-view'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/integrations/supabase/server'
import type { CommunityMessage } from '@/registry/blocks/community-wall'

export const metadata: Metadata = {
  title: 'Community Wall',
  description:
    'An interactive infinite canvas where developers, designers, and creators pin notes, love letters, and ideas for Space UI.',
}

export default async function CommunityPage() {
  let initialUser = null
  let initialMessages: CommunityMessage[] = []
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      initialUser = user
    }

    const dbClient = supabase || createAdminClient()
    if (dbClient) {
      const { data } = await dbClient
        .from('community_wall')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      initialMessages = data || []
    }
  } catch (err) {
    // Continue without user/messages — CommunityView falls back to a client fetch
  }

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
            Leave your <HeroAvatar name="heart" variant="lumina" animate /> mark on Space UI{' '}
            <HeroAvatar name="space" variant="invader" />
          </>
        }
        description="Explore messages from creators worldwide on our draggable infinite canvas. Add your note, customize your card pattern, and join the constellation."
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CommunityView initialUser={initialUser} initialMessages={initialMessages} />
      </main>
    </div>
  )
}
