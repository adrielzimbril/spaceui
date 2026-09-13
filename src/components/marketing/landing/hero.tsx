'use client'

import { ArrowUpRight } from 'lucide-react'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { siteConfig } from '@/config/space-config'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { Link } from '@/registry/primitives/link'
import { AssetEmoji } from '@/tools/emoji/asset-emoji'
import { EmojiSource, EmojiType } from '@usespaceui/emoji'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { Avatar } from '@usespaceui/avatars/react'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'

export function Hero() {
  const isLg = useMediaQuery('(min-width: 1024px)', true)
  const isMd = useMediaQuery('(min-width: 768px)', true)
  const isSm = useMediaQuery('(min-width: 640px)', true)

  const avatarSize = isLg ? 75 : isMd ? 68 : isSm ? 56 : 38

  return (
    // <section id="hero" data-page-section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
    <section id="hero" data-page-section className="relative overflow-hidden pt-6 pb-8 md:pt-10 md:pb-12">
      <div className="bg-muted rounded-5xl pt-12 pb-16 md:pt-20 md:pb-24 mx-auto max-w-310 px-5 sm:px-6">
        {/* ── Announcement Pill ── */}
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/docs" className="inline-flex items-center group outline-none">
            <StatusBadge
              variant="outline"
              status="online"
              size="md"
              primaryText="Space UI"
              className="select-none bg-background border-none cursor-pointer transition-colors"
              secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
            >
              Built for Next.js &amp; Base UI
              <AssetEmoji codepoint="🚀" source={EmojiSource.Fluent} type={EmojiType.Anim} size={22} lazy={false} />
            </StatusBadge>
          </Link>

          {/* ── Main Headline ── */}
          <h1 className="mt-7 max-w-5xl text-balance text-[42px] font-semibold tracking-tight leading-[1.05] text-foreground sm:text-[64px] md:text-[76px] lg:text-[84px]">
            Ship your ideas
            <div className="relative inline-flex items-center justify-center size-12 sm:size-16 md:size-20 lg:size-24 shrink-0 overflow-visible">
              {/* <Avatar name="p" variant="ghost" size={avatarSize} circle /> */}
              <Avatar name="c" variant="lumina" size={avatarSize} circle />
            </div>
            faster
            <br />
            with
            {/* <div className="relative inline-flex items-center justify-center size-24 -bottom-1.25 shrink-0 overflow-visible">
              <Squishmoji
                seed="o"
                shape="lion"
                expression="loving"
                backgroundStyle="all"
                animate
                animOnClick
                animOnHover
                // animWobble
                size={110}
                className="scale-175 origin-center transition-transform"
              />
            </div>{' '} */}
            <div className="relative inline-flex items-center justify-center size-12 sm:size-16 md:size-20 lg:size-24 shrink-0 overflow-visible">
              <Avatar name="c" variant="doodle" size={avatarSize} circle />
            </div>
            better UI
            <div className="relative inline-flex items-center justify-center size-12 sm:size-16 md:size-20 lg:size-24 shrink-0 overflow-visible">
              <Avatar name="c" variant="pebble" size={avatarSize} circle />
            </div>
            {/* <span className="inline-flex leading-1">😍</span> */}
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
            {/* <Button
              render={<Link href="/components" />}
              data-space-hover
              data-space-click="confirm"
              className="inline-flex items-center gap-2 px-6 py-3.5 font-medium active:scale-[0.98] transition-all duration-300"
            >
              <span>Explore registry items</span>
              <ArrowUpRight className="size-4" />
            </Button> */}
            <span className="relative inline-flex group">
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
                <span>Explore registry items</span>
                <ArrowUpRight className="size-4" />
              </Button>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
