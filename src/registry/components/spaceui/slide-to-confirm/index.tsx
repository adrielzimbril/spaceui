'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { IconArrowRight, IconCheck } from '@tabler/icons-react'
import { TextMorph } from 'torph/react'
import { cn } from '@/registry/lib/utils'

export type SlideToConfirmProps = {
  width?: number
  corner?: number
  speed?: number
  label?: string
  confirmedLabel?: string
  resetDelay?: number
  onConfirm?: () => void
  disabled?: boolean
  className?: string
}

const DEFAULT_WIDTH = 280
const MIN_WIDTH = 220
const MAX_WIDTH = 380
const TRACK_HEIGHT = 56
const PADDING = 4
const GRIP_WIDTH = 48
const DEFAULT_CORNER = TRACK_HEIGHT / 2
const HOVER_SCALE = 1.03

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export function SlideToConfirm({
  width = DEFAULT_WIDTH,
  corner = DEFAULT_CORNER,
  speed = 50,
  label = 'Slide to confirm',
  confirmedLabel = 'Confirmed',
  resetDelay = 1500,
  onConfirm,
  disabled = false,
  className,
}: SlideToConfirmProps) {
  const [isDone, setIsDone] = React.useState(false)
  const [isHeld, setIsHeld] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const trackRef = React.useRef<HTMLDivElement>(null)
  const pointerRef = React.useRef<{ id: number; grab: number | null; moved: boolean } | null>(null)
  const timerRef = React.useRef<number | undefined>(undefined)
  const cleanupListenersRef = React.useRef<(() => void) | null>(null)

  const f = useMotionValue(0)
  const p = useMotionValue(0)
  const m = useMotionValue(1)
  const h = useMotionValue(1)

  const finalWidth = clamp(Math.round(width), MIN_WIDTH, MAX_WIDTH)
  const travel = finalWidth - 8 - GRIP_WIDTH
  const trackRadius = clamp(corner, 0, DEFAULT_CORNER)
  const gripRadius = Math.max(0, trackRadius - PADDING)

  const springStiffness = 260 + (clamp(speed, 0, 100) / 100) * 640
  const returnSpring = React.useMemo(
    () => ({
      type: 'spring' as const,
      stiffness: springStiffness,
      damping: 2 * Math.sqrt(springStiffness * 0.9),
      mass: 0.9,
    }),
    [springStiffness],
  )
  const releaseSpring = React.useMemo(
    () => ({
      ...returnSpring,
      damping: 2 * Math.sqrt(springStiffness * 0.9) * 0.62,
    }),
    [returnSpring, springStiffness],
  )

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      cleanupListenersRef.current?.()
    }
  }, [])

  const clampedF = useTransform(f, (v) => clamp(v, 0, travel))
  const gripWidth = useTransform([clampedF, p], ([curF, curP]: number[]) => GRIP_WIDTH + clamp(curP - curF, 0, travel))
  const squeeze = useTransform(
    useTransform(f, (v: number) => Math.max(0, -v)),
    (v: number) => 1 - Math.min(0.08, v / 110),
  )
  const washWidth = useTransform(clampedF, (v: number) => v + GRIP_WIDTH)
  const textOpacity = useTransform(clampedF, [0, travel * 0.55], [1, 0])
  const arrowOpacity = useTransform(
    [clampedF, h],
    ([curF, curH]: number[]) => curH * clamp(1 - (curF - travel * 0.55) / (travel * 0.4), 0, 1),
  )
  const scaleX = useTransform(squeeze, (v) => v * (isHovered && !isHeld && !isDone ? HOVER_SCALE : 1))
  const scaleY = useTransform(squeeze, (v) => (1 / v) * (isHovered && !isHeld && !isDone ? HOVER_SCALE : 1))

  const toTrackRelative = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const scale = rect.width / finalWidth
    return (clientX - rect.left) / (scale || 1)
  }

  const triggerConfirm = () => {
    setIsDone(true)
    onConfirm?.()
    p.set(f.get())
    animate(h, 0, { duration: 0.12 })
    animate(f, 0, returnSpring)
    animate(m, [1, 0.974, 1], {
      duration: 0.46,
      times: [0, 0.62, 1],
      ease: [0.33, 0.55, 0.2, 1],
      delay: 0.1,
    })

    timerRef.current = window.setTimeout(() => {
      setIsDone(false)
      animate(h, 1, { duration: 0.2, delay: 0.12 })
      animate(p, 0, {
        type: 'spring',
        stiffness: 380,
        damping: 34,
        mass: 0.9,
      })
    }, resetDelay)
  }

  const attachListeners = () => {
    cleanupListenersRef.current?.()
    const onPointerMove = (e: PointerEvent) => {
      const ptr = pointerRef.current
      if (!ptr || ptr.id !== e.pointerId) return
      const relX = toTrackRelative(e.clientX)
      if (ptr.grab === null) {
        ptr.grab = relX - f.get()
        return
      }
      const nextX = clamp(relX - ptr.grab, 0, travel)
      if (Math.abs(nextX - f.get()) > 0.5) ptr.moved = true
      f.set(nextX)
    }

    const onPointerUp = (e: PointerEvent) => {
      const ptr = pointerRef.current
      if (ptr) {
        pointerRef.current = null
        try {
          trackRef.current?.releasePointerCapture(e.pointerId)
        } catch {}
        cleanupListenersRef.current?.()
        setIsHeld(false)
        if (f.get() >= travel) {
          triggerConfirm()
        } else {
          animate(f, 0, releaseSpring)
        }
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    cleanupListenersRef.current = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      cleanupListenersRef.current = null
    }
  }

  return (
    <div
      className={cn(
        'relative inline-block select-none touch-none',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      style={{ width: finalWidth, height: TRACK_HEIGHT }}
    >
      <motion.div
        ref={trackRef}
        style={{
          borderRadius: trackRadius,
          scale: m,
        }}
        data-held={isHeld || undefined}
        data-done={isDone || undefined}
        onPointerDown={(e) => {
          if (!isDone && !disabled) {
            e.stopPropagation()
            pointerRef.current = {
              id: e.pointerId,
              grab: null,
              moved: false,
            }
            setIsHeld(true)
            try {
              trackRef.current?.setPointerCapture(e.pointerId)
            } catch {}
            attachListeners()
          }
        }}
        className={cn('relative w-full h-full overflow-hidden transition-colors cursor-pointer', 'bg-muted')}
      >
        {/* Fill wash */}
        <motion.i
          aria-hidden="true"
          style={{
            width: washWidth,
            borderRadius: gripRadius,
          }}
          className={cn('absolute inset-y-1 left-1 pointer-events-none not-italic', 'bg-foreground transition-colors')}
        />

        {/* Text prompt */}
        <motion.span
          style={{ opacity: textOpacity }}
          className="absolute inset-0 flex items-center justify-center pl-8 text-[0.84375rem] font-medium text-foreground/80 pointer-events-none select-none tracking-wide"
        >
          {label}
        </motion.span>

        {/* Morphing draggable grip */}
        <motion.button
          type="button"
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          style={{
            x: clampedF,
            scaleX,
            scaleY,
            width: gripWidth,
            borderRadius: gripRadius,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.7,
          }}
          aria-label={isDone ? confirmedLabel : label}
          className={cn(
            'absolute inset-y-1 left-1 border-0 p-0 flex items-center justify-center cursor-grab active:cursor-grabbing outline-none',
            'bg-foreground text-background',
          )}
        >
          {/* Arrow icon */}
          <motion.span
            style={{ opacity: arrowOpacity }}
            aria-hidden="true"
            className="flex items-center justify-center"
          >
            <IconArrowRight size={20} strokeWidth={2.4} />
          </motion.span>

          {/* Confirmed state text morph */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: isDone ? 1 : 0,
              scale: isDone ? 1 : 0.8,
              y: isDone ? 0 : 4,
            }}
            transition={{
              duration: 0.2,
              ease: [0.33, 0.55, 0.2, 1],
            }}
            className="absolute inset-0 flex items-center justify-center gap-1.5 text-[0.8125rem] font-semibold tracking-tight text-background"
          >
            <IconCheck size={17} strokeWidth={2.8} />
            <TextMorph>{confirmedLabel}</TextMorph>
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  )
}
