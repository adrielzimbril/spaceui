'use client'

import * as React from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { cn } from '@/registry/lib/utils'

export interface ScrollRevealSpringPhysics {
  stiffness?: number
  damping?: number
  mass?: number
}

export interface ScrollRevealTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of string lines to reveal sequentially while scrolling */
  lines?: readonly string[]
  /** Total height of the scrollable track, e.g. "180svh". @default "180svh" */
  scrollLength?: string
  /** Spring physics tuning for smooth scroll interpolation */
  physics?: ScrollRevealSpringPhysics
  /** Custom class for the sticky centered viewport wrapper */
  stickyClassName?: string
  /** Custom class for the muted background text */
  mutedClassName?: string
  /** Custom class for the illuminated revealed text */
  revealedClassName?: string
  /** Custom color applied to revealed text (overrides foreground) */
  revealedColor?: string
  /** Optional scroll container ref if nested inside an overflow container */
  scrollContainerRef?: React.RefObject<HTMLElement | null>
  /** Show minimal progress bar along the bottom of the sticky area. @default false */
  showProgress?: boolean
}

interface RevealLineItemProps {
  index: number
  totalLines: number
  line: string
  progress: MotionValue<number>
  mutedClassName?: string
  revealedClassName?: string
  revealedColor?: string
  isReducedMotion: boolean
}

const DEFAULT_LINES = [
  'We believe software should feel weightless.',
  'Every curve, transition, and micro-gesture',
  'Crafted to inspire and elevate human craft.',
] as const

const DEFAULT_PHYSICS: Required<ScrollRevealSpringPhysics> = {
  stiffness: 220,
  damping: 30,
  mass: 0.8,
}

function RevealLineItem({
  index,
  totalLines,
  line,
  progress,
  mutedClassName,
  revealedClassName,
  revealedColor,
  isReducedMotion,
}: RevealLineItemProps) {
  // Allocate an interval window [lineStart, lineEnd] for each line
  const lineStart = (index / totalLines) * 0.82 + 0.06
  const lineEnd = ((index + 1) / totalLines) * 0.82 + 0.06

  const clipPath = useTransform(
    progress,
    [lineStart, lineEnd],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
    { clamp: true },
  )

  return (
    <span className="relative block select-none">
      {/* Muted background representation */}
      <span
        className={cn(
          'text-muted-foreground/25 transition-colors duration-200',
          mutedClassName,
        )}
      >
        {line}
      </span>

      {/* Illuminated foreground with scroll-driven clip-path */}
      <motion.span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 text-foreground will-change-[clip-path]',
          revealedClassName,
        )}
        style={{
          clipPath: isReducedMotion ? 'inset(0 0% 0 0)' : clipPath,
          color: revealedColor,
        }}
      >
        {line}
      </motion.span>
    </span>
  )
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  lines = DEFAULT_LINES,
  scrollLength = '180svh',
  physics = DEFAULT_PHYSICS,
  className,
  stickyClassName,
  mutedClassName,
  revealedClassName,
  revealedColor,
  scrollContainerRef,
  showProgress = false,
  ...props
}) => {
  const trackRef = React.useRef<HTMLElement | null>(null)
  const isReducedMotion = Boolean(useReducedMotion())

  const safeLines = React.useMemo(
    () => (lines && lines.length > 0 ? lines : DEFAULT_LINES),
    [lines],
  )

  const { scrollYProgress } = useScroll({
    target: trackRef,
    container: scrollContainerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: physics.stiffness ?? DEFAULT_PHYSICS.stiffness,
    damping: physics.damping ?? DEFAULT_PHYSICS.damping,
    mass: physics.mass ?? DEFAULT_PHYSICS.mass,
  })

  return (
    <section
      ref={trackRef}
      className={cn('relative w-full', className)}
      style={{ minHeight: scrollLength }}
      {...props}
    >
      <div
        className={cn(
          'sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-6 py-16 sm:px-12',
          stickyClassName,
        )}
      >
        {/* Main multiline narrative statement */}
        <p className="w-full max-w-5xl text-balance text-left text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
          {safeLines.map((line, idx) => (
            <RevealLineItem
              key={`${line}-${idx}`}
              index={idx}
              totalLines={safeLines.length}
              line={line}
              progress={smoothProgress}
              mutedClassName={mutedClassName}
              revealedClassName={revealedClassName}
              revealedColor={revealedColor}
              isReducedMotion={isReducedMotion}
            />
          ))}
        </p>

        {/* Minimal bottom progress indicator */}
        {showProgress && !isReducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary origin-left"
              style={{ scaleX: smoothProgress }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
