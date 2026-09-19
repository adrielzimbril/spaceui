'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useCookie } from '@/registry/hooks/browser/use-cookie'

export const THEME_COOKIE_KEY = 'space-ui-theme'

/**
 * Mirrors the resolved theme (light/dark, never "system") into a cookie so
 * the root layout can render the correct `dark`/`light` class on <html>
 * straight from SSR on the next request, instead of relying on the client
 * no-flash script to apply it after the document starts parsing.
 */
export function ThemeCookieSync() {
  const { resolvedTheme } = useTheme()
  const [, setThemeCookie] = useCookie<string>(THEME_COOKIE_KEY)

  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return
    setThemeCookie(resolvedTheme, 365)
  }, [resolvedTheme, setThemeCookie])

  return null
}
