'use client'

import * as React from 'react'
import Link from 'next/link'
import { tickSound } from '@/components/providers/sound-provider'
import { Badge } from '@/registry/components/spaceui/badge-squircle'

interface FooterLinkItem {
  label: string
  href: string
  isExternal?: boolean
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
      { label: 'View all tools', href: '/tools' },
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
      { label: 'Showcase Gallery', href: '/showcase' },
      { label: 'GitHub', href: 'https://github.com/adrielzimbril/space-ui', isExternal: true },
      { label: 'X (Twitter)', href: 'https://x.com/adrielzimbril', isExternal: true },
      { label: 'Roadmap', href: '/docs/roadmap' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden pt-12 pb-32 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-5xl bg-muted p-6 sm:p-10 lg:p-12 transition-colors">
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
                          className="group inline-flex items-center text-xs sm:text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5 outline-none"
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

          <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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
    </footer>
  )
}
