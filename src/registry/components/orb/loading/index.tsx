'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type SquareTone = 't100' | 't200' | 't300' | 't400' | 't500'

export type LoaderPattern =
  | 'diamond'
  | 'corners'
  | 'bands'
  | 'scatter'
  | 'diagonal'
  | 'glyph'

export type LoaderMotion = 'morph' | 'fade' | 'scale' | 'blur' | 'flip'

export interface PatternSquare {
  row: number
  col: number
  tone: SquareTone
}

export interface Pattern {
  name: LoaderPattern
  squares: PatternSquare[]
}

export const LOADING_PATTERNS: Pattern[] = [
  {
    name: 'diamond',
    squares: [
      { row: 1, col: 2, tone: 't100' },
      { row: 1, col: 3, tone: 't300' },
      { row: 2, col: 1, tone: 't100' },
      { row: 2, col: 2, tone: 't500' },
      { row: 2, col: 3, tone: 't300' },
      { row: 2, col: 4, tone: 't100' },
      { row: 3, col: 1, tone: 't100' },
      { row: 3, col: 2, tone: 't300' },
      { row: 3, col: 3, tone: 't500' },
      { row: 3, col: 4, tone: 't100' },
      { row: 4, col: 2, tone: 't300' },
      { row: 4, col: 3, tone: 't100' },
    ],
  },
  {
    name: 'corners',
    squares: [
      { row: 1, col: 1, tone: 't400' },
      { row: 1, col: 4, tone: 't400' },
      { row: 2, col: 1, tone: 't100' },
      { row: 2, col: 2, tone: 't300' },
      { row: 2, col: 3, tone: 't300' },
      { row: 2, col: 4, tone: 't100' },
      { row: 3, col: 1, tone: 't100' },
      { row: 3, col: 2, tone: 't300' },
      { row: 3, col: 3, tone: 't300' },
      { row: 3, col: 4, tone: 't100' },
      { row: 4, col: 1, tone: 't400' },
      { row: 4, col: 4, tone: 't400' },
    ],
  },
  {
    name: 'bands',
    squares: [
      { row: 1, col: 1, tone: 't200' },
      { row: 1, col: 2, tone: 't200' },
      { row: 1, col: 3, tone: 't200' },
      { row: 1, col: 4, tone: 't200' },
      { row: 2, col: 1, tone: 't300' },
      { row: 2, col: 2, tone: 't300' },
      { row: 2, col: 3, tone: 't300' },
      { row: 2, col: 4, tone: 't300' },
      { row: 3, col: 1, tone: 't400' },
      { row: 3, col: 2, tone: 't400' },
      { row: 3, col: 3, tone: 't400' },
      { row: 3, col: 4, tone: 't400' },
      { row: 4, col: 1, tone: 't100' },
      { row: 4, col: 2, tone: 't100' },
      { row: 4, col: 3, tone: 't100' },
      { row: 4, col: 4, tone: 't100' },
    ],
  },
  {
    name: 'scatter',
    squares: [
      { row: 1, col: 2, tone: 't200' },
      { row: 1, col: 3, tone: 't100' },
      { row: 2, col: 1, tone: 't100' },
      { row: 2, col: 2, tone: 't400' },
      { row: 2, col: 3, tone: 't400' },
      { row: 3, col: 2, tone: 't200' },
      { row: 3, col: 3, tone: 't300' },
      { row: 4, col: 1, tone: 't300' },
      { row: 4, col: 2, tone: 't200' },
      { row: 4, col: 4, tone: 't100' },
    ],
  },
  {
    name: 'diagonal',
    squares: [
      { row: 1, col: 2, tone: 't100' },
      { row: 1, col: 3, tone: 't200' },
      { row: 1, col: 4, tone: 't300' },
      { row: 2, col: 2, tone: 't300' },
      { row: 2, col: 3, tone: 't400' },
      { row: 2, col: 4, tone: 't400' },
      { row: 3, col: 2, tone: 't400' },
      { row: 3, col: 3, tone: 't300' },
      { row: 3, col: 4, tone: 't100' },
      { row: 4, col: 1, tone: 't200' },
    ],
  },
  {
    name: 'glyph',
    squares: [
      { row: 1, col: 1, tone: 't200' },
      { row: 2, col: 1, tone: 't300' },
      { row: 2, col: 2, tone: 't300' },
      { row: 2, col: 3, tone: 't300' },
      { row: 3, col: 1, tone: 't400' },
      { row: 3, col: 3, tone: 't400' },
      { row: 3, col: 4, tone: 't400' },
      { row: 4, col: 2, tone: 't100' },
      { row: 4, col: 3, tone: 't100' },
    ],
  },
]

export const DEFAULT_TONE_OPACITIES: Record<SquareTone, number> = {
  t100: 0.2,
  t200: 0.4,
  t300: 0.65,
  t400: 0.85,
  t500: 1.0,
}

const MOTION_PRESETS: Record<
  LoaderMotion,
  {
    initial: { opacity?: number; scale?: number; rotate?: number; filter?: string }
    animate: { opacity?: number; scale?: number; rotate?: number; filter?: string }
  }
> = {
  morph: { initial: { opacity: 0, scale: 0.35 }, animate: { opacity: 1, scale: 1 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  scale: { initial: { opacity: 1, scale: 0 }, animate: { opacity: 1, scale: 1 } },
  blur: { initial: { opacity: 0, filter: 'blur(6px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
  flip: { initial: { opacity: 0, rotate: -90, scale: 0.5 }, animate: { opacity: 1, rotate: 0, scale: 1 } },
}

export interface LoadingOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  speed?: number
  pattern?: LoaderPattern | number
  motionPreset?: LoaderMotion
  radius?: number
  gap?: number
  dotClassName?: string
  toneOpacities?: Partial<Record<SquareTone, number>>
  showGhost?: boolean
  ghostOpacity?: number
}

export function LoadingOrb({
  className,
  size = 56,
  speed = 750,
  pattern,
  motionPreset = 'morph',
  radius = 3,
  gap = 3,
  dotClassName = 'bg-current',
  toneOpacities = DEFAULT_TONE_OPACITIES,
  showGhost = false,
  ghostOpacity = 0.06,
  style,
  ...props
}: LoadingOrbProps) {
  const [current, setCurrent] = React.useState(0)

  // Resolve active pattern index
  const resolvedIndex = React.useMemo(() => {
    if (typeof pattern === 'number') {
      return ((pattern % LOADING_PATTERNS.length) + LOADING_PATTERNS.length) % LOADING_PATTERNS.length
    }
    if (typeof pattern === 'string') {
      const idx = LOADING_PATTERNS.findIndex((p) => p.name === pattern)
      if (idx !== -1) return idx
    }
    return null
  }, [pattern])

  React.useEffect(() => {
    if (resolvedIndex !== null) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % LOADING_PATTERNS.length)
    }, speed)
    return () => clearInterval(interval)
  }, [speed, resolvedIndex])

  const activePattern = LOADING_PATTERNS[resolvedIndex ?? (current % LOADING_PATTERNS.length)]
  const preset = MOTION_PRESETS[motionPreset] ?? MOTION_PRESETS.morph
  const opacities = { ...DEFAULT_TONE_OPACITIES, ...toneOpacities }
  const cell = (size - gap * 3) / 4

  const positions = React.useMemo(() => {
    const list: { row: number; col: number }[] = []
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 4; c++) {
        list.push({ row: r, col: c })
      }
    }
    return list
  }, [])

  return (
    <div
      className={cn('grid select-none text-foreground', className)}
      style={{
        width: size,
        height: size,
        gap,
        gridTemplateColumns: `repeat(4, ${cell}px)`,
        gridTemplateRows: `repeat(4, ${cell}px)`,
        ...style,
      }}
      role="status"
      aria-label="Loading indicator"
      {...props}
    >
      {positions.map(({ row, col }) => {
        const square = activePattern.squares.find((s) => s.row === row && s.col === col)
        const on = Boolean(square)
        const targetOpacity = square ? (opacities[square.tone] ?? 1) : showGhost ? ghostOpacity : 0
        const delay = ((row + col) % 5) * 0.035

        return (
          <motion.span
            key={`${row}-${col}`}
            initial={false}
            animate={{
              opacity: on ? targetOpacity : showGhost ? ghostOpacity : 0,
              scale: on ? (preset.animate.scale ?? 1) : (preset.initial.scale ?? 0.35),
              rotate: on ? (preset.animate.rotate ?? 0) : (preset.initial.rotate ?? 0),
              filter: on ? (preset.animate.filter ?? 'blur(0px)') : (preset.initial.filter ?? 'blur(0px)'),
            }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay }}
            style={{ borderRadius: radius }}
            className={cn('block size-full', dotClassName)}
          />
        )
      })}
    </div>
  )
}

export interface BuildingLoaderProps extends Omit<LoadingOrbProps, 'pattern'> {
  state?: string
  detail?: string
  showShimmer?: boolean
  pattern?: LoaderPattern | number
}

export function BuildingLoader({
  className,
  state = 'Building',
  detail = 'Composing response from context',
  showShimmer = true,
  size = 38,
  ...loaderProps
}: BuildingLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-sm items-center gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-md',
        className
      )}
    >
      <LoadingOrb size={size} {...loaderProps} />
      <div className="min-w-0 flex-1">
        {state && (
          <p className="font-mono text-xs font-medium tracking-wide text-foreground">
            {state}...
          </p>
        )}
        {detail && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {detail}
          </p>
        )}
        {showShimmer && (
          <div className="relative mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-primary/80" />
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingOrb
