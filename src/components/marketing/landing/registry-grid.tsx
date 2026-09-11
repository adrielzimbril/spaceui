'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  Copy,
  RotateCcw,
  Terminal,
} from 'lucide-react'
import { motion } from 'motion/react'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { OrbBloop } from '@/registry/components/orb/bloop'
import { BloopState } from '@/registry/components/orb/bloop/types'
import { BLOOP_PALETTES, BloopPaletteName } from '@/registry/components/orb/bloop/palettes'
import { OrbSmooth } from '@/registry/components/orb/smooth'
import { BouncyAccordion } from '@/registry/components/spaceui/bouncy-accordion'
import { WordsPreloader } from '@/registry/components/spaceui/words-preloader'
import { Avatar } from '@usespaceui/avatars/react'
import type { AvatarVariant } from '@usespaceui/avatars'
import { Frame, FrameHeader, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { registryStats } from '@/__registry__/stats'
import { sparkle } from '@usespaceui/sounds'
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

const SMOOTH_LUMINA_SEEDS = [
  'luna',
  'atlas',
  'aurora',
  'orion',
  'nova',
  'sol',
  'echo',
  'iris',
] as const

const ZERO_LOCKIN_ITEMS = [
  {
    name: 'orb-bloop.tsx',
    pkg: '@spaceui/bloop',
    desc: 'Fluid GLSL shader primitive',
  },
  {
    name: 'bouncy-accordion.tsx',
    pkg: '@spaceui/bouncy-accordion',
    desc: 'Headless spring accordion',
  },
  {
    name: 'words-preloader.tsx',
    pkg: '@spaceui/words-preloader',
    desc: 'Dynamic typography reveal',
  },
  {
    name: 'squircle.tsx',
    pkg: '@spaceui/squircle',
    desc: 'Continuous curvature component',
  },
] as const

type PackageManagerType = 'pnpm' | 'npm' | 'bun'

function ZeroLockinPreview() {
  const [selectedPm, setSelectedPm] = React.useState<PackageManagerType>('pnpm')
  const [itemIndex, setItemIndex] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  // Auto-cycle through showcased files every BENTO_CYCLE_INTERVAL
  React.useEffect(() => {
    const timer = setInterval(() => {
      setItemIndex((prev) => (prev + 1) % ZERO_LOCKIN_ITEMS.length)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const current = ZERO_LOCKIN_ITEMS[itemIndex]

  const getCommand = (pm: PackageManagerType, pkg: string) => {
    switch (pm) {
      case 'pnpm':
        return `pnpm dlx shadcn@latest add ${pkg}`
      case 'bun':
        return `bunx --bun shadcn@latest add ${pkg}`
      case 'npm':
      default:
        return `npx shadcn@latest add ${pkg}`
    }
  }

  const fullCommand = getCommand(selectedPm, current.pkg)

  const handleCopy = () => {
    tickSound()
    navigator.clipboard.writeText(fullCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {/* CLI Installation Box */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['pnpm', 'npm', 'bun'] as const).map((pm) => (
              <Button
                key={pm}
                variant={selectedPm === pm ? 'default' : 'ghost'}
                size="xs"
                onClick={() => {
                  tickSound()
                  setSelectedPm(pm)
                }}
                className={cn(
                  'cursor-pointer',
                  selectedPm === pm
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {pm}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            title="Copy command"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <MorphIcon activeKey={copied ? 'copied' : 'copy'} variant="blur-scale" duration={0.2}>
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </MorphIcon>
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 border border-border/40">
          <Terminal className="size-3.5 text-muted-foreground shrink-0" />
          <code className="text-xs text-foreground font-mono truncate">
            {fullCommand}
          </code>
        </div>
      </div>

      {/* Target File in Repository */}
      <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">
            src/components/spaceui/{current.name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {current.desc}
          </span>
        </div>
        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 shrink-0">
          Yours to edit
        </span>
      </div>

      {/* Tenets */}
      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>0 locked runtime</span>
        <span>•</span>
        <span>Base UI core</span>
        <span>•</span>
        <span>Tailwind CSS tokens</span>
      </div>
    </div>
  )
}

export function RegistryGrid() {
  // Interactive states
  const [bloopState, setBloopState] = React.useState<BloopState>(BloopState.idle)

  // Auto-cycle bloop mode every BENTO_CYCLE_INTERVAL without buttons
  React.useEffect(() => {
    const modes: BloopState[] = [
      BloopState.idle,
      BloopState.listen,
      BloopState.think,
      BloopState.speak,
    ]
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

  const [avatarInput, setAvatarInput] = React.useState('spaceui')
  const [metalHover, setMetalHover] = React.useState(false)

  // Words Preloader continuous loop: runs words animation, pauses briefly on blur morph preview, then repeats
  const [preloaderKey, setPreloaderKey] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPreloaderKey((prev) => prev + 1)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const AVATAR_VARIANTS: AvatarVariant[] = [
    'pebble',
    'lumina',
    'splash',
    'critter',
    'invader',
    'animals',
  ]


  return (
    <section
      id="registry"
      data-page-section
      className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20"
    >
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
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4">
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
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center p-4">
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

        {/* ── Card 3: Deterministic Avatars ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Generative Avatars</FrameTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="icon-xs"
                onClick={() => {
                  tickSound()
                  setAvatarInput(Math.random().toString(36).slice(2, 8))
                }}
                data-space-hover
                title="Randomize avatars"
                className="rounded-full cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Link
                href="/tools/avatars"
                data-space-hover
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 flex-col justify-center gap-3">
              <div className="grid grid-cols-3 gap-y-6 gap-x-2 w-full items-center justify-items-center">
                {AVATAR_VARIANTS.map((variant) => (
                  <div
                    key={variant}
                    onClick={() => {
                      tickSound()
                      setAvatarInput(Math.random().toString(36).slice(2, 8))
                    }}
                    className="group flex cursor-pointer flex-col items-center gap-2 p-1.5 select-none transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <div className="relative size-12 overflow-hidden rounded-full transition-transform duration-200 group-hover:scale-105">
                      <Avatar
                        name={`${avatarInput}-${variant}`}
                        variant={variant}
                        size={48}
                        circle
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground/80 group-hover:text-foreground capitalize transition-colors">
                      {variant}
                    </span>
                  </div>
                ))}
              </div>
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
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 items-center justify-center">
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

        {/* ── Card 5: Zero Lock-in ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Zero Lock-in</FrameTitle>
            <Link
              href="/docs/getting-started/installation"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 flex-col justify-center p-4">
              <ZeroLockinPreview />
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
          <Card className="flex-1 flex flex-col h-full overflow-hidden">
            <CardPanel className="flex-1 flex min-h-72 p-0 overflow-hidden relative">
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

        {/* ── Card 7: Squircle Smoothing ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Squircle</FrameTitle>
            <Link
              href="/docs/squircle"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-72 flex-col items-center justify-center gap-4">
              <div className="flex items-end justify-center gap-6">
                <div
                  onClick={() => tickSound()}
                  className="group flex flex-col items-center gap-2 cursor-pointer select-none"
                >
                  <div className="size-14 rounded-2xl group-hover:rounded-xl bg-muted flex items-center justify-center transition-all duration-300">
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Standard</span>
                  </div>
                  <span className="text-xs text-muted-foreground">CSS radius</span>
                </div>
                <div
                  onClick={() => tickSound()}
                  className="group flex flex-col items-center gap-2 cursor-pointer select-none"
                >
                  <div className="size-18 squircle-2xl group-hover:squircle-xl bg-primary flex items-center justify-center transition-all duration-300">
                    <span className="text-xs font-medium text-primary-foreground">
                      Squircle
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Continuous
                  </span>
                </div>
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── Card 7: COL-2 CARD AT THE END ── */}
        <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Composed Blocks &amp; Micro-Interactions</FrameTitle>
            <Link
              href="/blocks"
              data-space-hover
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex min-h-60 flex-col justify-center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-muted/40 p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">Interactive Surfaces</span>
                  <span className="text-xs text-muted-foreground">Tactile feedback with spring dynamics and Web Audio</span>
                </div>
                <Button
                  onMouseEnter={() => {
                    sparkle()
                    setMetalHover(true)
                  }}
                  onMouseLeave={() => setMetalHover(false)}
                  className={cn(
                    'rounded-xl px-5 py-2.5 font-medium text-xs transition-all duration-300 cursor-pointer',
                    metalHover
                      ? 'bg-foreground text-background scale-105'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  Liquid Metal Trigger
                </Button>
              </div>
            </CardPanel>
          </Card>
        </Frame>
      </div>

      {/* ── Real Registry Counters Strip ── */}
      <div className="mt-14 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            {registryStats.total}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Total Registry Items
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            {registryStats.primitives}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Base UI Primitives
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            {registryStats.components}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Interactive Components
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-6 sm:p-8">
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            {registryStats.hooks}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Production Hooks
          </p>
        </div>
      </div>

      {/* ── Bottom Directory Link ── */}
      <div className="mt-8 rounded-2xl bg-secondary/50 p-8 text-center sm:p-12">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to explore all {registryStats.total} registry items?
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Browse {registryStats.primitives} Base UI primitives, {registryStats.components} interactive components, {registryStats.hooks} production hooks, fluid shaders, and templates.
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
