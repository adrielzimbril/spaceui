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
      { label: 'Showcase Gallery', href: '/showcase' },
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
      { label: 'Community Wall', href: '/community' },
      { label: 'GitHub', href: 'https://github.com/adrielzimbril/space-ui', isExternal: true },
      { label: 'X (Twitter)', href: 'https://x.com/adrielzimbril', isExternal: true },
      { label: 'LinkedIn', href: 'https://linkedin.com/c/spaceui', isExternal: true },
      { label: 'Roadmap', href: '/docs/roadmap' },
    ],
  },
]

function clampRadius(radius: number, width: number, height: number): number {
  return Math.max(0, Math.min(radius, width / 2, height / 2))
}

function createInverseBottomPath(width: number, height: number, radius: number): string {
  const r = clampRadius(radius, width, height)
  const i = height - r
  return `M ${r} 0 H ${width - r} A ${r} ${r} 0 0 1 ${width} ${r} V ${i} Q ${width} ${height} ${width + r} ${height} H ${-r} Q 0 ${height} 0 ${i} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`
}

function createInverseBottomStrokePath(width: number, height: number, radius: number): string {
  const r = clampRadius(radius, width, height)
  const i = height - r
  return `M ${-r} ${height} Q 0 ${height} 0 ${i} V ${r} A ${r} ${r} 0 0 1 ${r} 0 H ${width - r} A ${r} ${r} 0 0 1 ${width} ${r} V ${i} Q ${width} ${height} ${width + r} ${height}`
}

export function SiteFooter() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const fillPathRef = React.useRef<SVGPathElement>(null)
  const strokePathRef = React.useRef<SVGPathElement>(null)

  React.useLayoutEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const updatePaths = () => {
      const w = Math.round(container.offsetWidth)
      const h = Math.round(container.offsetHeight)
      if (w <= 0 || h <= 0) return

      const radius = w >= 640 ? 40 : 26
      const fill = createInverseBottomPath(w, h + 1, radius)
      const stroke = createInverseBottomStrokePath(w, h, radius)

      svg.setAttribute('width', `${w}`)
      svg.setAttribute('height', `${h}`)
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

      if (fillPathRef.current) fillPathRef.current.setAttribute('d', fill)
      if (strokePathRef.current) strokePathRef.current.setAttribute('d', stroke)
    }

    updatePaths()
    const ro = new ResizeObserver(() => {
      updatePaths()
    })
    ro.observe(container)
    window.addEventListener('resize', updatePaths)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updatePaths)
    }
  }, [])

  return (
    <footer className="relative isolate z-10 w-full overflow-hidden pt-12" data-global-footer>
      <div className="relative z-30 mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-7xl">
        <div
          ref={containerRef}
          className="relative z-10 dark squircle bg-zinc-950 rounded-t-3xl sm:rounded-t-7xl text-foreground"
        >
          <svg
            ref={svgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible z-0"
          >
            <path ref={fillPathRef} className="fill-zinc-950" />
            <path
              ref={strokePathRef}
              fill="none"
              className="stroke-white/15 dark:stroke-white/15"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
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

            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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
      <div className="relative z-20 -mt-px h-10 sm:h-14 w-full bg-zinc-950" aria-hidden="true" data-footer-band />
    </footer>
  )
}
