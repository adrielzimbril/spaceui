'use client'

import * as React from 'react'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { Animoji, type AnimojiSource } from '@/registry/components/spaceui/animoji'
import { cn } from '@/registry/lib/utils'

export interface HeroBadgeTextProps {
  /** A single phrase loops in place; an array rotates through each phrase. Embed any emoji directly in the string. */
  text: string | string[]
  /** Set false for a plain, unanimated badge. Ignored when `text` is an array — those always animate. @default true */
  animate?: boolean
  /** Loop/rotation interval in ms. @default 3400 */
  delay?: number
  /** @default 'fluent' */
  source?: AnimojiSource
  className?: string
}

/**
 * The rotating/looping status-badge text used across marketing hero sections.
 * Emoji inside `text` render through Animoji instead of a separate static icon,
 * so the whole phrase — words and emoji alike — reveals as one unit.
 */
export function HeroBadgeText({
  text,
  animate = true,
  delay = 3400,
  source = 'fluent',
  className,
}: HeroBadgeTextProps) {
  const phrases = Array.isArray(text) ? text : [text]
  const isStatic = !animate && phrases.length === 1
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    if (isStatic) return
    const id = window.setInterval(() => setTick((t) => t + 1), delay)
    return () => window.clearInterval(id)
  }, [isStatic, delay])

  const current = phrases[tick % phrases.length]

  if (isStatic) {
    return (
      <span className={cn('inline-flex items-center whitespace-nowrap', className)}>
        <Animoji source={source}>{current}</Animoji>
      </span>
    )
  }

  return (
    <BlurRevealText
      as="span"
      text={current}
      replayKey={tick}
      splitBy="words"
      inView={false}
      className={cn('whitespace-nowrap', className)}
      renderSegment={(segment) => <Animoji source={source}>{segment}</Animoji>}
    />
  )
}
