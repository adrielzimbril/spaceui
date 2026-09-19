'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

export type RouteThemeConstraint = 'dark' | 'light' | null

/**
 * Central registry of routes locked to a specific theme.
 * Add any new routes here to automatically lock their theme.
 */
export const THEME_LOCKED_ROUTES: Record<string, 'dark' | 'light'> = {
  '/showcase': 'dark',
}

export function getRouteThemeConstraint(pathname?: string | null): RouteThemeConstraint {
  if (!pathname) return null
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  for (const [route, theme] of Object.entries(THEME_LOCKED_ROUTES)) {
    if (clean === route || clean.startsWith(`${route}/`)) {
      return theme
    }
  }
  return null
}

/**
 * `next-themes`' <ThemeProvider> always injects its own no-flash script as
 * the first child of its context provider — i.e. inside <body>, right before
 * the rest of the app. That script only knows about localStorage/system
 * preference; it has no idea about THEME_LOCKED_ROUTES, so on a hard load of
 * a locked route it blindly re-applies the user's regular theme right after
 * our <head> script correctly forced the lock, undoing it until React
 * hydrates and ThemeLockProvider's effect corrects it again.
 *
 * Render this right after `<RootProvider>`'s opening (so it lands directly
 * after next-themes' own script in the DOM) to have the final say before any
 * real content paints.
 */
export function ThemeLockScript() {
  const routesJson = JSON.stringify(THEME_LOCKED_ROUTES)
  return (
    <script
      id="theme-lock-reconcile"
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var routes=${routesJson};var p=window.location.pathname.replace(/\\/+$/,'');var locked=null;for(var r in routes){if(p===r||p.indexOf(r+'/')===0){locked=routes[r];break;}}if(locked){var root=document.documentElement;var opposite=locked==='dark'?'light':'dark';root.classList.remove(opposite);root.classList.add(locked);root.style.colorScheme=locked;}}catch(e){}})();`,
      }}
    />
  )
}

interface ThemeLockContextValue {
  isThemeLocked: boolean
  lockedTheme: RouteThemeConstraint
  setDynamicThemeLock: (theme: RouteThemeConstraint) => void
}

const ThemeLockContext = createContext<ThemeLockContextValue>({
  isThemeLocked: false,
  lockedTheme: null,
  setDynamicThemeLock: () => {},
})

/**
 * ThemeLockProvider - enforces per-route or declarative theme constraints
 * WITHOUT mutating the user's global next-themes preference or localStorage.
 *
 * - On locked routes (e.g. /showcase): enforces dark class & colorScheme on documentElement.
 * - On route exit or free routes (e.g. /pricing, /docs): restores the user's actual resolvedTheme.
 */
export function ThemeLockProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [dynamicLock, setDynamicLock] = useState<RouteThemeConstraint>(null)

  const routeConstraint = getRouteThemeConstraint(pathname)
  const activeConstraint = dynamicLock ?? routeConstraint
  const isThemeLocked = activeConstraint !== null

  useEffect(() => {
    if (!isThemeLocked) {
      // Free routes: let documentElement reflect the user's actual chosen theme
      const userTheme =
        resolvedTheme || (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) || 'light'
      if (userTheme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        document.documentElement.style.colorScheme = 'light'
      } else {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      }
      return
    }

    // Locked route/component: strictly enforce the constraint
    const targetTheme = activeConstraint
    const oppositeTheme = targetTheme === 'dark' ? 'light' : 'dark'

    const applyLockedTheme = () => {
      if (
        !document.documentElement.classList.contains(targetTheme) ||
        document.documentElement.classList.contains(oppositeTheme) ||
        document.documentElement.style.colorScheme !== targetTheme
      ) {
        document.documentElement.classList.remove(oppositeTheme)
        document.documentElement.classList.add(targetTheme)
        document.documentElement.style.colorScheme = targetTheme
      }
    }

    applyLockedTheme()

    // MutationObserver ensures next-themes or any external hydration cannot revert it
    const observer = new MutationObserver(() => {
      applyLockedTheme()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => {
      observer.disconnect()
      // On leaving locked state, immediately restore user's actual theme
      const userTheme =
        (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) || resolvedTheme || 'light'
      if (userTheme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        document.documentElement.style.colorScheme = 'light'
      } else {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      }
    }
  }, [isThemeLocked, activeConstraint, resolvedTheme])

  const value = React.useMemo<ThemeLockContextValue>(
    () => ({
      isThemeLocked,
      lockedTheme: activeConstraint,
      setDynamicThemeLock: setDynamicLock,
    }),
    [isThemeLocked, activeConstraint],
  )

  return <ThemeLockContext.Provider value={value}>{children}</ThemeLockContext.Provider>
}

export function useThemeLock(): ThemeLockContextValue {
  return useContext(ThemeLockContext)
}

/**
 * Declarative component to lock any page or component to 'dark' or 'light'.
 *
 * Usage:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <>
 *       <PageThemeLock theme="dark" />
 *       <div>...</div>
 *     </>
 *   )
 * }
 * ```
 */
export function PageThemeLock({
  theme = 'dark',
  children,
  className,
}: {
  theme?: 'dark' | 'light'
  children?: React.ReactNode
  className?: string
}) {
  const { setDynamicThemeLock } = useThemeLock()

  useEffect(() => {
    setDynamicThemeLock(theme)
    return () => {
      setDynamicThemeLock(null)
    }
  }, [theme, setDynamicThemeLock])

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{document.documentElement.classList.remove('${theme === 'dark' ? 'light' : 'dark'}');document.documentElement.classList.add('${theme}');document.documentElement.style.colorScheme='${theme}';}catch(e){}})();`,
        }}
      />
      {children ? <div className={`${theme} ${className || ''}`}>{children}</div> : null}
    </>
  )
}
