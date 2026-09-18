'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

export type RouteThemeConstraint = 'dark' | 'light' | null

/**
 * Returns the forced theme for a given route, or null if the route is free.
 * /showcase and all sub-routes are locked to dark.
 */
export function getRouteThemeConstraint(pathname?: string | null): RouteThemeConstraint {
  if (!pathname) return null
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (clean === '/showcase' || clean.startsWith('/showcase/')) return 'dark'
  return null
}

interface ThemeLockContextValue {
  isThemeLocked: boolean
  lockedTheme: RouteThemeConstraint
}

const ThemeLockContext = createContext<ThemeLockContextValue>({
  isThemeLocked: false,
  lockedTheme: null,
})

/**
 * ThemeLockProvider - enforces per-route theme constraints.
 * Entering a locked route: saves the user theme and applies the forced one.
 * Leaving a locked route: restores the saved theme.
 * Must be rendered inside next-themes ThemeProvider (inside RootProvider).
 */
export function ThemeLockProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const themeRef = useRef(theme)
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const themeConstraint = getRouteThemeConstraint(pathname)
  const isThemeLocked = themeConstraint !== null

  const savedThemeRef = useRef<string | null>(null)
  const prevConstraintRef = useRef<RouteThemeConstraint>(themeConstraint)

  useEffect(() => {
    const prev = prevConstraintRef.current
    prevConstraintRef.current = themeConstraint

    if (themeConstraint && !prev) {
      savedThemeRef.current = themeRef.current ?? 'system'
      setTheme(themeConstraint)
    } else if (!themeConstraint && prev) {
      if (savedThemeRef.current) {
        setTheme(savedThemeRef.current)
        savedThemeRef.current = null
      }
    } else if (themeConstraint && prev && themeConstraint !== prev) {
      setTheme(themeConstraint)
    }
  }, [themeConstraint, setTheme])

  const value = React.useMemo<ThemeLockContextValue>(
    () => ({ isThemeLocked, lockedTheme: themeConstraint }),
    [isThemeLocked, themeConstraint],
  )

  return <ThemeLockContext.Provider value={value}>{children}</ThemeLockContext.Provider>
}

export function useThemeLock(): ThemeLockContextValue {
  return useContext(ThemeLockContext)
}
