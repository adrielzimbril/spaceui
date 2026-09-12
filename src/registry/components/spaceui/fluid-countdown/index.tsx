'use client'

import * as React from 'react'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import { IconPlayerPause, IconPlayerPlay, IconPlus, IconRotateClockwise } from '@tabler/icons-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Button } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'

export interface FluidCountdownRef {
  /** Adds extra seconds to the current countdown. */
  addSeconds: (seconds: number) => void
  /** Resets timer back to its configured starting duration. */
  reset: () => void
  /** Toggles running / paused state. */
  toggle: () => void
}

export interface FluidCountdownProps {
  /** Initial countdown duration in seconds. @default 33 */
  duration?: number
  /** Whether the timer immediately begins counting on mount. @default true */
  autoStart?: boolean
  /** Whether the counter resets and loops automatically upon hitting 0. @default false */
  loop?: boolean
  /** Render primary playback toggle, reset, and quick-add controls. @default true */
  showControls?: boolean
  /** Descriptive uppercase caption badge anchored above the digits. */
  label?: string
  /** Accent hue applied to the primary playback control. @default "#ff3828" */
  accentColor?: string
  /** Callback triggered when countdown completes (inactive when loop is true). */
  onComplete?: () => void
  /** Callback fired whenever seconds are added via quick-add. */
  onAddSeconds?: (seconds: number) => void
  /** Root container className. */
  className?: string
  /** Direct styles applied to the numerical display elements. */
  digitClassName?: string
}

/**
 * Deconstructs raw seconds into standard minute and second clock values.
 */
function resolveTimeSegments(totalSec: number) {
  const bounded = Math.max(0, Math.floor(totalSec))
  const minutes = Math.floor(bounded / 60)
  const seconds = bounded % 60
  return { minutes, seconds }
}

export const FluidCountdown = React.forwardRef<FluidCountdownRef, FluidCountdownProps>(function FluidCountdown(
  {
    duration = 33,
    autoStart = true,
    loop = false,
    showControls = true,
    label,
    accentColor = '#ff3828',
    onComplete,
    onAddSeconds,
    className,
    digitClassName,
  },
  ref,
) {
  const [secondsRemaining, setSecondsRemaining] = React.useState(duration)
  const [isActive, setIsActive] = React.useState(autoStart)

  // Monotonic target timestamp to avoid tab-throttling drift
  const targetTimeRef = React.useRef(Date.now() + duration * 1000)

  // Sync state if duration changes externally
  React.useEffect(() => {
    setSecondsRemaining(duration)
    targetTimeRef.current = Date.now() + duration * 1000
  }, [duration])

  // Precision interval engine with drift correction
  React.useEffect(() => {
    if (!isActive) return

    targetTimeRef.current = Date.now() + secondsRemaining * 1000

    const timerId = setInterval(() => {
      const remainingMs = targetTimeRef.current - Date.now()
      const nextSeconds = Math.max(0, Math.ceil(remainingMs / 1000))

      if (nextSeconds <= 0) {
        if (loop) {
          targetTimeRef.current = Date.now() + duration * 1000
          setSecondsRemaining(duration)
        } else {
          setIsActive(false)
          setSecondsRemaining(0)
          onComplete?.()
        }
      } else {
        setSecondsRemaining(nextSeconds)
      }
    }, 250) // Frequent sampling prevents skipped second jumps

    return () => clearInterval(timerId)
  }, [isActive, loop, duration, onComplete, secondsRemaining])

  const handleToggle = () => {
    if (secondsRemaining <= 0) {
      setSecondsRemaining(duration)
      targetTimeRef.current = Date.now() + duration * 1000
    }
    setIsActive((prev) => !prev)
  }

  const handleReset = () => {
    setIsActive(false)
    setSecondsRemaining(duration)
    targetTimeRef.current = Date.now() + duration * 1000
  }

  const handleAddSeconds = (extraSec = 30) => {
    targetTimeRef.current += extraSec * 1000
    setSecondsRemaining((prev) => prev + extraSec)
    onAddSeconds?.(extraSec)
  }

  // Expose imperative handle
  React.useImperativeHandle(ref, () => ({
    addSeconds: handleAddSeconds,
    reset: handleReset,
    toggle: handleToggle,
  }))

  const { minutes, seconds } = resolveTimeSegments(secondsRemaining)

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="timer"
        aria-atomic="true"
        className={cn(
          '[container-type:size] relative flex h-full min-h-[350px] w-full flex-col items-center justify-center gap-8',
          className,
        )}
      >
        <NumberFlowGroup>
          <div
            className={cn(
              'flex items-baseline leading-none font-bold tracking-tight tabular-nums',
              'text-[clamp(2rem,min(26cqw,40cqh),16rem)]',
              digitClassName,
            )}
          >
            <NumberFlow value={minutes} trend={-1} />
            <span className="px-[0.04em]">:</span>
            <NumberFlow value={seconds} trend={-1} format={{ minimumIntegerDigits: 2 }} />
          </div>
        </NumberFlowGroup>

        {showControls ? (
          <div className="flex w-fit items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleAddSeconds(30)}
              aria-label="Add 30 seconds"
              title="Add 30 seconds (+30s)"
              className="rounded-full shadow-none hover:text-foreground"
            >
              <IconPlus className="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleToggle}
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              className="rounded-full text-white border-none transition-transform active:scale-90"
              style={{ backgroundColor: accentColor }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isActive ? 'pause' : 'play'}
                  initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 25 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  {isActive ? (
                    <IconPlayerPause className="size-4.5 fill-current" />
                  ) : (
                    <IconPlayerPlay className="size-4.5 fill-current ml-0.5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              aria-label="Reset timer"
              className="rounded-full shadow-none hover:text-foreground"
              style={{ color: accentColor }}
            >
              <IconRotateClockwise className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </MotionConfig>
  )
})
