'use client'

import * as React from 'react'
import { motion, useInView, type Variants } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type SplitMode = 'words' | 'characters' | 'lines'

export type RevealDirection = 'up' | 'down' | 'none'

export interface BlurRevealTextProps extends React.HTMLAttributes<HTMLElement> {
  /** The text content to animate */
  text: string
  /** HTML element tag to render. @default "p" */
  as?: React.ElementType
  /** Custom class for the outer wrapper */
  className?: string
  /** Custom class for each word/character token */
  segmentClassName?: string
  /** Splitting strategy: 'words', 'characters', or 'lines'. @default "words" */
  splitBy?: SplitMode
  /** Delay between each animated segment in seconds. @default 0.05 */
  stagger?: number
  /** Initial delay before starting the animation in seconds. @default 0.1 */
  delay?: number
  /** Initial blur filter before revealing. @default "12px" */
  blurAmount?: string
  /** Duration of each segment's transition in seconds. @default 0.35 */
  duration?: number
  /** Direction from which tokens slide in. @default "up" */
  direction?: RevealDirection
  /** Distance in pixels tokens move along the Y-axis. @default 8 */
  yOffset?: number
  /** Whether animation triggers only when element enters the viewport. @default true */
  inView?: boolean
  /** Only animate once when entering view. @default true */
  once?: boolean
  /** Changing this key triggers a replay of the animation */
  replayKey?: string | number
  /** Overrides how each segment renders, e.g. to run it through Textmoji. Defaults to the raw segment text. */
  renderSegment?: (segment: string) => React.ReactNode
}

function splitText(text: string, mode: SplitMode): string[] {
  if (!text) return []
  if (mode === 'characters') {
    return Array.from(text)
  }
  if (mode === 'lines') {
    return text.split('\n')
  }
  // Default: words (splitting by spaces while preserving word tokens)
  return text.split(' ')
}

export const BlurRevealText: React.FC<BlurRevealTextProps> = ({
  text,
  as: Component = 'p',
  className,
  segmentClassName,
  splitBy = 'words',
  stagger = 0.05,
  delay = 0.1,
  blurAmount = '12px',
  duration = 0.35,
  direction = 'up',
  yOffset = 8,
  inView = true,
  once = true,
  replayKey,
  renderSegment,
  style,
  ...props
}) => {
  const containerRef = React.useRef<HTMLElement | null>(null)
  const isElementInView = useInView(containerRef, { once })

  const shouldAnimate = inView ? isElementInView : true

  const segments = React.useMemo(() => splitText(text, splitBy), [text, splitBy])

  const initialY = direction === 'up' ? yOffset : direction === 'down' ? -yOffset : 0

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const segmentVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: `blur(${blurAmount})`,
      y: initialY,
      willChange: 'filter, transform, opacity',
    },
    visible: {
      opacity: 1,
      filter: 'none',
      y: 0,
      willChange: 'auto',
      transition: { duration, ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  const MotionComponent = motion.create(Component)

  return (
    <MotionComponent
      ref={containerRef as React.Ref<any>}
      key={replayKey}
      className={cn('inline-flex flex-wrap items-baseline', className)}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      variants={containerVariants}
      style={style}
      aria-label={text}
      {...(props as any)}
    >
      {segments.map((segment, index) => {
        const isSpace = segment === ' '
        const displayText =
          splitBy === 'words' ? segment + (index < segments.length - 1 ? '\u00A0' : '') : isSpace ? '\u00A0' : segment

        return (
          <motion.span
            key={`${segment}-${index}`}
            variants={segmentVariants}
            className={cn('inline-block whitespace-pre', segmentClassName)}
          >
            {renderSegment ? renderSegment(displayText) : displayText}
          </motion.span>
        )
      })}
    </MotionComponent>
  )
}
