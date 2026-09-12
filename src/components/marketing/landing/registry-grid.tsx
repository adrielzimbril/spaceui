'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { OrbBloop } from '@/registry/components/orb/bloop'
import { BloopState } from '@/registry/components/orb/bloop/types'
import { BLOOP_PALETTES, BloopPaletteName } from '@/registry/components/orb/bloop/palettes'
import { OrbSmooth } from '@/registry/components/orb/smooth'
import { LoadingOrb } from '@/registry/components/orb/loading'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { WordsPreloader } from '@/registry/components/spaceui/words-preloader'
import { PinList } from '@/registry/components/spaceui/pin-list'
import {
  IconCheck,
  IconCircle,
  IconChevronRight,
  IconGitCommit,
  IconBug,
  IconBrandNpm,
  IconLock,
  IconSparkles,
} from '@tabler/icons-react'
import { Badge } from '@/registry/primitives/badge'
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/registry/components/spaceui/timeline'
import { Avatar as PrimitiveAvatar, AvatarFallback, AvatarImage } from '@/registry/primitives/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/primitives/collapsible'
import { Spinner } from '@/registry/primitives/spinner'
import { Frame, FrameHeader, FrameTitle, FramePanel } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { registryStats } from '@/__registry__/stats'
import { GitHubActivity } from '@/registry/components/spaceui/github-activity'
import { tickSound } from '@/components/providers/sound-provider'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { cn } from '@/registry/lib/utils'

const SMOOTH_STATES = [
  { id: 'pure', label: 'Pure Fluid · No Grain', speed: 3.2, watercolor: 0, timeScale: 1.1, grain: 0 },
  { id: 'watercolor-wash', label: 'Watercolor Wash', speed: 4.8, watercolor: 0.8, timeScale: 1.5, grain: 0 },
  { id: 'drift-grain', label: 'Soft Grain & Drift', speed: 2.8, watercolor: 0.25, timeScale: 1.0, grain: 0.45 },
  { id: 'glass', label: 'Glass Clear · No Grain', speed: 5.2, watercolor: 0.1, timeScale: 1.6, grain: 0 },
  { id: 'surge-pigment', label: 'Film Grain & Surge', speed: 6.5, watercolor: 0.85, timeScale: 2.0, grain: 0.75 },
  { id: 'watercolor-pure', label: 'Watercolor Silk · No Grain', speed: 3.6, watercolor: 0.5, timeScale: 1.2, grain: 0 },
] as const

const SMOOTH_LUMINA_SEEDS = ['luna', 'atlas', 'aurora', 'orion', 'nova', 'sol', 'echo', 'iris'] as const

const TAILWIND_COLORS = [
  { label: 'Foreground', className: 'text-foreground' },
  { label: 'Primary', className: 'text-primary' },
  { label: 'Emerald', className: 'text-emerald-500' },
  { label: 'Indigo', className: 'text-indigo-500' },
  { label: 'Amber', className: 'text-amber-500' },
  { label: 'Rose', className: 'text-rose-500' },
  { label: 'Cyan', className: 'text-cyan-500' },
]

const PIN_LIST_ITEMS = [
  {
    id: 1,
    name: 'Commit Zone',
    info: 'Code updates · Closes 9:00 PM',
    icon: IconGitCommit,
    pinned: true,
  },
  {
    id: 2,
    name: '404 Room',
    info: 'Fixing errors · Open 24 hours',
    icon: IconBug,
    pinned: true,
  },
  {
    id: 3,
    name: 'AI Studio',
    info: 'Generative models · Active now',
    icon: IconSparkles,
    pinned: false,
  },
]

const pipelineSteps = [
  {
    id: 1,
    title: 'Source Code Checkout',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://avatars.spaceui.one/v1?name=pluto&variant=shaula',
    },
    description: 'Successfully fetched latest changes from the main branch.',
  },
  {
    id: 2,
    title: 'Dependency Installation',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://avatars.spaceui.one/v1?name=neptune&variant=singularity',
    },
    description: 'All npm packages installed and cached for future builds.',
  },
  {
    id: 3,
    title: 'Unit & Integration Tests',
    user: {
      name: 'Michael Rodriguez',
      avatar: 'https://avatars.spaceui.one/v1?name=uranus&variant=triton',
    },
    description: 'Running 142 test suites across the entire codebase...',
  },
  {
    id: 4,
    title: 'Production Build',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://avatars.spaceui.one/v1?name=earth&variant=solar-flare',
    },
    description: 'Optimizing assets and generating static site pages.',
  },
]

type StepState = {
  status: 'completed' | 'active' | 'pending'
  duration: string
}

const PIPELINE_CYCLE: Array<{
  activeStep: number
  steps: StepState[]
  lines: [boolean, boolean, boolean]
  durationMs: number
}> = [
  // ── 0: Step 3 running (Canonical Demo 06 view) ──
  {
    activeStep: 3,
    durationMs: 3000,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, false],
  },
  // ── 1: Step 3 finishes, Line 2 fills DOWN towards Step 4 (Step 4 stays strictly PENDING) ──
  {
    activeStep: 3,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, true],
  },
  // ── 2: Line 2 reached Step 4! Step 4 now activates & runs ──
  {
    activeStep: 4,
    durationMs: 2800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'active', duration: 'Running' },
    ],
    lines: [true, true, true],
  },
  // ── 3: Step 4 completes! All 4 green and verified ──
  {
    activeStep: 4,
    durationMs: 3500,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'completed', duration: '2m 45s' },
    ],
    lines: [true, true, true],
  },
  // ── 4: Reset & new pipeline run! Step 1 runs ──
  {
    activeStep: 1,
    durationMs: 2400,
    steps: [
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [false, false, false],
  },
  // ── 5: Step 1 finishes, Line 0 fills DOWN towards Step 2 (Step 2 stays strictly PENDING) ──
  {
    activeStep: 1,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, false, false],
  },
  // ── 6: Line 0 reached Step 2! Step 2 now activates & runs ──
  {
    activeStep: 2,
    durationMs: 2600,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, false, false],
  },
  // ── 7: Step 2 finishes, Line 1 fills DOWN towards Step 3 (Step 3 stays strictly PENDING) ──
  {
    activeStep: 2,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, false],
  },
]

function StatusIcon({ status }: { status: string }) {
  return (
    <MorphIcon activeKey={status} variant="blur-scale" duration={0.25}>
      {status === 'completed' ? (
        <IconCheck className="size-3.5" />
      ) : status === 'active' ? (
        <Spinner className="size-3.5" />
      ) : (
        <IconCircle className="size-3.5" />
      )}
    </MorphIcon>
  )
}

function StatusBadge({ status, duration }: { status: string; duration: string }) {
  const variant = status === 'completed' ? 'success' : status === 'active' ? 'info' : 'warning'

  return (
    <Badge variant={variant} size="sm">
      {duration}
    </Badge>
  )
}

function AnimatedTimelinePreview() {
  const [cycleIndex, setCycleIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const current = PIPELINE_CYCLE[cycleIndex]

  React.useEffect(() => {
    if (isHovered) return

    const timer = setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % PIPELINE_CYCLE.length)
    }, current.durationMs)

    return () => clearTimeout(timer)
  }, [cycleIndex, isHovered, current.durationMs])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full max-w-lg select-none"
    >
      <Timeline value={current.activeStep}>
        {pipelineSteps.map((step, idx) => {
          const stepState = current.steps[idx]
          const isLineFilled = current.lines[idx] ?? false

          return (
            <TimelineItem key={step.id} step={step.id} className="ms-10 pb-5">
              <TimelineHeader>
                <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7 [&&]:!bg-primary/15 overflow-hidden rounded-full">
                  <motion.div
                    className="w-full bg-primary rounded-full origin-top"
                    initial={false}
                    animate={{
                      scaleY: isLineFilled ? 1 : 0,
                      opacity: isLineFilled ? 1 : 0,
                    }}
                    transition={{
                      scaleY: {
                        duration: isLineFilled ? 0.7 : 0.15,
                        ease: [0.16, 1, 0.3, 1],
                      },
                      opacity: {
                        duration: isLineFilled ? 0.05 : 0.15,
                      },
                    }}
                    style={{
                      height: '100%',
                      transformOrigin: 'top',
                    }}
                  />
                </TimelineSeparator>
                <div className="flex items-center gap-2">
                  <TimelineTitle className="text-sm font-semibold">{step.title}</TimelineTitle>
                  <StatusBadge status={stepState.status} duration={stepState.duration} />
                </div>
                <TimelineIndicator
                  className={cn(
                    'flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7 transition-all duration-300',
                    stepState.status === 'completed' && '[&&]:bg-primary [&&]:text-primary-foreground [&&]:ring-0',
                    stepState.status === 'active' &&
                      '[&&]:bg-primary [&&]:text-primary-foreground ring-primary/20 ring-2',
                    stepState.status === 'pending' && '[&&]:bg-muted [&&]:text-muted-foreground [&&]:ring-0',
                  )}
                >
                  <StatusIcon status={stepState.status} />
                </TimelineIndicator>
              </TimelineHeader>
              <TimelineContent className="mt-1.5">
                <Frame>
                  <Collapsible defaultOpen className="group/collapsible">
                    <CollapsibleTrigger onClick={() => tickSound()} className="flex w-full cursor-pointer">
                      <FrameHeader className="flex grow flex-row items-center justify-between gap-2 p-1.5">
                        <div className="flex items-center gap-2">
                          <PrimitiveAvatar className="size-5">
                            <AvatarImage src={step.user.avatar} alt={step.user.name} />
                            <AvatarFallback>{step.user.name.charAt(0)}</AvatarFallback>
                          </PrimitiveAvatar>
                          <span className="text-muted-foreground text-xs font-medium">{step.user.name}</span>
                        </div>
                        <IconChevronRight className="text-muted-foreground size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                      </FrameHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <FramePanel className="p-2.5">
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                      </FramePanel>
                    </CollapsibleContent>
                  </Collapsible>
                </Frame>
              </TimelineContent>
            </TimelineItem>
          )
        })}
      </Timeline>
    </div>
  )
}

export function RegistryGrid() {
  // Interactive states
  const [bloopState, setBloopState] = React.useState<BloopState>(BloopState.idle)

  // Auto-cycle bloop mode every BENTO_CYCLE_INTERVAL without buttons
  React.useEffect(() => {
    const modes: BloopState[] = [BloopState.idle, BloopState.listen, BloopState.think, BloopState.speak]
    const timer = setInterval(() => {
      setBloopState((prev) => {
        const nextIdx = (modes.indexOf(prev) + 1) % modes.length
        return modes[nextIdx]
      })
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // Auto-cycle OrbSmooth states every BENTO_CYCLE_INTERVAL; after all states complete, change background avatar seed (only lumina)
  const [smoothStateIndex, setSmoothStateIndex] = React.useState(0)
  const [smoothSeedIndex, setSmoothSeedIndex] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSmoothStateIndex((prev) => {
        const next = (prev + 1) % SMOOTH_STATES.length
        if (next === 0) {
          setSmoothSeedIndex((s) => (s + 1) % SMOOTH_LUMINA_SEEDS.length)
        }
        return next
      })
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // Words Preloader continuous loop: runs words animation, pauses briefly on blur morph preview, then repeats
  const [preloaderKey, setPreloaderKey] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPreloaderKey((prev) => prev + 1)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="registry" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
      {/* ── Centered Section Header with Hidden Link to /components ── */}
      <div className="flex flex-col items-center justify-center text-center">
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

      {/* ── Bento Grid using Official Frame + Card Primitive (demo-p-card-10) ── */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* ── Card 1: WebGL OrbBloop ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Orb Bloop</FrameTitle>
            <Link
              href="/components/orb/bloop"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
              <OrbBloop
                size={190}
                state={bloopState}
                audioMode="ambient"
                bloopColorMain={BLOOP_PALETTES[BloopPaletteName.blue].main}
                bloopColorLow={BLOOP_PALETTES[BloopPaletteName.blue].low}
                bloopColorMid={BLOOP_PALETTES[BloopPaletteName.blue].mid}
                bloopColorHigh={BLOOP_PALETTES[BloopPaletteName.blue].high}
                watercolorStrength={0.5}
              />
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 2: WebGL OrbSmooth (Only Lumina) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Orb Smooth</FrameTitle>
            <Link
              href="/components/orb/smooth"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4 rounded-lg">
              <OrbSmooth
                key={SMOOTH_LUMINA_SEEDS[smoothSeedIndex]}
                size={190}
                textureUrl={`https://avatars.spaceui.one/v1?name=${SMOOTH_LUMINA_SEEDS[smoothSeedIndex]}&variant=lumina&size=2000&format=png`}
                audioMode="ambient"
                fbmSpeed={SMOOTH_STATES[smoothStateIndex].speed}
                watercolorStrength={SMOOTH_STATES[smoothStateIndex].watercolor}
                timeScale={SMOOTH_STATES[smoothStateIndex].timeScale}
                grainOpacity={SMOOTH_STATES[smoothStateIndex].grain}
                grainAnimated={SMOOTH_STATES[smoothStateIndex].grain > 0}
              />
            </CardPanel>
          </Card>
        </Frame>
        {/* ── Card 4: Bouncy Accordion ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Bouncy Accordion</FrameTitle>
            <Link
              href="/components/bouncy-accordion"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 items-center justify-center rounded-lg">
              <div className="w-full">
                <BouncyAccordion
                  items={[
                    {
                      title: 'Base UI Primitives',
                      description: 'Accessible, unstyled headless component core.',
                    },
                    {
                      title: 'Spring Curves',
                      description: 'Calculated dynamically via Motion with zero linear easing.',
                    },
                    {
                      title: 'Zero Lock-in',
                      description: 'Drop the TypeScript file directly into your repository.',
                    },
                  ]}
                />
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 5: Pin List ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Pin List</FrameTitle>
            <Link
              href="/components/pin-list"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 flex-col justify-center p-3 sm:p-4 rounded-lg">
              <div className="w-full max-w-sm mx-auto">
                <PinList items={PIN_LIST_ITEMS} className="gap-3.5" />
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 3: Demo C Orb Loading 03 ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Demo C Orb Loading 03</FrameTitle>
            <Link
              href="/components/loading"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 flex-wrap items-center justify-center gap-5 sm:gap-6 p-4 rounded-lg">
              {TAILWIND_COLORS.map(({ label, className }) => (
                <div key={label} className="flex flex-col items-center gap-2 select-none">
                  <div className="flex items-center justify-center">
                    <LoadingOrb className={className} size={44} speed={750} />
                  </div>
                  <span className="text-xs font-medium tracking-tight text-muted-foreground">{label}</span>
                </div>
              ))}
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 6: Words Preloader ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Words Preloader</FrameTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="icon-xs"
                onClick={() => {
                  tickSound()
                  setPreloaderKey((prev) => prev + 1)
                }}
                data-space-hover
                title="Replay animation"
                className="rounded-full cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Link
                href="/components/spaceui/words-preloader"
                data-space-hover
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 p-0 overflow-hidden relative rounded-lg">
              <div className="relative w-full h-full min-h-72 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-muted/10">
                <WordsPreloader
                  key={preloaderKey}
                  words={['Hello', 'Bonjour', 'Ciao', 'Space UI']}
                  duration={1800}
                  className="h-full min-h-72 w-full"
                >
                  {/* Smooth Motion blur morph reveal with zero text and zero fake orbs */}
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex size-full items-center justify-center p-6 will-change-[opacity,transform,filter]"
                  >
                    <div className="relative flex w-full max-w-[220px] flex-col gap-3 rounded-2xl bg-card p-4">
                      <div className="h-4 w-28 rounded-lg bg-foreground/10" />
                      <div className="space-y-2">
                        <div className="h-2.5 w-full rounded-md bg-foreground/5" />
                        <div className="h-2.5 w-4/5 rounded-md bg-foreground/5" />
                        <div className="h-2.5 w-3/5 rounded-md bg-foreground/5" />
                      </div>
                      <div className="mt-1 flex items-center justify-between pt-2 border-t border-border/40">
                        <div className="h-3 w-12 rounded bg-foreground/10" />
                        <div className="h-6 w-16 rounded-lg bg-primary/20" />
                      </div>
                    </div>
                  </motion.div>
                </WordsPreloader>
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 7: Timeline (Demo C Timeline 06) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Timeline</FrameTitle>
            <Link
              href="/components/timeline"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 max-h-72 overflow-y-auto p-2 sm:p-3 rounded-lg [&::-webkit-scrollbar]:hidden">
              <AnimatedTimelinePreview />
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 7: GitHub Activity ── */}
        <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>GitHub Activity</FrameTitle>
            <Link
              href="/components/github-activity"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex min-h-60 flex-col justify-center p-4 sm:p-6 rounded-lg">
              <GitHubActivity user="usespaceui" shape="rounded" />
            </CardPanel>
          </Card>
        </Frame>
      </div>

      {/* ── Real Registry Counters Strip ── */}
      <div className="mt-14 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.total}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Total Registry Items</p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.primitives}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Base UI Primitives</p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.components}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Interactive Components</p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">{registryStats.hooks}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Production Hooks</p>
        </div>
      </div>

      {/* ── Bottom Directory Link ── */}
      <div className="mt-8 rounded-2xl bg-secondary/50 p-8 text-center sm:p-12">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to explore all {registryStats.total} registry items?
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Browse {registryStats.primitives} Base UI primitives, {registryStats.components} interactive components,{' '}
          {registryStats.hooks} production hooks, fluid shaders, and templates.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/components"
            data-space-hover
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            <span>Open Component Directory</span>
            <ArrowUpRight className="size-4" />
          </Link>
          <Link
            href="/primitives"
            data-space-hover
            className="inline-flex items-center gap-1.5 rounded-xl bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>Base UI Primitives</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
