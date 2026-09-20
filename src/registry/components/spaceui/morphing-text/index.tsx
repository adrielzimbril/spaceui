'use client'

import * as React from 'react'
import { AnimatePresence, LayoutGroup, motion, type Transition, type Variants } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export interface TextMorphProps extends React.HTMLAttributes<HTMLElement> {
  /** The text string to render and morph */
  children: string
  /** HTML element tag to render. @default "span" */
  as?: React.ElementType
  /** Custom class for outer wrapper */
  className?: string
  /** Custom blur intensity during transition. @default "10px" */
  blurAmount?: string
  /** Spring bounce factor (0 to 1). @default 0.14 */
  springBounce?: number
  /** Overrides how each character token renders, e.g. to run it through Textmoji. Defaults to the raw character. */
  renderChar?: (char: string) => React.ReactNode
}

export interface MorphingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of strings to cycle through */
  texts: string[]
  /** Interval in milliseconds between morphs. @default 2400 */
  interval?: number
  /** Pause auto-cycling when cursor hovers over the text. @default true */
  pauseOnHover?: boolean
  /** Custom blur intensity during transitions. @default "10px" */
  blurAmount?: string
  /** Spring bounce factor for layout animations. @default 0.14 */
  springBounce?: number
  /** Custom class for outer wrapper */
  className?: string
  /** Custom class for the text */
  textClassName?: string
  /** Overrides how each character token renders, e.g. to run it through Textmoji. Defaults to the raw character. */
  renderChar?: (char: string) => React.ReactNode
}

interface CharToken {
  id: string
  displayChar: string
}

function getCharacterTokens(text: string, scopeId: string): CharToken[] {
  const counts = new Map<string, number>()

  return Array.from(text).map((char) => {
    const key = char.toLowerCase()
    const occurrence = (counts.get(key) ?? 0) + 1
    counts.set(key, occurrence)

    return {
      id: `${scopeId}-${key}-${occurrence}`,
      displayChar: char === ' ' ? '\u00A0' : char,
    }
  })
}

export const TextMorph: React.FC<TextMorphProps> = ({
  children,
  as: Component = 'span',
  className,
  blurAmount = '10px',
  springBounce = 0.14,
  renderChar,
  style,
  ...props
}) => {
  const scopeId = React.useId()
  const tokens = React.useMemo(() => getCharacterTokens(children, scopeId), [children, scopeId])

  const variants: Variants = {
    initial: {
      opacity: 0,
      filter: 'blur(0px)',
      y: 8,
    },
    animate: {
      opacity: 1,
      filter: [`blur(${blurAmount})`, `blur(${blurAmount})`, 'blur(0px)'],
      y: 0,
    },
    exit: {
      opacity: 0,
      filter: 'blur(0px)',
      y: -8,
    },
  }

  const transition: Transition = {
    duration: 0.24,
    ease: 'easeOut',
    filter: { duration: 0.24, ease: 'easeOut' },
    opacity: { duration: 0.24, ease: 'easeOut' },
    y: { duration: 0.24, ease: 'easeOut' },
    layout: {
      type: 'spring',
      bounce: springBounce,
    },
  }

  return (
    <Component
      aria-label={children}
      className={cn(
        'relative isolate inline-flex flex-wrap items-center justify-center overflow-hidden whitespace-pre leading-none font-inherit',
        className,
      )}
      style={style}
      {...(props as any)}
    >
      <LayoutGroup id={scopeId}>
        <AnimatePresence initial={false} mode="popLayout">
          {tokens.map((token) => (
            <motion.span
              key={token.id}
              layout
              layoutId={token.id}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={transition}
              aria-hidden="true"
              className="inline-block whitespace-pre will-change-[transform,filter,opacity]"
            >
              {renderChar ? renderChar(token.displayChar) : token.displayChar}
            </motion.span>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </Component>
  )
}

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  interval = 2400,
  pauseOnHover = true,
  blurAmount = '10px',
  springBounce = 0.14,
  className,
  textClassName,
  renderChar,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [index, setIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (!texts || texts.length < 2 || isPaused) return

    const timer = setInterval(() => {
      setIndex((curr) => (curr + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts, interval, isPaused])

  if (!texts || texts.length === 0) return null

  const currentText = texts[index % texts.length] ?? ''

  return (
    <div
      className={cn('relative w-full min-w-0 inline-flex items-center justify-center', className)}
      onMouseEnter={(e) => {
        if (pauseOnHover) setIsPaused(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (pauseOnHover) setIsPaused(false)
        onMouseLeave?.(e)
      }}
      {...props}
    >
      <TextMorph
        blurAmount={blurAmount}
        springBounce={springBounce}
        renderChar={renderChar}
        className={cn(
          'text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground text-center',
          textClassName,
        )}
      >
        {currentText}
      </TextMorph>
    </div>
  )
}
