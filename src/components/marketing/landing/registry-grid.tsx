'use client'

import * as React from 'react'
import Link from 'next/link'
import { registryStats } from '@/__registry__/stats'
import { useInView } from '@/registry/hooks/animation/use-in-view'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { OrbBloopCard } from './bento/registry/orb-bloop-card'
import { OrbSmoothCard } from './bento/registry/orb-smooth-card'
import { BouncyAccordionCard } from './bento/registry/bouncy-accordion-card'
import { HandleReelCard } from './bento/registry/handle-reel-card'
import { LoadingOrbCard } from './bento/registry/loading-orb-card'
import { WordsPreloaderCard } from './bento/registry/words-preloader-card'
import { TimelineCard } from './bento/registry/timeline-card'
import { GitHubActivityCard } from './bento/registry/github-activity-card'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Button } from '@/registry/components/spaceui/button-squircle'

export function RegistryGrid() {
  const [ref, isVisible] = useInView({ rootMargin: '100px 0px', initialInView: true })

  return (
    <section ref={ref} id="registry" data-page-section className="mx-auto max-w-7xl scroll-mt-16 px-5 sm:px-6 py-20">
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <Link href="/components" data-space-hover className="outline-none">
          <Badge
            size="md"
            className="px-3.5 py-1.5 font-semibold text-xs tracking-tight bg-muted text-foreground border-none cursor-pointer"
          >
            Components
          </Badge>
        </Link>
        <div className="max-w-2xl">
          <Link
            href="/components"
            data-space-hover
            className="group inline-block focus-visible:outline-none cursor-pointer"
          >
            <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[46px] md:text-[54px] transition-colors group-hover:text-foreground/80">
              Component Registry
            </h2>
          </Link>
          <p className="mt-3 text-base text-muted-foreground">
            Explore animated primitives, shaders, and tactile components built with Base UI and Tailwind CSS.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <OrbBloopCard isVisible={isVisible} />
        <OrbSmoothCard isVisible={isVisible} />
        <BouncyAccordionCard />
        <HandleReelCard />
        <LoadingOrbCard />
        <WordsPreloaderCard isVisible={isVisible} />
        <TimelineCard />
        <GitHubActivityCard />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.primitives}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Base UI Primitives</p>
        </div>

        <div className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.components}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Interactive Components</p>
        </div>

        <div className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.templates}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Templates</p>
        </div>

        <div className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.hooksOnly}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Production Hooks</p>
        </div>
      </div>
      <div className="flex mt-4 justify-center self-center align-center">
        <Button
          render={<Link href="/components" />}
          size="sm"
          data-space-hover
          data-space-click="confirm"
          className="inline-flex items-center gap-2 px-6 py-3.5 font-medium active:scale-[0.98] transition-all duration-300"
        >
          <span>Explore</span>
          <IconArrowUpRight className="size-4" />
        </Button>
      </div>
    </section>
  )
}
