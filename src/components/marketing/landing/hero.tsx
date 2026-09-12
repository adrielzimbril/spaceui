'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { IconBrandGithub } from '@tabler/icons-react'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { siteConfig } from '@/config/space-config'
import { registryStats } from '@/__registry__/stats'

export function Hero() {
  return (
    <section id="hero" data-page-section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* ── Background Ambient Glow & Grid ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div className="absolute left-1/2 -top-40 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-6">
        {/* ── Announcement Pill ── */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 transition-colors hover:bg-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium tracking-tight text-foreground">Space UI Registry 1.0</span>
            <span className="h-3 w-px bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground">Built for Next.js &amp; Base UI</span>
            <ArrowUpRight className="size-3 text-muted-foreground/70" />
          </div>

          {/* ── Main Headline ── */}
          <h1 className="mt-7 max-w-4xl text-balance text-[42px] font-semibold tracking-tight leading-[1.05] text-foreground sm:text-[64px] md:text-[76px] lg:text-[84px]">
            Ship your ideas faster
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/70 bg-clip-text text-transparent">
              with better UI.
            </span>
          </h1>

          {/* ── Subtitle ── */}
          <p className="mt-6 max-w-[58ch] text-balance text-lg leading-relaxed tracking-tight text-muted-foreground sm:text-xl">
            {siteConfig.description}
          </p>

          {/* ── Primary Actions ── */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/components"
              data-space-hover
              data-space-click="confirm"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
            >
              <span>Explore {registryStats.total} registry items</span>
              <ArrowUpRight className="size-4" />
            </Link>

            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              data-space-hover
              data-space-click="tap"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted active:scale-[0.98]"
            >
              <IconBrandGithub className="size-4" />
              <span>Star on GitHub</span>
              <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                ★ 1.4k
              </span>
            </a>
          </div>

          {/* ── Official Inline Install Bar ── */}
          <div className="mt-8 flex w-full max-w-xl justify-center">
            <InlineInstallBar packageName="orb-bloop" isShadcn className="w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
