'use client'

import * as React from 'react'
import Image from 'next/image'
import { IconBrandX } from '@tabler/icons-react'
import { Frame, FrameHeader, FrameTitle, FrameDescription, FrameFooter } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'

interface Testimonial {
  name: string
  handle: string
  role: string
  avatar: string
  text: string
  badge?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Swami Malode',
    handle: '@swamimalode',
    role: 'Creator of Rare UI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    text: 'The micro-interactions, Base UI foundations, and sound physics in Space UI are insane. Installing fluid shaders with the shadcn CLI is the future.',
    badge: 'Design Engineer',
  },
  {
    name: 'Pranav Mailarpawar',
    handle: '@pranvtwt',
    role: 'Founder at ihatepdf.cv',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    text: 'Finally a UI library that prioritizes tactile satisfaction. The generative deterministic avatars and squircle worklet saved us weeks of custom engineering.',
    badge: 'Founder',
  },
  {
    name: 'Feichuan',
    handle: '@feichuan',
    role: 'Frontend Architect',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    text: '每一个组件都很精致且独特 (Every component is delicate and unique). Using shadcn CLI to pull in Base UI + Motion code gives total control over the codebase.',
    badge: 'Architect',
  },
  {
    name: 'Alexandre Roy',
    handle: '@alexroy_dev',
    role: 'Senior Next.js Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    text: 'The Model Context Protocol integration is game-changing. Cursor pulls the exact typed schemas from @spaceui/mcp without a single hallucinated prop.',
    badge: 'AI Engineer',
  },
  {
    name: 'Di Zhang',
    handle: '@di_zhang_fdu',
    role: 'ex-NVIDIA, Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=faces',
    text: 'Space UI is a masterclass in modern craft: unstyled Base UI under the hood, tuned spring curves, and zero MP3 procedural audio via Web Audio.',
    badge: 'Tech Lead',
  },
  {
    name: 'Elena Rostova',
    handle: '@elena_ui',
    role: 'Product Designer at Velo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    text: 'Our team completely switched from heavy component packages to Space UI copy-paste primitives. The Tailwind v4 token system works seamlessly in dark mode.',
    badge: 'Product Designer',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
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

      {/* ── Testimonials Grid using demo-p-card-10 pattern (Frame + Card) ── */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Frame key={t.handle} className="flex flex-col">
            <FrameHeader className="flex flex-row items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-full object-cover"
                />
                <div>
                  <FrameTitle className="text-sm font-semibold">{t.name}</FrameTitle>
                  <FrameDescription className="text-xs">{t.handle}</FrameDescription>
                </div>
              </div>
              <IconBrandX className="size-4 text-muted-foreground/60" />
            </FrameHeader>
            <Card className="flex-1">
              <CardPanel>
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              </CardPanel>
            </Card>
            <FrameFooter className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.role}</span>
              {t.badge && <span>{t.badge}</span>}
            </FrameFooter>
          </Frame>
        ))}
      </div>
    </section>
  )
}
