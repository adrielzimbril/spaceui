'use client'

import * as React from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { cn } from '@/registry/lib/utils'

const DEFAULT_HANDLES = [
  'adriel',
  'soren',
  'elena',
  'julian',
  'maya',
  'clara',
  'tito',
  'silvan',
  'noor',
  'ravi',
  'yuki',
  'mateo',
  'chloe',
  'lucas',
]

export type HandleReelPhase = 'idle' | 'spinning' | 'landed' | 'done'

export interface HandleReelProps {
  /** Handles/names that scroll past in the reel. @default DEFAULT_HANDLES */
  names?: string[]
  /** The final handle the reel lands on. @default "ryna" */
  finalName?: string
  /** Static prefix shown before the reel. @default "ryna.me/" */
  prefix?: React.ReactNode
  /** Optional suffix shown after the reel (e.g. ".design", "@mail.com"). */
  suffix?: React.ReactNode
  /** Number of visible rows in the viewport (odd numbers center cleanly). @default 7 */
  rows?: number
  /** Number of full list repetitions before stopping on final handle. @default 3 */
  cycles?: number
  /** Total spin duration in seconds before landing. @default 4 */
  spinDuration?: number
  /** Color the final handle transitions to upon landing. @default "var(--primary, #6366f1)" */
  highlightColor?: string
  /** Color of the names while spinning. @default "var(--muted-foreground)" */
  placeholderColor?: string
  /** Replay the animation continuously on a loop. @default false */
  loop?: boolean
  /** Delay in milliseconds before replaying when loop is true. @default 2200 */
  loopDelay?: number
  /** External trigger count to restart the roll programmatically. */
  trigger?: number
  /** Callback fired when the reel lands on the final handle. */
  onLand?: (name: string) => void
  /** Class name for the outer container. */
  className?: string
  /** Class name for the text and viewport sizing. */
  textClassName?: string
}

function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function HandleReel({
  names = DEFAULT_HANDLES,
  finalName = 'ryna',
  prefix = 'ryna.me/',
  suffix,
  rows = 7,
  cycles = 3,
  spinDuration = 4,
  highlightColor = 'var(--primary, #6366f1)',
  placeholderColor = 'var(--muted-foreground)',
  loop = false,
  loopDelay = 2200,
  trigger = 0,
  onLand,
  className,
  textClassName,
}: HandleReelProps) {
  const [internalRunId, setInternalRunId] = React.useState(0)
  const [rowH, setRowH] = React.useState(0)
  const [phase, setPhase] = React.useState<HandleReelPhase>('spinning')

  const y = useMotionValue(0)
  const measureRef = React.useRef<HTMLDivElement>(null)

  const half = Math.floor(rows / 2)
  const reel = React.useMemo(() => {
    const filler = shuffle(names).slice(0, half)
    const list: string[] = [...filler, finalName]
    for (let c = 0; c < Math.max(1, cycles); c++) {
      list.push(...shuffle(names))
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, finalName, cycles, half, internalRunId, trigger])

  const finalIndex = half
  const lastIndex = reel.length - 1
  const startIndex = Math.max(finalIndex + 1, lastIndex - half)
  const viewportH = rowH * rows

  const offsetFor = React.useCallback(
    (i: number) => viewportH / 2 - (i * rowH + rowH / 2),
    [viewportH, rowH],
  )

  // Measure row height dynamically for accurate geometry
  React.useLayoutEffect(() => {
    const h = measureRef.current?.offsetHeight ?? 0
    if (h && h !== rowH) {
      setRowH(h)
    }
  }, [rowH])

  // Execute deceleration roll
  React.useEffect(() => {
    if (!rowH) return
    setPhase('spinning')

    const prefersReduced =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

    let landTimer: number | undefined
    let loopTimer: number | undefined

    if (prefersReduced) {
      y.set(offsetFor(finalIndex))
      setPhase('done')
      onLand?.(finalName)
      return
    }

    y.set(offsetFor(startIndex))
    const controls = animate(y, offsetFor(finalIndex), {
      duration: spinDuration,
      // Quintic smooth out curve for tactile friction deceleration
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        setPhase('landed')
        onLand?.(finalName)
        landTimer = window.setTimeout(() => {
          setPhase('done')
          if (loop) {
            loopTimer = window.setTimeout(() => {
              setInternalRunId((r) => r + 1)
            }, loopDelay)
          }
        }, 900)
      },
    })

    return () => {
      controls.stop()
      window.clearTimeout(landTimer)
      window.clearTimeout(loopTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowH, internalRunId, trigger])

  const finalColor =
    phase === 'landed'
      ? highlightColor
      : phase === 'done'
        ? 'var(--foreground)'
        : placeholderColor

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground select-none',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center text-4xl font-medium tracking-tight sm:text-6xl md:text-7xl font-sans',
          textClassName,
        )}
      >
        {prefix && (
          <span className="shrink-0 whitespace-nowrap text-muted-foreground/80 transition-colors">
            {prefix}
          </span>
        )}

        <div className="relative overflow-hidden" style={{ height: viewportH }}>
          {/* Measure probe for row height */}
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute whitespace-nowrap leading-[1.2]"
          >
            {finalName}
          </div>

          <motion.div
            style={{ y }}
            className={cn('transform-gpu will-change-transform', rowH ? '' : 'opacity-0')}
          >
            {reel.map((name, i) => {
              const isFinal = i === finalIndex
              return (
                <div
                  key={i}
                  className="whitespace-nowrap leading-[1.2] transition-[color,opacity] duration-500 ease-out font-medium"
                  style={{
                    color: isFinal ? finalColor : placeholderColor,
                    opacity: !isFinal && phase !== 'spinning' ? 0 : 1,
                  }}
                >
                  {name}
                </div>
              )
            })}
          </motion.div>

          {/* Top & Bottom edge gradient fades */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10"
            style={{
              height: rowH * 1.6,
              background: 'linear-gradient(to bottom, var(--background), transparent)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            style={{
              height: rowH * 1.6,
              background: 'linear-gradient(to top, var(--background), transparent)',
            }}
          />
        </div>

        {suffix && (
          <span className="shrink-0 whitespace-nowrap text-muted-foreground/80 transition-colors">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
