'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface FloatNavContextValue {
  show: boolean
  request: () => void
  release: () => void
}

const FloatNavContext = createContext<FloatNavContextValue>({
  show: false,
  request: () => {},
  release: () => {},
})

/**
 * `/tools/*` pages are excluded from the global FloatNav by default (they have
 * their own ResourceStudio toolbar). A tool opts back in with `useFloatNav()`
 * rather than the layout hardcoding an exception per route.
 */
export function FloatNavProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  const request = useCallback(() => setCount((c) => c + 1), [])
  const release = useCallback(() => setCount((c) => Math.max(0, c - 1)), [])

  const value = useMemo(() => ({ show: count > 0, request, release }), [count, request, release])

  return <FloatNavContext.Provider value={value}>{children}</FloatNavContext.Provider>
}

export function useFloatNavRequested() {
  return useContext(FloatNavContext).show
}

/** Call from within a page that wants the global FloatNav shown despite its route being excluded by default. */
export function useFloatNav(enabled = true) {
  const { request, release } = useContext(FloatNavContext)

  useEffect(() => {
    if (!enabled) return
    request()
    return () => release()
  }, [enabled, request, release])
}
