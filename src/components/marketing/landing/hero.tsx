'use client'

import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { HeroAvatar } from '@/components/marketing/shared/hero'
import { siteConfig } from '@/config/space-config'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { Link } from '@/registry/primitives/link'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { IconArrowUpRight } from '@tabler/icons-react'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import * as React from 'react'
import { REGISTRY_STATS } from '@/lib/pricing-config'

const HERO_BADGE_PHRASES = [
  'Built for Next.js & Base UI',
  `${REGISTRY_STATS.components}+ production-ready components`,
  'New drops every week',
  'Open-source & MIT licensed',
  "Copy, paste, ship it's yours",
]

function useRotatingText(items: string[], intervalMs: number) {
  const [index, setIndex] = React.useState(0)
  React.useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs)
    return () => window.clearInterval(id)
  }, [items, intervalMs])
  return items[index]
}

export function Hero() {
  const isLg = useMediaQuery('(min-width: 1024px)', true)
  const isMd = useMediaQuery('(min-width: 768px)', true)
  const isSm = useMediaQuery('(min-width: 640px)', true)

  const badgePhrase = useRotatingText(HERO_BADGE_PHRASES, 3400)

  return (
    <section id="hero" data-page-section className="relative overflow-hidden pt-24 pb-8 md:pb-12">
      <div className="bg-muted rounded-5xl mx-2 md:mx-auto pt-12 pb-16 md:pt-20 md:pb-24 max-w-310 px-5 sm:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/docs" className="inline-flex items-center group outline-none">
            <StatusBadge
              variant="outline"
              status="online"
              size="lg"
              primaryText="Space UI"
              className="select-none bg-background border-none cursor-pointer transition-colors"
              secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
            >
              <BlurRevealText
                as="span"
                text={badgePhrase}
                replayKey={badgePhrase}
                splitBy="characters"
                inView={false}
                stagger={0.04}
                duration={0.3}
                className="whitespace-nowrap"
              />
              <AssetEmoji codepoint="🚀" source={EmojiSource.Fluent} type={EmojiType.Anim} size={22} lazy={false} />
            </StatusBadge>
          </Link>

          {/* ── Main Headline ── */}
          <h1 className="mt-7 max-w-5xl text-balance text-[3.125rem] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[4rem] md:text-[4.75rem] lg:text-[5.25rem]">
            Ship your ideas faster
            {/* <HeroAvatar name="p" variant="ghost" />
            <HeroAvatar name="c" variant="doodle" />
            <HeroAvatar name="c" variant="lumina" />
             <HeroAvatar name="space" variant="pebble" />
            <HeroAvatar name="pc" variant="pebble" /> */}
            <br />
            with <HeroAvatar name="c" variant="doodle" className="[&_svg_rect]:fill-white" /> better UI{' '}
            <HeroAvatar name="c" variant="lumina" />
          </h1>

          {/* ── Subtitle ── */}
          <p className="mt-6 max-w-[58ch] text-balance text-lg leading-relaxed tracking-tight text-muted-foreground sm:text-xl">
            {siteConfig.description}
          </p>

          {/* ── Official Inline Install Bar ── */}
          <div className="mt-8 flex w-full max-w-xl justify-center">
            <InlineInstallBar packageName="orb-bloop" isShadcn className="w-full" />
          </div>

          {/* ── Primary Actions ── */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <LiquidBorder className="inline-flex squircle rounded-full p-0.75 transition-all duration-300 hover:scale-105">
              <Button
                render={<Link href="/primitives" />}
                data-space-hover
                data-space-click="confirm"
                className="inline-flex items-center gap-2 px-6 py-3.5 font-medium active:scale-[0.98] transition-all duration-300"
              >
                <span>Browse components</span>
                <IconArrowUpRight className="size-4" />
              </Button>
            </LiquidBorder>

            {/* <span className="relative inline-flex group">
              <Link
                href="/components"
                className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Explore registry items"
              />

              <Button
                tabIndex={-1}
                aria-hidden="true"
                data-space-hover
                data-space-click="confirm"
                className="pointer-events-none inline-flex items-center gap-2 px-6 py-3.5 font-medium group-group-active:scale-[0.98] transition-all duration-300"
              >
                <span>Explore</span>
                <IconArrowUpRight className="size-4" />
              </Button>
            </span> */}
          </div>
        </div>
      </div>
      {/* <HeatShade
        variant="licks"
        from="top"
        className="absolute top-0 right-0 size-full opacity-70 dark:opacity-80"
        base="#2a7bba"
        hot="#43c8ff"
        speed={1}
      /> */}
    </section>
  )
}
