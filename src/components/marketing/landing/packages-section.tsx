'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowUpRight, RotateCcw, Shuffle, Hand, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import type { SquishBackgroundStyle, SquishExpression } from '@usespaceui/squishmoji'
import { Avatar } from '@usespaceui/avatars/react'
import type { AvatarVariant } from '@usespaceui/avatars'
import Image from 'next/image'
import { Frame, FrameHeader, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloom, chime, droplet, sparkle, tap, tick } from '@usespaceui/sounds'
import { bloomSound, dropletSound, sparkleSound, tapSound, tickSound } from '@/components/providers/sound-provider'
import { AssetFlag } from '@/tools/flags/asset-flag'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { resolveEmojiUrl, EmojiFormat, EmojiSource, EmojiType } from '@usespaceui/emoji'
import { PlushEngine, loadPlushArtwork } from '@/tools/plush/engine'
import { DEFAULT_CONFIG, PLUSH_PRESETS } from '@/tools/plush/presets'
import type { PlushConfig, PlushPreset } from '@/tools/plush/types'
import { imagelib } from '@/lib/imagelib'
import { BENTO_CYCLE_INTERVAL, USER_INTERACTION_DEBOUNCE } from '@/config/space-config'
import { cn } from '@/registry/lib/utils'

// ── Showcase Presets for Plush ──
const SHOWCASE_PLUSH_PRESETS = PLUSH_PRESETS.filter((p) =>
  ['spaceui', 'logo', 'squish', 'invader', 'squiggle', 'kendo', 'doddle'].includes(p.id),
)

// ── Avatars & Squishmoji Showcase Data ──
const ALL_AVATAR_VARIANTS: AvatarVariant[] = ['pebble', 'lumina', 'splash', 'critter', 'invader', 'animals']

const ALL_SQUISH_EXPRS: Array<{
  expr: SquishExpression
  label: string
  shape: 'all'
  bg: SquishBackgroundStyle
}> = [
  { expr: 'happy', label: 'Happy', shape: 'all', bg: 'taygeta' },
  { expr: 'excited', label: 'Excited', shape: 'all', bg: 'maia' },
  { expr: 'amazed', label: 'Amazed', shape: 'all', bg: 'merope' },
  { expr: 'laughing', label: 'Laughing', shape: 'all', bg: 'alcyone' },
  { expr: 'loving', label: 'Loving', shape: 'all', bg: 'celaeno' },
  { expr: 'proud', label: 'Proud', shape: 'all', bg: 'solid' },
]

type MixedCharacter =
  | {
      id: string
      type: 'avatar'
      variant: AvatarVariant
      label: string
    }
  | {
      id: string
      type: 'squishmoji'
      expr: SquishExpression
      label: string
      shape: 'all'
      bg: SquishBackgroundStyle
    }

const INITIAL_CHARACTERS: MixedCharacter[] = [
  { id: '1', type: 'avatar', variant: 'pebble', label: 'Pebble' },
  { id: '2', type: 'squishmoji', expr: 'happy', label: 'Happy', shape: 'all', bg: 'taygeta' },
  { id: '3', type: 'avatar', variant: 'lumina', label: 'Lumina' },
  { id: '4', type: 'squishmoji', expr: 'excited', label: 'Excited', shape: 'all', bg: 'maia' },
  { id: '5', type: 'avatar', variant: 'critter', label: 'Critter' },
  { id: '6', type: 'squishmoji', expr: 'laughing', label: 'Laughing', shape: 'all', bg: 'alcyone' },
]

// ── Preset Images from ImageSplit Tool with Varied Columns (Internal only) ──
const DEFAULT_COLS_SEQUENCE = [3, 2, 4, 2, 4]

const SPLIT_SAMPLES: Array<{
  id: string
  url: string
  title: string
  defaultCols: number
}> = imagelib.tools.imagesplit.map((sample, idx) => ({
  id: sample.id,
  url: sample.url,
  title: sample.name,
  defaultCols: DEFAULT_COLS_SEQUENCE[idx % DEFAULT_COLS_SEQUENCE.length],
}))

// ── Curated Flag Sets for Auto-Cycle ──
const FLAG_SETS = [
  [
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'fr', name: 'France' },
    { code: 'de', name: 'Germany' },
    { code: 'jp', name: 'Japan' },
    { code: 'br', name: 'Brazil' },
  ],
  [
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'it', name: 'Italy' },
    { code: 'es', name: 'Spain' },
    { code: 'kr', name: 'South Korea' },
    { code: 'in', name: 'India' },
  ],
  [
    { code: 'ch', name: 'Switzerland' },
    { code: 'se', name: 'Sweden' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'no', name: 'Norway' },
    { code: 'mx', name: 'Mexico' },
    { code: 'za', name: 'South Africa' },
  ],
  [
    { code: 'pt', name: 'Portugal' },
    { code: 'ar', name: 'Argentina' },
    { code: 'ie', name: 'Ireland' },
    { code: 'sg', name: 'Singapore' },
    { code: 'eg', name: 'Egypt' },
    { code: 'nz', name: 'New Zealand' },
  ],
]

// ── Animated Emoji Styles & Catalog ──
const EMOJI_ANIM_STYLES = [
  { source: EmojiSource.Fluent, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Fluent' },
  { source: EmojiSource.Noto, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Noto' },
  { source: EmojiSource.Telegram, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Telegram' },
] as const

const ALL_ANIMATED_EMOJIS = [
  { char: '🔥', name: 'Fire' },
  { char: '🚀', name: 'Rocket' },
  { char: '✨', name: 'Sparkles' },
  { char: '🎉', name: 'Party' },
  { char: '💎', name: 'Diamond' },
  { char: '❤️', name: 'Heart' },
  { char: '🤩', name: 'Star Struck' },
  { char: '🥳', name: 'Partying' },
  { char: '😎', name: 'Cool' },
  { char: '😂', name: 'Joy' },
  { char: '🤯', name: 'Mind Blown' },
  { char: '⚡', name: 'Zap' },
  { char: '🍕', name: 'Pizza' },
  { char: '🥑', name: 'Avocado' },
  { char: '🦄', name: 'Unicorn' },
  { char: '👾', name: 'Alien Monster' },
  { char: '🤖', name: 'Robot' },
  { char: '👻', name: 'Ghost' },
  { char: '🐱', name: 'Cat' },
  { char: '🐶', name: 'Dog' },
  { char: '🦊', name: 'Fox' },
  { char: '🦁', name: 'Lion' },
  { char: '🐼', name: 'Panda' },
  { char: '🐨', name: 'Koala' },
  { char: '🦋', name: 'Butterfly' },
  { char: '🌺', name: 'Flower' },
  { char: '🌈', name: 'Rainbow' },
  { char: '⚽', name: 'Soccer' },
  { char: '🎮', name: 'Gaming' },
  { char: '🎨', name: 'Palette' },
  { char: '☕', name: 'Coffee' },
]

// ── Sound Demos ──
const SOUND_DEMOS = [
  { label: 'Bloom', fn: bloom, desc: 'Harmonic' },
  { label: 'Chime', fn: chime, desc: 'Bell' },
  { label: 'Sparkle', fn: sparkle, desc: 'Reward' },
  { label: 'Droplet', fn: droplet, desc: 'Liquid pop' },
  { label: 'Tap', fn: tap, desc: 'Button' },
  { label: 'Tick', fn: tick, desc: 'Click' },
]

// ── Interactive Squircle Swatch Component with ClassName ──
function SquircleSwatchItem({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      onClick={() => tickSound()}
      onMouseEnter={() => tickSound()}
      className={cn('size-11 cursor-pointer select-none transition-all duration-300', className)}
      {...props}
    />
  )
}

export function PackagesSection() {
  // ── Plush State ──
  const plushCanvasRef = React.useRef<HTMLDivElement>(null)
  const plushEngineRef = React.useRef<PlushEngine | null>(null)
  const [activePlushPreset, setActivePlushPreset] = React.useState<PlushPreset>(
    SHOWCASE_PLUSH_PRESETS[0] ?? PLUSH_PRESETS[0],
  )
  const [plushLoading, setPlushLoading] = React.useState(true)

  // ── Characters State ──
  const [charSeed, setCharSeed] = React.useState('space-packages')
  const [characters, setCharacters] = React.useState<MixedCharacter[]>(INITIAL_CHARACTERS)

  // ── Randomize Avatars & Squishmoji ──
  const randomizeCharacters = React.useCallback((playSound = false) => {
    if (playSound) {
      dropletSound()
    }
    const newSeed = Math.random().toString(36).slice(2, 8)
    setCharSeed(newSeed)

    const shuffledVariants = [...ALL_AVATAR_VARIANTS].sort(() => Math.random() - 0.5)
    const shuffledExprs = [...ALL_SQUISH_EXPRS].sort(() => Math.random() - 0.5)

    setCharacters([
      {
        id: '1',
        type: 'avatar',
        variant: shuffledVariants[0],
        label: shuffledVariants[0].charAt(0).toUpperCase() + shuffledVariants[0].slice(1),
      },
      {
        id: '2',
        type: 'squishmoji',
        ...shuffledExprs[0],
      },
      {
        id: '3',
        type: 'avatar',
        variant: shuffledVariants[1],
        label: shuffledVariants[1].charAt(0).toUpperCase() + shuffledVariants[1].slice(1),
      },
      {
        id: '4',
        type: 'squishmoji',
        ...shuffledExprs[1],
      },
      {
        id: '5',
        type: 'avatar',
        variant: shuffledVariants[2],
        label: shuffledVariants[2].charAt(0).toUpperCase() + shuffledVariants[2].slice(1),
      },
      {
        id: '6',
        type: 'squishmoji',
        ...shuffledExprs[2],
      },
    ])
  }, [])

  // ── Auto-cycle Characters every BENTO_CYCLE_INTERVAL ──
  React.useEffect(() => {
    const timer = setInterval(() => {
      randomizeCharacters(false)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [randomizeCharacters])

  // ── Auto-cycle Flags every BENTO_CYCLE_INTERVAL ──
  const [flagSetIndex, setFlagSetIndex] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setFlagSetIndex((prev) => (prev + 1) % FLAG_SETS.length)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // ── Auto-cycle Emoji Hub every BENTO_CYCLE_INTERVAL (cycles style: Fluent, Noto, Telegram & picks 6 new emojis) ──
  const [emojiStyleIdx, setEmojiStyleIdx] = React.useState(0)
  const [emojiOffset, setEmojiOffset] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setEmojiStyleIdx((prev) => (prev + 1) % EMOJI_ANIM_STYLES.length)
      setEmojiOffset((prev) => (prev + 6) % ALL_ANIMATED_EMOJIS.length)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const activeEmojiStyle = EMOJI_ANIM_STYLES[emojiStyleIdx]
  const currentEmojis = React.useMemo(() => {
    const items = []
    for (let i = 0; i < 6; i++) {
      items.push(ALL_ANIMATED_EMOJIS[(emojiOffset + i) % ALL_ANIMATED_EMOJIS.length])
    }
    return items
  }, [emojiOffset])

  // ── Image Split State ──
  const [splitCols, setSplitCols] = React.useState<number>(SPLIT_SAMPLES[0].defaultCols)
  const [splitSampleIdx, setSplitSampleIdx] = React.useState(0)

  // ── User Interaction Debounce Tracking ──
  const lastPlushInteractionRef = React.useRef<number>(Date.now())
  const isPlushInteractingRef = React.useRef<boolean>(false)
  const lastSplitInteractionRef = React.useRef<number>(Date.now())

  // Cycle image split sample and update column count according to sample's defaultCols
  const cycleSplitSample = React.useCallback(() => {
    lastSplitInteractionRef.current = Date.now()
    tickSound()
    setSplitSampleIdx((prev) => {
      const next = (prev + 1) % SPLIT_SAMPLES.length
      setSplitCols(SPLIT_SAMPLES[next].defaultCols)
      return next
    })
  }, [])

  // ── Auto-cycle Image Split (only if not modified for at least USER_INTERACTION_DEBOUNCE) ──
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastSplitInteractionRef.current < USER_INTERACTION_DEBOUNCE) {
        return
      }
      setSplitSampleIdx((prev) => {
        const next = (prev + 1) % SPLIT_SAMPLES.length
        setSplitCols(SPLIT_SAMPLES[next].defaultCols)
        return next
      })
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // ── Initialize Plush Engine ──
  React.useEffect(() => {
    if (!plushCanvasRef.current) return

    let isMounted = true
    let engine: PlushEngine | null = null

    try {
      engine = new PlushEngine(plushCanvasRef.current, DEFAULT_CONFIG, {
        onPet: () => {
          lastPlushInteractionRef.current = Date.now()
          dropletSound()
        },
        onClick: () => {
          lastPlushInteractionRef.current = Date.now()
          bloomSound()
        },
        onDragEnd: () => {
          lastPlushInteractionRef.current = Date.now()
          isPlushInteractingRef.current = false
          tapSound()
        },
      })
      plushEngineRef.current = engine

      loadPlushArtwork(
        activePlushPreset.preview,
        activePlushPreset.id,
        activePlushPreset.label,
        activePlushPreset.sideColor,
      )
        .then((art) => {
          if (isMounted && engine) {
            engine.setArtwork(art)
            setPlushLoading(false)
          }
        })
        .catch((err) => {
          console.error('Failed to load plush artwork:', err)
          if (isMounted) setPlushLoading(false)
        })
    } catch (err) {
      console.error('Failed to init plush engine:', err)
      if (isMounted) setPlushLoading(false)
    }

    return () => {
      isMounted = false
      if (engine) {
        engine.dispose()
      }
      plushEngineRef.current = null
    }
  }, [])

  // ── Apply Plush Preset (manual or auto) ──
  const applyPlushPreset = React.useCallback(
    async (nextPreset: (typeof SHOWCASE_PLUSH_PRESETS)[0], playSound = false) => {
      if (playSound) bloomSound()
      setActivePlushPreset(nextPreset)
      setPlushLoading(true)
      const startTime = Date.now()

      try {
        const art = await loadPlushArtwork(nextPreset.preview, nextPreset.id, nextPreset.label, nextPreset.sideColor)
        if (plushEngineRef.current) {
          plushEngineRef.current.setArtwork(art)
          if (nextPreset.sideColor) {
            plushEngineRef.current.updateConfig({
              ...DEFAULT_CONFIG,
              sideColor: nextPreset.sideColor,
            })
          }
        }
      } catch (err) {
        console.error('Error switching plush preset:', err)
      } finally {
        const elapsed = Date.now() - startTime
        if (elapsed < 250) {
          await new Promise((resolve) => setTimeout(resolve, 250 - elapsed))
        }
        setPlushLoading(false)
      }
    },
    [],
  )

  const activePlushPresetRef = React.useRef(activePlushPreset)
  activePlushPresetRef.current = activePlushPreset
  const plushLoadingRef = React.useRef(plushLoading)
  plushLoadingRef.current = plushLoading

  // ── Randomize Plush Preset (Manual) ──
  const randomizePlushPreset = React.useCallback(() => {
    lastPlushInteractionRef.current = Date.now()
    const available = SHOWCASE_PLUSH_PRESETS.filter((p) => p.id !== activePlushPresetRef.current.id)
    const nextPreset = available[Math.floor(Math.random() * available.length)] ?? SHOWCASE_PLUSH_PRESETS[0]
    applyPlushPreset(nextPreset, true)
  }, [applyPlushPreset])

  // ── Auto-cycle Plush every BENTO_CYCLE_INTERVAL (only if not interacted/dragged in USER_INTERACTION_DEBOUNCE) ──
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (
        plushLoadingRef.current ||
        isPlushInteractingRef.current ||
        Date.now() - lastPlushInteractionRef.current < USER_INTERACTION_DEBOUNCE
      ) {
        return
      }
      const available = SHOWCASE_PLUSH_PRESETS.filter((p) => p.id !== activePlushPresetRef.current.id)
      const nextPreset = available[Math.floor(Math.random() * available.length)] ?? SHOWCASE_PLUSH_PRESETS[0]
      applyPlushPreset(nextPreset, false)
    }, BENTO_CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [applyPlushPreset])

  // ── Reset Plush Orientation ──
  const resetPlushOrientation = () => {
    lastPlushInteractionRef.current = Date.now()
    tickSound()
    plushEngineRef.current?.resetOrientation()
    plushEngineRef.current?.resetZoom()
  }

  return (
    <section id="packages" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
      {/* ── Centered Section Header with Link to /tools ── */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl">
          <Link href="/tools" data-space-hover className="group inline-block focus-visible:outline-none cursor-pointer">
            <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[46px] md:text-[54px] transition-colors group-hover:text-foreground/80">
              Creative Tools
            </h2>
          </Link>
          <p className="mt-3 text-base text-muted-foreground">
            Modular creative tools and lightweight runtime packages published on npm. Install independently into any
            React project with zero friction.
          </p>
        </div>
      </div>

      {/* ── Bento Grid: Plush (2x2), Avatars & Squishmoji (2x1), Split (2x1), Flags, Emoji, Audio, Squircle ── */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* ── CARD 1: PLUSH (COL-2 ROW-2) ── */}
        <Frame className="flex flex-col h-full sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Plush 3D Fur</FrameTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="icon-xs"
                onClick={randomizePlushPreset}
                data-space-hover
                title="Randomize plush preset"
                className="rounded-full cursor-pointer"
              >
                <Shuffle className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={resetPlushOrientation}
                data-space-hover
                title="Reset orientation"
                className="rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Link
                href="/tools/plush"
                data-space-hover
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 relative flex min-h-[380px] p-0 overflow-hidden items-center justify-center bg-muted/20 rounded-lg">
              {/* WebGL Canvas with smooth blur morph transition while loading */}
              <div
                ref={plushCanvasRef}
                onPointerDown={() => {
                  isPlushInteractingRef.current = true
                  lastPlushInteractionRef.current = Date.now()
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) {
                    isPlushInteractingRef.current = true
                    lastPlushInteractionRef.current = Date.now()
                  }
                }}
                onPointerUp={() => {
                  isPlushInteractingRef.current = false
                  lastPlushInteractionRef.current = Date.now()
                }}
                onPointerCancel={() => {
                  isPlushInteractingRef.current = false
                  lastPlushInteractionRef.current = Date.now()
                }}
                className={cn(
                  'absolute inset-0 size-full select-none cursor-grab active:cursor-grabbing transition-[filter,transform,opacity] duration-220 ease-[0.16,1,0.3,1] will-change-[opacity,transform,filter]',
                  plushLoading
                    ? 'filter blur-[3px] scale-[0.98] opacity-70 pointer-events-none'
                    : 'filter blur-0 scale-100 opacity-100',
                )}
              />

              {/* Helper Pill */}
              <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xs border-2 border-muted">
                <Hand className="size-3.5 text-foreground" />
                <span>Drag to groom fur · 3D WebGL</span>
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 2: GENERATIVE AVATARS & SQUISHMOJI (COL-2 ROW-1) ── */}
        <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Generative Avatars &amp; Squishmoji</FrameTitle>
            <Link
              href="/tools/avatars"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex flex-col justify-center gap-3 p-4 min-h-48 rounded-lg">
              <div className="grid grid-cols-6 gap-2 w-full items-center justify-items-center">
                {characters.map((item, idx) => (
                  <div
                    key={`char-slot-${idx}`}
                    onClick={() => {
                      tapSound()
                      randomizeCharacters(true)
                    }}
                    className="flex flex-col items-center gap-1.5 select-none cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:scale-105"
                  >
                    {item.type === 'avatar' ? (
                      <div className="relative size-11 overflow-hidden rounded-full">
                        <Avatar name={`${charSeed}-${item.variant}`} variant={item.variant} size={44} circle animate />
                      </div>
                    ) : (
                      <div className="relative size-11 flex items-center justify-center">
                        <Squishmoji
                          seed={`${charSeed}-${item.expr}`}
                          expression={item.expr}
                          shape="all"
                          size={44}
                          backgroundStyle={item.bg}
                          animate
                          animWobble
                          animOnHover
                          animOnClick
                        />
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground capitalize">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 3: SVG FLAGS (COL-1) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>SVG Flags</FrameTitle>
            <Link
              href="/tools/flags"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex flex-col justify-center gap-3 p-3.5 min-h-44 rounded-lg">
              <div className="grid grid-cols-3 gap-2.5 items-center justify-items-center">
                {FLAG_SETS[flagSetIndex].map((f, slotIdx) => (
                  <div
                    key={`flag-slot-${slotIdx}`}
                    onClick={() => {
                      tickSound()
                      setFlagSetIndex((prev) => (prev + 1) % FLAG_SETS.length)
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110 select-none"
                  >
                    <div className="rounded-full overflow-hidden p-0.5">
                      <MorphIcon activeKey={f.code} variant="blur-scale" duration={0.32}>
                        <AssetFlag code={f.code} shape="circle" size={28} alt={f.name} className="ring-0" />
                      </MorphIcon>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{f.code}</span>
                  </div>
                ))}
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 4: SQUIRCLE CORNER SMOOTHING (COL-1) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Squircle Smoothing</FrameTitle>
            <Link
              href="/docs/squircle"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex items-center justify-center gap-3 p-3 min-h-44 rounded-lg">
              <SquircleSwatchItem className="squircle-2xl hover:squircle-xl bg-primary" />
              <SquircleSwatchItem className="squircle-lg hover:squircle-md bg-muted" />
              <SquircleSwatchItem className="squircle-full hover:squircle-2xl bg-foreground" />
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 5: IMAGE SPLIT (COL-2 ROW-1, EN BAS) ── */}
        <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Image Split</FrameTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="icon-xs"
                onClick={cycleSplitSample}
                data-space-hover
                title="Randomize split image"
                className="rounded-full cursor-pointer"
              >
                <Shuffle className="size-3.5" />
              </Button>
              <Link
                href="/tools/imagesplit"
                data-space-hover
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full rounded-lg before:rounded-lg overflow-hidden">
            <CardPanel className="flex-1 flex flex-col items-center justify-center gap-3 p-4 min-h-48 rounded-lg">
              {/* Visual slice preview with real demo image and blur transition */}
              <div
                onClick={cycleSplitSample}
                title="Click to switch image"
                className="relative w-full max-w-[240px] aspect-[16/10] overflow-hidden rounded-xl border-2 border-muted bg-muted/20 cursor-pointer"
              >
                <AnimatePresence initial={false}>
                  <motion.div
                    key={splitSampleIdx}
                    initial={{ scale: 0.98, opacity: 0, filter: 'blur(3px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ scale: 0.98, opacity: 0, filter: 'blur(3px)', pointerEvents: 'none' }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 grid h-full w-full will-change-[opacity,transform,filter]"
                    style={{
                      gridTemplateColumns: `repeat(${splitCols}, 1fr)`,
                      gap: '2px',
                    }}
                  >
                    {Array.from({ length: splitCols }).map((_, i) => (
                      <div key={i} className="relative h-full w-full overflow-hidden bg-muted/30">
                        <Image
                          src={SPLIT_SAMPLES[splitSampleIdx].url}
                          alt={`Slice ${i + 1}`}
                          width={800}
                          height={500}
                          unoptimized
                          className="absolute top-0 h-full max-w-none object-cover pointer-events-none select-none transition-all duration-300"
                          style={{
                            width: `${splitCols * 100}%`,
                            left: `-${i * 100}%`,
                          }}
                        />
                        {i < splitCols - 1 && (
                          <div className="absolute right-0 top-0 bottom-0 w-px border-r border-dashed border-foreground/30 z-10" />
                        )}
                        <span className="pointer-events-none absolute left-1 top-1 rounded-md bg-background/85 backdrop-blur-xs border-2 border-muted px-1 py-0.5 text-[8px] font-semibold text-foreground z-10">
                          0{i + 1}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Interactive column pills */}
              <div className="flex items-center gap-1.5">
                {([2, 3, 4] as const).map((cols) => {
                  const isSelected = splitCols === cols
                  return (
                    <Button
                      key={cols}
                      variant={isSelected ? 'default' : 'secondary'}
                      size="xs"
                      onClick={() => {
                        lastSplitInteractionRef.current = Date.now()
                        tickSound()
                        setSplitCols(cols)
                      }}
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        isSelected
                          ? 'bg-foreground text-background font-medium'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {cols} Columns
                    </Button>
                  )
                })}
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 6: EMOJI HUB (COL-1) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Emoji Hub</FrameTitle>
            <Link
              href="/tools/emoji"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex flex-col justify-center gap-2 p-3.5 min-h-44">
              <div className="grid grid-cols-3 gap-2.5 items-center justify-items-center">
                {currentEmojis.map((em, slotIdx) => {
                  const emojiUrl = resolveEmojiUrl(em.char, {
                    source: activeEmojiStyle.source,
                    type: activeEmojiStyle.type,
                    format: activeEmojiStyle.format,
                  })

                  return (
                    <Button
                      key={`emoji-slot-${slotIdx}`}
                      variant="ghost"
                      onClick={() => sparkleSound()}
                      title={em.name}
                      className="group flex h-auto! flex-col items-center gap-1 p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 select-none"
                    >
                      <div className="relative size-9 overflow-hidden rounded-xl p-1 flex items-center justify-center bg-muted/30">
                        <MorphIcon
                          activeKey={`${em.char}-${activeEmojiStyle.source}`}
                          variant="blur-scale"
                          duration={0.28}
                        >
                          {emojiUrl ? (
                            <Image
                              src={emojiUrl}
                              alt={em.name}
                              width={28}
                              height={28}
                              unoptimized
                              className="size-7 object-contain pointer-events-none"
                            />
                          ) : (
                            <span className="text-lg leading-none">{em.char}</span>
                          )}
                        </MorphIcon>
                      </div>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[52px] text-center">
                        {em.name}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* ── CARD 7: PROCEDURAL AUDIO (COL-1) ── */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Procedural Audio</FrameTitle>
            <a
              href="https://sounds.spaceui.one"
              target="_blank"
              rel="noreferrer"
              data-space-hover
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </a>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 flex flex-col justify-center p-3 min-h-44">
              <div className="grid grid-cols-2 gap-1.5">
                {SOUND_DEMOS.map((s) => (
                  <Button
                    key={s.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => s.fn()}
                    className="h-auto! justify-start gap-1.5 rounded-lg bg-muted/60 p-2 text-left transition-colors hover:bg-muted active:scale-95 cursor-pointer"
                  >
                    <Play className="size-2.5 fill-foreground text-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">{s.label}</span>
                  </Button>
                ))}
              </div>
            </CardPanel>
          </Card>
        </Frame>
      </div>
    </section>
  )
}
