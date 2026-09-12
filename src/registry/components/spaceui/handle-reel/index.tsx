'use client'

import * as React from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type ReelState = 'scrolling' | 'locked' | 'settled'

export interface HandleReelProps {
  /** Array of handles or strings streamed through the roller. */
  names?: string[]
  /** The final target handle to land on. @default "username" */
  finalName?: string
  /** Fixed domain, handle prefix, or symbol rendered before the slot. @default "ryna.me/" */
  prefix?: React.ReactNode
  /** Number of visible text slots in the viewport window. @default 7 */
  rows?: number
  /** Number of full list cycles traversed before settling on the target. @default 3 */
  cycles?: number
  /** Total deceleration and roll animation time in seconds. @default 4.5 */
  spinDuration?: number
  /** Color accent emitted on lock landing. @default "#6366f1" */
  highlightColor?: string
  /** Muted color for ambient scrolling items. @default "var(--muted-foreground)" */
  placeholderColor?: string
  /** Continuously restart the tumbler roll. @default false */
  loop?: boolean
  /** Idle duration in milliseconds before loop restart. @default 2000 */
  loopDelay?: number
  /** Numeric trigger value to manually invoke a new spin sequence. */
  trigger?: number
  /** Transforms the landed handle into a seamless inline ghost input for instant editing. @default true */
  editable?: boolean
  /** Callback fired immediately when the target locks into view. */
  onLand?: (name: string) => void
  /** Callback fired whenever the user modifies the editable handle value. */
  onNameChange?: (name: string) => void
  /** Outer container styles. */
  className?: string
  /** Typography and viewport sizing styles. */
  textClassName?: string
}

/**
 * Deterministically constructs a continuous vertical drum track containing
 * preamble buffer items, cyclic tumbling sequences, and the target lock entry.
 */
function buildDrumSequence(
  candidates: string[],
  target: string,
  bufferSize: number,
  rounds: number,
): { sequence: string[]; lockIndex: number; startOffsetIndex: number } {
  const pool = candidates.length > 0 ? candidates : [target]
  const randomized = [...pool]
  for (let i = randomized.length - 1; i > 0; i--) {
    const swap = Math.floor(Math.random() * (i + 1))
    ;[randomized[i], randomized[swap]] = [randomized[swap], randomized[i]]
  }

  // Prepend lead-in buffer to center cleanly when stationary
  const leadBuffer = randomized.slice(0, bufferSize)
  while (leadBuffer.length < bufferSize) {
    leadBuffer.push(target)
  }
  const track: string[] = [...leadBuffer, target]

  // Append full cycles for kinetic deceleration
  for (let round = 0; round < Math.max(1, rounds); round++) {
    const cycle = [...pool]
    for (let c = cycle.length - 1; c > 0; c--) {
      const idx = Math.floor(Math.random() * (c + 1))
      ;[cycle[c], cycle[idx]] = [cycle[idx], cycle[c]]
    }
    track.push(...cycle)
  }

  const lockIndex = bufferSize
  const startOffsetIndex = Math.max(lockIndex + 1, track.length - 1 - bufferSize)

  return { sequence: track, lockIndex, startOffsetIndex }
}

export function HandleReel({
  names = [],
  finalName = 'username',
  prefix = 'ryna.me/',
  rows = 7,
  cycles = 3,
  spinDuration = 4.5,
  highlightColor = '#6366f1',
  placeholderColor = 'var(--muted-foreground)',
  loop = false,
  loopDelay = 2000,
  trigger = 0,
  editable = true,
  onLand,
  onNameChange,
  className,
  textClassName,
}: HandleReelProps) {
  const [spinId, setSpinId] = React.useState(0)
  const [rowHeight, setRowHeight] = React.useState(0)
  const [reelStatus, setReelStatus] = React.useState<ReelState>('scrolling')
  const [inputValue, setInputValue] = React.useState(finalName)
  const [inputActive, setInputActive] = React.useState(false)

  const translateY = useMotionValue(0)
  const probeRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Re-synchronize target value & reset state
  React.useEffect(() => {
    setInputValue(finalName)
    setSpinId((s) => s + 1)
  }, [finalName, prefix, trigger])

  const centerSlot = Math.floor(rows / 2)
  const { sequence, lockIndex, startOffsetIndex } = React.useMemo(() => {
    return buildDrumSequence(names, finalName, centerSlot, cycles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, finalName, cycles, centerSlot, spinId])

  const viewportHeight = rowHeight * rows

  // Calculate pixel translation needed to align slot item at vertical optical center
  const getSlotPosition = React.useCallback(
    (slotIdx: number) => {
      const slotCenterY = slotIdx * rowHeight + rowHeight / 2
      return viewportHeight / 2 - slotCenterY
    },
    [viewportHeight, rowHeight],
  )

  // Measure text baseline height directly from DOM probe
  React.useLayoutEffect(() => {
    const measured = probeRef.current?.offsetHeight ?? 0
    if (measured && measured !== rowHeight) {
      setRowHeight(measured)
    }
  }, [rowHeight])

  // Kinetic scroll lifecycle
  React.useEffect(() => {
    if (!rowHeight) return
    setReelStatus('scrolling')

    const motionQuery =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')

    if (motionQuery?.matches) {
      translateY.set(getSlotPosition(lockIndex))
      setReelStatus('settled')
      onLand?.(finalName)
      return
    }

    translateY.set(getSlotPosition(startOffsetIndex))

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let loopTimer: ReturnType<typeof setTimeout> | undefined

    const animation = animate(translateY, getSlotPosition(lockIndex), {
      duration: spinDuration,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        setReelStatus('locked')
        onLand?.(finalName)

        settleTimer = setTimeout(() => {
          setReelStatus('settled')
          if (loop && !inputActive) {
            loopTimer = setTimeout(() => setSpinId((s) => s + 1), loopDelay)
          }
        }, 850)
      },
    })

    return () => {
      animation.stop()
      if (settleTimer) clearTimeout(settleTimer)
      if (loopTimer) clearTimeout(loopTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight, spinId, inputActive])

  const activeColor =
    reelStatus === 'locked'
      ? highlightColor
      : reelStatus === 'settled'
        ? 'var(--foreground)'
        : placeholderColor

  const isAtRest = reelStatus === 'locked' || reelStatus === 'settled'

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden px-6 text-foreground',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center text-4xl font-medium tracking-tight sm:text-6xl',
          textClassName,
        )}
      >
        {prefix ? (
          <span className="shrink-0 whitespace-nowrap text-muted-foreground select-none">
            {prefix}
          </span>
        ) : null}

        <div className="relative overflow-hidden" style={{ height: viewportHeight }}>
          {/* Invisible sizing probe to calculate unit line metrics */}
          <div
            ref={probeRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute whitespace-nowrap leading-[1.2]"
          >
            {finalName}
          </div>

          <motion.div
            style={{ y: translateY }}
            className={cn(
              'transform-gpu will-change-transform',
              rowHeight ? '' : 'opacity-0',
            )}
          >
            {sequence.map((entry, idx) => {
              const isTargetSlot = idx === lockIndex

              if (isTargetSlot && editable && isAtRest) {
                return (
                  <div
                    key={idx}
                    className="relative inline-flex items-center whitespace-nowrap leading-[1.2]"
                  >
                    {/* Shadow span ensuring perfect inline bounding box */}
                    <span
                      aria-hidden="true"
                      className="invisible pointer-events-none whitespace-pre select-none"
                    >
                      {inputValue || ' '}
                    </span>

                    {/* Integrated ghost input for editing directly on the reel */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        onNameChange?.(e.target.value)
                      }}
                      onFocus={() => setInputActive(true)}
                      onBlur={() => setInputActive(false)}
                      spellCheck={false}
                      autoComplete="off"
                      className="absolute inset-0 h-full w-full border-0 bg-transparent p-0 text-inherit font-inherit tracking-inherit outline-none focus:outline-none"
                      style={{ color: activeColor }}
                    />
                  </div>
                )
              }

              return (
                <div
                  key={idx}
                  className="whitespace-nowrap leading-[1.2] transition-[color,opacity] duration-500 ease-out"
                  style={{
                    color: isTargetSlot ? activeColor : placeholderColor,
                    opacity: !isTargetSlot && reelStatus !== 'scrolling' ? 0 : 1,
                  }}
                >
                  {isTargetSlot ? inputValue : entry}
                </div>
              )
            })}
          </motion.div>

          {/* Upper optical gradient falloff */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: rowHeight * 1.5,
              background: 'linear-gradient(to bottom, var(--background), transparent)',
            }}
          />

          {/* Lower optical gradient falloff */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: rowHeight * 1.5,
              background: 'linear-gradient(to top, var(--background), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

