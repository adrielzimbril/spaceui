'use client'

import * as React from 'react'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { registryStats } from '@/__registry__/stats'
import projectsData from '@/data/projects.json'
import { useInView } from '@/registry/hooks/animation/use-in-view'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { megaMenuTools } from '@/config/menu-config'
import { OrbBloopCard } from './bento/registry/orb-bloop-card'
import { MorphingTextCard } from './bento/registry/morphing-text-card'
import { BouncyAccordionCard } from './bento/registry/bouncy-accordion-card'
import { HandleReelCard } from './bento/registry/handle-reel-card'
import { LoadingOrbCard } from './bento/registry/loading-orb-card'
import { WordsPreloaderCard } from './bento/registry/words-preloader-card'
import { TimelineCard } from './bento/registry/timeline-card'
import { GitHubActivityCard } from './bento/registry/github-activity-card'
import { AvatarsSquishmojiCard } from './bento/packages/avatars-squishmoji-card'
import { FlagsCard } from './bento/packages/flags-card'
import { EmojiCard } from './bento/packages/emoji-card'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Button } from '@/registry/components/spaceui/button-squircle'

export function RegistryGrid() {
  const [ref, isVisible] = useInView({ rootMargin: '80px 0px', initialInView: false })

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
        {/* <MorphingTextCard isVisible={isVisible} /> */}
        {/* <BouncyAccordionCard isVisible={isVisible} /> */}
        <HandleReelCard />
        <FlagsCard isVisible={isVisible} />
        <TimelineCard isVisible={isVisible} />
        <GitHubActivityCard isVisible={isVisible} />
        <AvatarsSquishmojiCard isVisible={isVisible} count={9} />
        <WordsPreloaderCard isVisible={isVisible} />
        <LoadingOrbCard isVisible={isVisible} />
        <EmojiCard isVisible={isVisible} />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Link href="/primitives" data-space-hover className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={isVisible ? registryStats.primitives : 0} />+
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Base UI Primitives</p>
        </Link>

        <Link href="/components" data-space-hover className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={isVisible ? registryStats.components : 0} />+
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Interactive Components</p>
        </Link>

        <Link href="/templates" data-space-hover className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={isVisible ? registryStats.templates + projectsData.projects.length : 0} />+
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Templates</p>
        </Link>

        <Link href="/hooks" data-space-hover className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={isVisible ? registryStats.hooksOnly : 0} />+
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Production Hooks</p>
        </Link>

        <Link href="/tools" data-space-hover className="rounded-2xl bg-muted p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={isVisible ? megaMenuTools.length : 0} />+
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Creative Tools</p>
        </Link>
      </div>
      <div className="flex mt-6 justify-center self-center align-center">
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
