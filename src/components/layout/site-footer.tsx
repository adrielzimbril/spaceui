'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  IconArrowUp,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandX,
  IconSparkles,
} from '@tabler/icons-react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { StatusBadge } from '@/registry/components/spaceui/status-badge'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { siteConfig } from '@/config/space-config'
import { tickSound } from '@/components/providers/sound-provider'
import { turn as turnSound } from '@usespaceui/sounds'

interface FooterLinkItem {
  label: string
  href: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning'
  isExternal?: boolean
}

interface FooterGroup {
  title: string
  links: FooterLinkItem[]
}

const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'Primitives & UI',
    links: [
      { label: 'Primitives', href: '/primitives' },
      { label: 'Components', href: '/components' },
      { label: 'Blocks', href: '/blocks' },
      { label: 'Sensory Hooks', href: '/hooks' },
      { label: 'Theme Customizer', href: '/customize' },
    ],
  },
  {
    title: 'Creative Studios',
    links: [
      { label: 'UI Avatars', href: '/tools/avatars', badge: 'Updated', badgeVariant: 'info' },
      { label: 'Squishmoji', href: '/tools/squishmoji', badge: 'New', badgeVariant: 'success' },
      { label: 'Fluent Emoji', href: '/tools/emoji' },
      {
        label: 'Procedural Audio',
        href: 'https://sounds.spaceui.one',
        isExternal: true,
      },
      { label: 'Image Slicer', href: '/tools/imagesplit' },
      { label: 'World Flags', href: '/tools/flags' },
      { label: 'All Creative Tools', href: '/tools' },
    ],
  },
  {
    title: 'Showcase & AI',
    links: [
      { label: 'Showcase Gallery', href: '/showcase', badge: 'Featured', badgeVariant: 'default' },
      { label: 'AI & MCP Protocol', href: '/docs/mcp', badge: 'New', badgeVariant: 'success' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Changelog', href: '/docs/changelog' },
    ],
  },
]

export function SiteFooter() {
  const scrollToTop = () => {
    tickSound()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative w-full overflow-hidden pt-12 pb-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Outer squircle container matching Marketing hero & sections */}
        <div className="rounded-5xl bg-muted p-6 sm:p-10 lg:p-12 transition-colors">
          {/* Top Banner: Ecosystem Headline & CLI Install */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-10 border-b border-border/40">
            <div className="space-y-3 max-w-xl">
              <Link href="/docs" className="inline-flex items-center group outline-none" onClick={() => turnSound('back')}>
                <StatusBadge
                  variant="outline"
                  status="online"
                  size="md"
                  primaryText="Space UI"
                  className="select-none bg-background border-none cursor-pointer transition-colors"
                  secondaryTextClassName="inline-flex items-center gap-1.5 pr-1"
                >
                  <span>Built for Next.js &amp; Base UI</span>
                  <IconSparkles className="size-3.5 text-primary inline" />
                </StatusBadge>
              </Link>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                Ship your ideas faster with better UI.
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Open-source design library for humans and AI. Tactile motion primitives, Base UI foundations,
                and procedural sensory experiences.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick install
              </span>
              <InlineInstallBar packageName="orb-bloop" isShadcn className="w-full" />
            </div>
          </div>

          {/* Main Navigation Grid */}
          <div className="pt-10 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
            {/* Brand Column (spans 2 on desktop) */}
            <div className="sm:col-span-2 space-y-4 pr-0 sm:pr-6">
              <Link
                href="/"
                aria-label="Space UI home"
                onClick={() => turnSound('back')}
                className="inline-flex items-center gap-3 text-foreground group outline-none motion-safe:active:scale-[0.98] transition-transform"
              >
                <div className="relative flex items-center justify-center size-9 shrink-0 overflow-visible">
                  <Squishmoji
                    seed="o"
                    shape="lion"
                    expression="loving"
                    backgroundStyle="all"
                    animate
                    animOnClick
                    animOnHover
                    size={46}
                    className="relative scale-140 origin-center transition-transform"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight">Space UI</span>
              </Link>

              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-sm">
                Sensory design system, accessible Base UI primitives, and zero-dependency creative studios.
                Copy and paste what you need, customize everything.
              </p>

              {/* Creator & Ecosystem Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={siteConfig.links.x}
                  target="_blank"
                  rel="noreferrer"
                  data-space-hover
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-background/80 transition-colors shadow-2xs"
                >
                  <IconBrandX className="size-3.5" />
                  <span>@adrielzimbril</span>
                </a>

                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  data-space-hover
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-background/80 transition-colors shadow-2xs"
                >
                  <IconBrandGithub className="size-3.5" />
                  <span>GitHub</span>
                </a>

                <a
                  href="https://vercel.com/oss"
                  target="_blank"
                  rel="noreferrer"
                  data-space-hover
                  className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                >
                  <span>Vercel OSS</span>
                </a>
              </div>
            </div>

            {/* Links Columns */}
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {group.title}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => {
                    const isExt = link.isExternal || link.href.startsWith('http')
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          target={isExt ? '_blank' : undefined}
                          rel={isExt ? 'noreferrer noopener' : undefined}
                          data-space-hover
                          onClick={() => tickSound()}
                          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5 outline-none"
                        >
                          <span>{link.label}</span>
                          {link.badge && (
                            <Badge size="xs" variant={link.badgeVariant ?? 'default'}>
                              {link.badge}
                            </Badge>
                          )}
                          {isExt && (
                            <IconArrowUpRight className="size-3 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar / Sub-footer */}
          <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
              <span>© {new Date().getFullYear()} Space UI.</span>
              <span className="hidden sm:inline">·</span>
              <span>Crafted by adrielzimbril</span>
              <span className="hidden sm:inline">·</span>
              <span>Base UI &amp; Tailwind CSS</span>
              <span className="hidden sm:inline">·</span>
              <span>MIT License</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                data-space-hover
                data-space-click="confirm"
                className="h-8 gap-1.5 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              >
                <span>Back to top</span>
                <IconArrowUp className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
