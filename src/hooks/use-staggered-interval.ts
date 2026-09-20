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
  // Recomputed only when intervalMs/jitterMs actually change, not on every render —
  // a plain ref set once would ignore a later change to intervalMs entirely.
  const delay = React.useMemo(() => intervalMs + Math.random() * jitter, [intervalMs, jitter])

  React.useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => callbackRef.current(), delay)
    return () => clearInterval(timer)
  }, [enabled, delay])
}
