'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { IconBrandGithub, IconBrandX } from '@tabler/icons-react'
import { Frame, FrameHeader, FrameTitle, FrameDescription, FrameFooter } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloomSound } from '@/components/providers/sound-provider'
import { siteConfig } from '@/config/space-config'
import { registryStats } from '@/__registry__/stats'

const INSTALL_CMD = 'pnpm dlx shadcn@latest add https://spaceui.one/r/orb-bloop'

export function FinalCta() {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_CMD)
    bloomSound()
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section
      id="join"
      data-page-section
      className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 pb-24 md:pb-32"
    >
      <div className="relative overflow-hidden rounded-3xl bg-secondary/40 p-8 sm:p-12 md:p-16">
        {/* Ambient radial gradient light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_70%)]"
        />

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>100% Free &amp; Open Source</span>
            </div>

            <h2 className="mt-5 text-[34px] font-semibold tracking-tight leading-[1.06] text-foreground sm:text-[48px] md:text-[56px]">
              Start building something
              <br />
              <span className="text-muted-foreground">expressive today.</span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Install a single primitive, drop in an audio-reactive WebGL shader, or connect your AI agent in under two minutes.
              No complex setup, zero runtime lock-in.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/components"
                data-space-hover
                data-space-click="confirm"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-95"
              >
                <span>Browse Components</span>
                <ArrowUpRight className="size-4" />
              </Link>

              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                data-space-hover
                className="inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-secondary"
              >
                <IconBrandGithub className="size-4" />
                <span>Star on GitHub</span>
              </a>

              <a
                href={siteConfig.links.x}
                target="_blank"
                rel="noreferrer"
                data-space-hover
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconBrandX className="size-3.5" />
                <span>@{siteConfig.author.name}</span>
              </a>
            </div>
          </div>

          {/* Right Column: High-craft Quick Install Card using demo-p-card-10 pattern (Frame + Card) */}
          <Frame>
            <FrameHeader>
              <FrameTitle>Space UI CLI</FrameTitle>
              <FrameDescription>Try your first primitive now</FrameDescription>
            </FrameHeader>

            <Card>
              <CardPanel className="flex flex-col gap-4">
                {/* Stat triplet */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { n: `${registryStats.total}`, l: 'Registry Items' },
                    { n: `${registryStats.packages}`, l: 'Packages' },
                    { n: '0', l: 'Lock-in' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        {s.n}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Instant install box */}
                <div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                    <code className="min-w-0 flex-1 truncate text-xs text-foreground">
                      <span className="select-none text-muted-foreground/50">$ </span>
                      {INSTALL_CMD}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleCopy}
                      data-space-hover
                      title="Copy install command"
                      className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardPanel>
            </Card>

            <FrameFooter>
              <p className="text-xs text-muted-foreground">
                Next.js 15+ · Base UI · Tailwind CSS v4 · TypeScript
              </p>
            </FrameFooter>
          </Frame>
        </div>
      </div>
    </section>
  )
}
