'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Frame, FrameHeader, FrameTitle, FrameDescription, FrameFooter } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloomSound } from '@/components/providers/sound-provider'
import { registryStats } from '@/__registry__/stats'

export function HowItWorks() {
  const [copied, setCopied] = React.useState(false)
  const installCmd = 'pnpm dlx shadcn@latest add https://spaceui.one/r/orb-bloop'

  const copyCommand = async () => {
    await navigator.clipboard.writeText(installCmd)
    bloomSound()
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="how-it-works" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
      {/* ── Section Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-foreground" />
            <span>Developer Experience</span>
          </div>
          <h2 className="mt-3 text-[34px] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[46px] md:text-[54px]">
            Zero lock-in.
            <br />
            <span className="text-muted-foreground">The source is yours.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Most UI libraries lock you behind bloated node_modules and breaking version bumps. Space UI places
            accessible, unstyled TypeScript code directly inside your repository.
          </p>
        </div>

        <Link
          href="/docs/getting-started/installation"
          data-space-hover
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
        >
          <span>Installation Guide</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      {/* ── 3 Visual Step Cards using demo-p-card-10 pattern (Frame + Card) ── */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {/* Step 1: Discover */}
        <Frame>
          <FrameHeader>
            <div className="flex items-center justify-between pb-1">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-foreground">
                01
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Discovery</span>
            </div>
            <FrameTitle>Browse &amp; Select</FrameTitle>
            <FrameDescription>
              Choose from {registryStats.total} registry items — including {registryStats.primitives} primitives,{' '}
              {registryStats.components} components, and {registryStats.hooks} production hooks.
            </FrameDescription>
          </FrameHeader>
          <Card>
            <CardPanel>
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
                    <span className="text-xs font-medium text-foreground">OrbBloop</span>
                    <span className="text-[10px] text-muted-foreground">WebGL</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-card/60 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">BouncyAccordion</span>
                    <span className="text-[10px] text-muted-foreground">Base UI</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-card/40 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground/60">WordsPreloader</span>
                    <span className="text-[10px] text-muted-foreground">Creative</span>
                  </div>
                </div>
              </div>
            </CardPanel>
          </Card>
          <FrameFooter>
            <p className="text-xs text-muted-foreground/70">WAI-ARIA accessible foundation</p>
          </FrameFooter>
        </Frame>

        {/* Step 2: Install */}
        <Frame>
          <FrameHeader>
            <div className="flex items-center justify-between pb-1">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-foreground">
                02
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70">CLI Registry</span>
            </div>
            <FrameTitle>Install in One Command</FrameTitle>
            <FrameDescription>
              Run the shadcn CLI or instruct your AI agent via MCP. Code is resolved directly from the Space UI
              registry.
            </FrameDescription>
          </FrameHeader>
          <Card>
            <CardPanel>
              <div className="rounded-xl bg-muted/40 p-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <span className="size-2 rounded-full bg-red-400/80" />
                  <span className="size-2 rounded-full bg-amber-400/80" />
                  <span className="size-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-1 text-[10px]">terminal</span>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-[11px]">
                  <p className="text-muted-foreground/70">
                    <span className="text-emerald-500">✔</span> Registry resolved
                  </p>
                  <p className="text-foreground">
                    <span className="text-primary font-semibold">$</span> shadcn add spaceui/bloop
                  </p>
                </div>
              </div>
            </CardPanel>
          </Card>
          <FrameFooter>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/70">pnpm · npm · bun · yarn</span>
              <Button
                variant="link"
                size="xs"
                onClick={copyCommand}
                className="h-auto! p-0 text-foreground cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy command'}
              </Button>
            </div>
          </FrameFooter>
        </Frame>

        {/* Step 3: Own */}
        <Frame>
          <FrameHeader>
            <div className="flex items-center justify-between pb-1">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-foreground">
                03
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Full Ownership</span>
            </div>
            <FrameTitle>Customize Forever</FrameTitle>
            <FrameDescription>
              The TypeScript file lives in your project. Change variables, tweak springs, or rename tokens anytime.
            </FrameDescription>
          </FrameHeader>
          <Card>
            <CardPanel>
              <div className="rounded-xl bg-muted/40 p-4 text-xs">
                <div className="text-muted-foreground">src/components/spaceui/</div>
                <div className="mt-2 flex flex-col gap-1 pl-3 text-foreground">
                  <div className="flex items-center justify-between">
                    <span>├── orb-bloop.tsx</span>
                    <span className="text-[10px] text-emerald-500">Yours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>├── bouncy-accordion.tsx</span>
                    <span className="text-[10px] text-emerald-500">Yours</span>
                  </div>
                  <div className="text-muted-foreground/50">
                    <span>└── squircle.tsx</span>
                  </div>
                </div>
              </div>
            </CardPanel>
          </Card>
          <FrameFooter>
            <p className="text-xs text-muted-foreground/70">Tailwind CSS v4 tokens</p>
          </FrameFooter>
        </Frame>
      </div>
    </section>
  )
}
