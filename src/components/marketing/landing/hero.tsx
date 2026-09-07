'use client'

import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import { OrbSmooth } from '@/registry/components/orb/smooth'
import { Surface } from './surface'

export function Hero() {
  return (
    <section data-page-section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
      <h2 className="sr-only">Overview</h2>
      <div className="mx-auto w-full max-w-6xl">
        <Surface innerClassName="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.9fr)] lg:items-center lg:px-12 lg:py-14">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="rounded-sm">
              Space UI
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl">
              Control your interface down to the atom.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground text-pretty sm:text-lg">
              Primitives, composed patterns, and interactive blocks for Next.js. Hierarchy comes from stacking surfaces,
              not drop shadows. Change a variable once, and every screen follows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" data-space-hover data-space-click="confirm" render={<Link href="/docs" />}>
                Get started
                <IconArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                data-space-hover
                data-space-click="open"
                render={<Link href="/ui-kit/components" />}
              >
                Browse the kit
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-2xl bg-muted p-2">
              <div className="grid place-items-center rounded-[0.875rem] bg-background p-6">
                <OrbSmooth size={240} audioMode="ambient" grainAnimated watercolorStrength={0.5} />
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </section>
  )
}
