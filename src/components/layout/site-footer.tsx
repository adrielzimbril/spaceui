'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/registry/lib/utils'
import { tickSound } from '@/components/providers/sound-provider'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

interface FooterLinkItem {
  label: string
  href: string
  isExternal?: boolean
  highlight?: boolean
}

interface FooterGroup {
  title: string
  links: FooterLinkItem[]
}

const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: 'UI Kit',
    links: [
      { label: 'Primitives', href: '/primitives' },
      { label: 'Components', href: '/components' },
      { label: 'Blocks', href: '/blocks' },
      { label: 'Templates', href: '/templates' },
      { label: 'Hooks & Utils', href: '/hooks' },
      { label: 'Showcase Gallery', href: '/showcase' },
      { label: 'Plans & Pricing', href: '/pricing', highlight: true },
    ],
  },
  {
    title: 'Creative Tools',
    links: [
      { label: 'UI Avatars', href: '/tools/avatars' },
      { label: 'Squishmoji', href: '/tools/avatars?type=squishmoji' },
      {
        label: 'Sounds',
        href: 'https://sounds.spaceui.one',
        isExternal: true,
      },
      { label: 'Emoji', href: '/tools/emoji' },
      { label: 'Image Split', href: '/tools/imagesplit' },
      { label: 'Flags', href: '/tools/flags' },
      { label: 'View all tools', href: '/tools', highlight: true },
    ],
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'MCP & AI Protocol', href: '/docs/mcp' },
      { label: 'Agent Skills', href: '/docs/skills' },
      { label: 'Iconography', href: '/docs/fundamentals/iconography' },
      { label: 'Changelog', href: '/docs/changelog' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Community Wall', href: '/community' },
      { label: 'GitHub', href: 'https://github.com/adrielzimbril/space-ui', isExternal: true },
      { label: 'X (Twitter)', href: 'https://x.com/adrielzimbril', isExternal: true },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/adrielzimbril', isExternal: true },
      { label: 'Roadmap', href: '/docs/roadmap' },
    ],
  },
]

export function SiteFooter() {
  const isDark = false
  return (
    <footer className="relative isolate z-10 w-full overflow-hidden pt-12" data-global-footer>
      <div className="relative z-30 mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] -bottom-0.75 max-w-7xl">
        <div
          className={cn(
            'relative z-10 squircle rounded-t-3xl sm:rounded-t-7xl p-4 md-p-6 text-foreground',
            isDark ? 'dark bg-zinc-950' : 'bg-muted',
          )}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 -left-6.5 w-7.5 h-6.5 overflow-visible z-10 sm:hidden"
            viewBox="0 0 30 26"
          >
            <path d="M 26 0 Q 26 26 0 26 H 30 V 0 Z" className={cn(isDark ? 'fill-zinc-950' : 'fill-muted')} />
          </svg>

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 -left-9.75 w-11 h-10 overflow-visible z-10 hidden sm:block"
            viewBox="0 0 44 40"
          >
            <path d="M 40 0 Q 40 40 0 40 H 44 V 0 Z" className={cn(isDark ? 'fill-zinc-950' : 'fill-muted')} />
          </svg>

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 -right-6.5 w-7.5 h-6.5 overflow-visible z-10 sm:hidden"
            viewBox="0 0 30 26"
          >
            <path d="M 4 0 Q 4 26 30 26 H 0 V 0 Z" className={cn(isDark ? 'fill-zinc-950' : 'fill-muted')} />
          </svg>

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 -right-9.75 w-11 h-10 overflow-visible z-10 hidden sm:block"
            viewBox="0 0 44 40"
          >
            <path d="M 4 0 Q 4 40 44 40 H 0 V 0 Z" className={cn(isDark ? 'fill-zinc-950' : 'fill-muted')} />
          </svg>

          <div
            className={cn(
              'relative border-4  squircle rounded-5xl z-10 p-6 sm:p-10 lg:p-12',
              isDark ? 'border-zinc-900' : 'border-background',
            )}
          >
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {FOOTER_GROUPS.map((group) => (
                <div key={group.title} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{group.title}</p>
                  <ul className="space-y-2.5">
                    {group.links.map((link) => {
                      const isExt = link.isExternal || link.href.startsWith('http')

                      return (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            target={isExt ? '_blank' : undefined}
                            rel={isExt ? 'noreferrer noopener' : undefined}
                            data-space-hover
                            onClick={() => tickSound()}
                            className={cn(
                              'group inline-flex items-center text-xs sm:text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5 outline-none',

                              link.highlight && 'text-foreground/90',
                            )}
                          >
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-6 border-t border-background/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="text-center sm:text-left">
                <span>
                  <span>© {new Date().getFullYear()} Space UI</span> <span>·</span>{' '}
                  <span>
                    Crafted with ❣️ by{' '}
                    <a
                      href="https://x.com/adrielzimbril"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Adriel Zimbril
                    </a>
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-center sm:text-right">
                <span>Base UI &amp; Tailwind CSS</span>
                <span>·</span>
                <Badge size="xs" variant="outline" className="bg-background!">
                  <span>MIT License</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docked bottom band - anchors footer to page bottom and accommodates floating nav */}
      <div
        className={cn('relative -mt-px h-10 sm:h-14 w-full', isDark ? 'dark bg-zinc-950' : 'bg-muted')}
        aria-hidden="true"
        data-footer-band
      />
    </footer>
  )
}
