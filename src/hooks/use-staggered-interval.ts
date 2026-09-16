'use client'

import * as React from 'react'

/**
 * Same as setInterval in a useEffect, but adds a random per-mount jitter to
 * the delay so multiple instances sharing the same base interval (e.g. bento
 * demo cards on the same page) don't all tick in lockstep.
 */
export function useStaggeredInterval(callback: () => void, intervalMs: number, enabled = true, jitterMs?: number) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  const jitter = jitterMs ?? intervalMs * 0.5
  const delayRef = React.useRef<number | null>(null)
  if (delayRef.current === null) {
    delayRef.current = intervalMs + Math.random() * jitter
  }

  React.useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => callbackRef.current(), delayRef.current!)
    return () => clearInterval(timer)
  }, [enabled])
}
