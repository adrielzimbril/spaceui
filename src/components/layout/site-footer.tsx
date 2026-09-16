'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/registry/lib/utils'
import { tickSound } from '@/components/providers/sound-provider'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { HeatShade } from '@/registry/components/shader/heat-shade'

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
    title: 'Library',
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

function relBox(el: Element, host: DOMRect) {
  const box = el.getBoundingClientRect()
  return {
    x: box.left - host.left,
    y: box.top - host.top,
    w: box.width,
    h: box.height,
  }
}

function squircleCorner(radius: number, n: number, t: number) {
  const c = Math.pow(Math.max(Math.cos(t), 0), 2 / n)
  const s = Math.pow(Math.max(Math.sin(t), 0), 2 / n)
  return { x: radius * c, y: radius * s }
}

function squircleTopPath(x: number, y: number, w: number, h: number, r: number, smooth = 0.85) {
  const radius = Math.max(0, Math.min(r, w / 2, h))
  const n = 2 + smooth * 2
  const steps = 24
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (Math.PI / 2)
    const p = squircleCorner(radius, n, t)
    points.push(`${x + radius - p.x} ${y + radius - p.y}`)
  }
  points.push(`${x + w - radius} ${y}`)
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI / 2 - (i / steps) * (Math.PI / 2)
    const p = squircleCorner(radius, n, t)
    points.push(`${x + w - radius + p.x} ${y + radius - p.y}`)
  }
  return `M ${x} ${y + h} L ${points.join(' L ')} L ${x + w} ${y + h} Z`
}

type ShadeClip = {
  shell: string
  band: { x: number; y: number; w: number; h: number }
  fillets: { d: string; x: number; y: number; scaleX: number; scaleY: number }[]
}

export function SiteFooter() {
  const isDark = false
  const hostRef = React.useRef<HTMLDivElement>(null)
  const clipId = React.useId().replace(/:/g, '')
  const [clip, setClip] = React.useState<ShadeClip | null>(null)

  React.useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const measure = () => {
      const hostBox = host.getBoundingClientRect()
      const shell = host.querySelector('[data-footer-shell]')
      const band = host.querySelector('[data-footer-band]')
      if (!shell || !band || hostBox.width < 1) return

      const shellBox = relBox(shell, hostBox)
      const bandBox = relBox(band, hostBox)
      const styles = getComputedStyle(shell)
      const radius = Number.parseFloat(styles.borderTopLeftRadius) || 24
      const smooth = Number.parseFloat(styles.getPropertyValue('--tw-squircle-smooth')) || 0.85
      const fillets = [...host.querySelectorAll('[data-footer-fillet]')].flatMap((node) => {
        if (!(node instanceof SVGSVGElement) || getComputedStyle(node).display === 'none') return []
        const path = node.querySelector('path')
        const d = path?.getAttribute('d')
        if (!d) return []
        const box = relBox(node, hostBox)
        const vb = node.viewBox.baseVal
        return [
          {
            d,
            x: box.x,
            y: box.y,
            scaleX: vb.width ? box.w / vb.width : 1,
            scaleY: vb.height ? box.h / vb.height : 1,
          },
        ]
      })

      setClip({
        shell: squircleTopPath(shellBox.x, shellBox.y, shellBox.w, shellBox.h, radius, smooth),
        band: bandBox,
        fillets,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <footer className="relative isolate z-10 w-full overflow-hidden pt-12" data-global-footer>
      <div ref={hostRef} className="relative">
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {clip ? <path d={clip.shell} /> : null}
            {clip ? <rect x={clip.band.x} y={clip.band.y} width={clip.band.w} height={clip.band.h} /> : null}
            {clip?.fillets.map((fillet, index) => (
              <path
                key={index}
                d={fillet.d}
                transform={`translate(${fillet.x} ${fillet.y}) scale(${fillet.scaleX} ${fillet.scaleY})`}
              />
            ))}
          </clipPath>
        </svg>
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-muted"
          style={clip ? { clipPath: `url(#${clipId})` } : { clipPath: 'inset(100%)' }}
        />
        {/* <HeatShade
            variant="licks"
            from="bottom"
            className="size-full opacity-70 dark:opacity-80"
            base="#2a7bba"
            hot="#43c8ff"
            speed={0.7}
            dpr={0.45}
            fps={24}
          />
        </div> */}
        <div className="relative z-10 mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] -bottom-0.75 max-w-7xl">
          <div
            data-footer-shell
            className="relative z-10 squircle rounded-t-3xl sm:rounded-t-7xl p-4 md-p-6 text-foreground"
          >
            <div
              className={cn(
                'relative border-4 bg-background/50 backdrop-blur-2xl squircle rounded-5xl z-10 p-6 sm:p-10 lg:p-12',
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
            <div className="pointer-events-none">
              <svg
                data-footer-fillet
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 -left-6.5 w-7.5 h-6.5 overflow-visible z-10 sm:hidden"
                viewBox="0 0 30 26"
              >
                <path d="M 26 0 Q 26 26 0 26 H 30 V 0 Z" className="fill-transparent" />
              </svg>

              <svg
                data-footer-fillet
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 -left-9.75 w-11 h-10 overflow-visible z-10 hidden sm:block"
                viewBox="0 0 44 40"
              >
                <path d="M 40 0 Q 40 40 0 40 H 44 V 0 Z" className="fill-transparent" />
              </svg>

              <svg
                data-footer-fillet
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 -right-6.5 w-7.5 h-6.5 overflow-visible z-10 sm:hidden"
                viewBox="0 0 30 26"
              >
                <path d="M 4 0 Q 4 26 30 26 H 0 V 0 Z" className="fill-transparent" />
              </svg>

              <svg
                data-footer-fillet
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 -right-9.75 w-11 h-10 overflow-visible z-10 hidden sm:block"
                viewBox="0 0 44 40"
              >
                <path d="M 4 0 Q 4 40 44 40 H 0 V 0 Z" className="fill-transparent" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative -mt-px h-10 sm:h-14 w-full" aria-hidden="true" data-footer-band />
      </div>
    </footer>
  )
}
