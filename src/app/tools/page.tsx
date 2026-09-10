import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight, IconClock } from '@tabler/icons-react'
import { megaMenuTools, type ResourceItem } from '@/config/menu-config'
import { SiteFooter } from '@/components/layout/site-footer'
import { Badge } from '@/registry/primitives/badge'
import { Button } from '@/registry/primitives/button'
import { Surface } from '@/components/marketing/landing/surface'

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
      <main className="flex-1 px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-14">
        <div className="mx-auto w-full max-w-6xl">
          {/* Hero Banner with Space UI Surface */}
          <Surface innerClassName="flex flex-col items-start px-6 py-10 sm:px-10 sm:py-14" className="mb-12">
            <Badge variant="secondary" className="rounded-sm mb-4">
              Creative Tools & Playgrounds
            </Badge>

            <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl">
              Sensory utilities for creators & UI designers.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg">
              Explore generative deterministic avatars, fluent emojis, spatial web audio sounds, and image carousel
              slicers. All client-side, instant and zero-latency.
            </p>
          </Surface>

          {/* Active Tools Grid */}
          <div className="mb-14">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Available tools</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Interactive studios you can use right in your browser or install in your app.
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{availableTools.length} tools</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableTools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>

          {/* Upcoming Labs Grid */}
          {upcomingTools.length > 0 && (
            <div className="pt-8 border-t border-border/60">
              <div className="mb-6 flex items-center gap-2">
                <IconClock className="size-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold tracking-[-0.03em]">In development</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {upcomingTools.map((tool) => (
                  <Surface
                    key={tool.title}
                    innerClassName="flex flex-col justify-between p-4 min-h-36"
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div>
                      <div
                        className="mb-3 grid size-8 place-items-center rounded-md text-foreground"
                        style={{ backgroundColor: `${tool.color}35` }}
                      >
                        <tool.icon className="size-4" />
                      </div>
                      <h3 className="text-xs font-semibold">{tool.title}</h3>
                      <p className="mt-1 text-[0.6875rem] text-muted-foreground leading-snug line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <span className="mt-3 text-[0.625rem] font-medium text-muted-foreground/80 uppercase tracking-wider">
                      Coming soon
                    </span>
                  </Surface>
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

function ToolCard({ tool }: { tool: ResourceItem }) {
  const isExternal = tool.href.startsWith('http')

  return (
    <Link
      href={tool.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
      className="group outline-none"
      data-space-hover
      data-space-click="open"
    >
      <Surface
        innerClassName="flex min-h-48 flex-col justify-between p-5 transition-transform group-hover:scale-[0.99]"
        header={
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {tool.label ?? 'tool'}
            </span>
            {tool.release && (
              <Badge
                variant={tool.release === 'new' ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0 uppercase"
              >
                {tool.release}
              </Badge>
            )}
          </div>
        }
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground shadow-xs"
              style={{ backgroundColor: `${tool.color}30` }}
            >
              <tool.icon className="size-5" />
            </div>
            <h3 className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">{tool.description}</p>
        </div>

        <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/40">
          <span className="text-xs font-medium text-foreground group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            {isExternal ? 'Open external lab' : 'Open studio'}
            <IconArrowRight className="size-3.5" />
          </span>
        </div>
      </Surface>
    </Link>
  )
}

export const instant = false
