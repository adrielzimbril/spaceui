'use client'

import * as React from 'react'
import { IconBrandX } from '@tabler/icons-react'
import { Avatar } from '@usespaceui/avatars/react'
import type { AvatarVariant } from '@usespaceui/avatars'
import { Frame, FrameTitle, FrameDescription, FrameFooter } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'

interface Testimonial {
  name: string
  handle: string
  role: string
  avatarSeed: string
  avatarVariant: AvatarVariant
  text: string
  badge?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Swami Malode',
    handle: '@swamimalode',
    role: 'Creator of Rare UI',
    avatarSeed: 'swami',
    avatarVariant: 'lumina',
    text: 'The micro-interactions, Base UI foundations, and sound physics in Space UI are insane. Installing fluid shaders with the shadcn CLI is the future.',
    badge: 'Design Engineer',
  },
  {
    name: 'Pranav Mailarpawar',
    handle: '@pranvtwt',
    role: 'Founder at ihatepdf.cv',
    avatarSeed: 'pranav',
    avatarVariant: 'shaula',
    text: 'Finally a UI library that prioritizes tactile satisfaction. The generative deterministic avatars and squircle worklet saved us weeks of custom engineering.',
    badge: 'Founder',
  },
  {
    name: 'Feichuan',
    handle: '@feichuan',
    role: 'Frontend Architect',
    avatarSeed: 'feichuan',
    avatarVariant: 'pebble',
    text: '每一个组件都很精致且独特 (Every component is delicate and unique). Using shadcn CLI to pull in Base UI + Motion code gives total control over the codebase.',
    badge: 'Architect',
  },
  {
    name: 'Alexandre Roy',
    handle: '@alexroy_dev',
    role: 'Senior Next.js Engineer',
    avatarSeed: 'alexandre',
    avatarVariant: 'doodle',
    text: 'The Model Context Protocol integration is game-changing. Cursor pulls the exact typed schemas from @spaceui/mcp without a single hallucinated prop.',
    badge: 'AI Engineer',
  },
  {
    name: 'Di Zhang',
    handle: '@di_zhang_fdu',
    role: 'ex-NVIDIA, Tech Lead',
    avatarSeed: 'dizhang',
    avatarVariant: 'singularity',
    text: 'Space UI is a masterclass in modern craft: unstyled Base UI under the hood, tuned spring curves, and zero MP3 procedural audio via Web Audio.',
    badge: 'Tech Lead',
  },
  {
    name: 'Elena Rostova',
    handle: '@elena_ui',
    role: 'Product Designer at Velo',
    avatarSeed: 'elena',
    avatarVariant: 'critter',
    text: 'Our team completely switched from heavy component packages to Space UI copy-paste primitives. The Tailwind v4 token system works seamlessly in dark mode.',
    badge: 'Product Designer',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-20">
      {/* ── Section Header ── */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <span>Loved by builders who ship</span>
        </div>
        <h2 className="mt-3 text-[34px] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[46px]">
          Engineered for developers.
          <br />
          <span className="text-muted-foreground">Loved by designers.</span>
        </h2>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Designers and engineers ship Space UI in real products across the web.
        </p>
      </div>

      {/* ── Testimonials Grid using Frame + Card (Content first, author footer at the bottom) ── */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Frame key={t.handle} className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
              <CardPanel className="flex-1 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              </CardPanel>
            </Card>

            <FrameFooter className="flex flex-row items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-muted bg-muted">
                  <Avatar name={t.avatarSeed} variant={t.avatarVariant} size={36} circle />
                </div>
                <div>
                  <FrameTitle className="text-sm font-semibold">{t.name}</FrameTitle>
                  <FrameDescription className="text-xs">{t.handle}</FrameDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {t.badge && (
                  <span className="hidden sm:inline-flex rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {t.badge}
                  </span>
                )}
                <IconBrandX className="size-4 text-muted-foreground/60" />
              </div>
            </FrameFooter>
          </Frame>
        ))}
      </div>
    </section>
  )
}
