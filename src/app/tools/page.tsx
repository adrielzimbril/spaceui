import type { Metadata } from 'next'
import { IconClock } from '@tabler/icons-react'
import { megaMenuTools } from '@/config/menu-config'
import { SiteFooter } from '@/components/layout/site-footer'
import { MarketingHero, HeroAvatar } from '@/components/marketing/shared/hero'
import { ToolsBentoGrid } from '@/components/marketing/tools/tools-bento-grid'
import { UpcomingToolCard } from '@/components/marketing/tools/upcoming-tool-card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

export const metadata: Metadata = {
  title: 'Tools — Space UI',
  description:
    'Creative tools, deterministic generators, image slicers and sensory design utilities from the Space UI design system.',
  openGraph: {
    title: 'Tools — Space UI',
    description:
      'Creative tools, deterministic generators, image slicers and sensory design utilities from the Space UI design system.',
    type: 'website',
  },
}

export default function ToolsIndexPage() {
  const availableTools = megaMenuTools.filter((tool) => !tool.upcoming && tool.href !== '/tools')
  const upcomingTools = megaMenuTools.filter((tool) => tool.upcoming)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHero
        statusBadge={{
          primaryText: 'Tools',
          secondaryText: 'Sensory & creative studios',
          emojiCodepoint: '⚡',
          href: '/tools',
        }}
        title={
          <>
            Sensory utilities
            <HeroAvatar name="tools" variant="splash" animate />
            for creators
            <HeroAvatar name="designers" variant="pebble" />
            &amp; UI designers.
          </>
        }
        description="Explore generative deterministic avatars, fluent emojis, spatial web audio sounds, and image carousel slicers. All client-side, instant and zero-latency."
      />

      <main className="flex-1 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-14">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <Badge
                size="md"
                className="px-3.5 py-1.5 font-semibold text-xs tracking-tight bg-muted text-foreground border-none cursor-pointer"
              >
                Tools &amp; Packages
              </Badge>
              <div className="max-w-2xl">
                <h2 className="text-[2.125rem] font-semibold tracking-tight text-foreground sm:text-[2.875rem] md:text-[3.375rem] transition-colors group-hover:text-foreground">
                  Creative Tools
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Modular creative tools and lightweight runtime packages published on npm. Install independently into
                  any React project with zero friction.
                </p>
              </div>
            </div>

            <ToolsBentoGrid />
          </div>

          {upcomingTools.length > 0 && (
            <div className="pt-8 border-t border-border">
              <div className="mb-6 flex items-center gap-2">
                <IconClock className="size-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold tracking-[-0.03em]">In development</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingTools.map((tool) => (
                  <UpcomingToolCard key={tool.title} tool={tool} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export const instant = false
