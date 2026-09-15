'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useGlobalThemeChange } from '@/components/docs/preview/hooks/use-global-theme-change'
import { useEventListener } from '@/registry/hooks/dom/use-event-listener'
import { bloomSound, slideSound } from '@/components/providers/sound-provider'
import { useLocalStorage } from '@/registry/hooks/browser/use-local-storage'
import { useCookie } from '@/registry/hooks/browser/use-cookie'
import { getRouteLayoutDefaults, Mode, LayoutMode, type PageLayoutConstraint } from '@/config/preview-config'

export { Mode, LayoutMode }
export type { PageLayoutConstraint }

export interface ActivePreviewInfo {
  name: string
  title?: string
  component?: React.ComponentType<any>
  componentProps?: Record<string, any> | null
  useIframe?: boolean
  previewName?: string
  code?: string | null
  binds?: any
  themeOverride?: 'system' | 'light' | 'dark'
  restart?: boolean
  open?: boolean
  contained?: boolean
  componentGroup?: string | null
  bigScreen?: boolean
}

type LayoutModeContextValue = {
  mode: LayoutMode
  userPreferredMode: LayoutMode
  setMode: (mode: LayoutMode) => void
  cycleMode: () => void
  isSplit: boolean
  isStandard: boolean
  activePreview: ActivePreviewInfo | null
  setActivePreview: (info: ActivePreviewInfo | null) => void
  registerDefaultPreview: (info: ActivePreviewInfo) => void
  pageConstraint: PageLayoutConstraint | null
  setPageConstraint: (constraint: PageLayoutConstraint | null) => void
  canSwitchMode: boolean
  isModeLocked: boolean
  isImmersive: boolean
  setIsImmersive: (immersive: boolean) => void
  toggleImmersive: () => void
  activeTweakName: string | null
  setActiveTweakName: React.Dispatch<React.SetStateAction<string | null>>
}

const LayoutModeContext = createContext<LayoutModeContextValue>({
  mode: Mode.standard,
  userPreferredMode: Mode.standard,
  setMode: () => {},
  cycleMode: () => {},
  isSplit: false,
  isStandard: true,
  activePreview: null,
  setActivePreview: () => {},
  registerDefaultPreview: () => {},
  pageConstraint: null,
  setPageConstraint: () => {},
  canSwitchMode: true,
  isModeLocked: false,
  isImmersive: false,
  setIsImmersive: () => {},
  toggleImmersive: () => {},
  activeTweakName: null,
  setActiveTweakName: () => {},
})

export const STORAGE_KEY = 'space-ui-layout-mode'
export const SPLIT_INFO_STORAGE_KEY = 'space-ui-split-info'
export const SPLIT_MOBILE_INFO_STORAGE_KEY = 'space-ui-split-mobile-info'

export function LayoutModeProvider({
  children,
  initialMode = Mode.standard,
}: {
  children: React.ReactNode
  initialMode?: LayoutMode
}) {
  const pathname = usePathname()
  const [userPreferredMode, setUserPreferredMode] = useLocalStorage<LayoutMode>(STORAGE_KEY, initialMode)
  const [, , removeSplitInfo] = useLocalStorage<boolean>(SPLIT_INFO_STORAGE_KEY, true)
  const [, , removeMobileSplitInfo] = useLocalStorage<boolean>(SPLIT_MOBILE_INFO_STORAGE_KEY, false)
  const [, setCookie] = useCookie<string>(STORAGE_KEY)
  const [activePreview, setActivePreview] = useState<ActivePreviewInfo | null>(null)
  const [activeTweakName, setActiveTweakName] = useState<string | null>(null)

  // Page-level layout constraint registered by MDX frontmatter
  const [pageConstraint, setPageConstraint] = useState<PageLayoutConstraint | null>(null)
  // Per-page user override if the user explicitly switches mode on a page that allows switching
  const [pageOverride, setPageOverride] = useState<LayoutMode | null>(null)
  // Immersion mode (total fullscreen: hides site header, float nav, installation drawer, doc panel, borders)
  const [isImmersive, setIsImmersive] = useState<boolean>(false)

  // Global site theme always overrides local preview theme overrides.
  // A local override persists only until the user modifies the global site theme,
  // at which point the preview resets back to 'system'.
  useGlobalThemeChange(
    useCallback(() => {
      setActivePreview((current) => {
        if (current && current.themeOverride && current.themeOverride !== 'system') {
          return {
            ...current,
            themeOverride: 'system',
          }
        }
        return current
      })
    }, []),
  )

  const prevPathnameRef = useRef(pathname)
  // Reset active preview, page-specific override, immersive mode, and active tweakpane on route transition
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setActivePreview(null)
      setPageOverride(null)
      setIsImmersive(false)
      setActiveTweakName(null)
    }
  }, [pathname])

  const toggleImmersive = useCallback(() => {
    bloomSound()
    setIsImmersive((prev) => !prev)
  }, [])

  const routeDefaults = useMemo(() => getRouteLayoutDefaults(pathname), [pathname])

  // Determine whether mode switching is allowed on the current page
  const isModeLocked = Boolean(
    (pageConstraint?.mode &&
      pageConstraint.mode !== Mode.both &&
      (pageConstraint.mode === Mode.standard || pageConstraint.mode === Mode.split)) ||
    (routeDefaults?.constraint?.mode &&
      routeDefaults.constraint.mode !== Mode.both &&
      (routeDefaults.constraint.mode === Mode.standard || routeDefaults.constraint.mode === Mode.split)),
  )
  const canSwitchMode = !isModeLocked

  // Compute effective layout mode
  const mode: LayoutMode = useMemo(() => {
    // 1. Strict frontmatter lock (page only supports one layout)
    if (pageConstraint?.mode === Mode.standard) return Mode.standard
    if (pageConstraint?.mode === Mode.split) return Mode.split

    // Synchronous route-level lock from central config
    if (routeDefaults?.constraint?.mode === Mode.standard) return Mode.standard
    if (routeDefaults?.constraint?.mode === Mode.split) return Mode.split

    // 2. User explicit toggle on the current page
    if (pageOverride) return pageOverride

    // 3. Category or page defaultMode (e.g. blocks & shaders default to split)
    if (pageConstraint?.defaultMode) return pageConstraint.defaultMode

    // Synchronous route-level default from central config (avoids standard flash)
    if (routeDefaults?.mode) return routeDefaults.mode

    // 4. Persistent user preference restored on unrestricted pages
    return userPreferredMode
  }, [pageConstraint, routeDefaults, pageOverride, userPreferredMode])

  // Synchronize DOM attribute and cookie when effective mode changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-layout-mode', mode)
    setCookie(mode, 365)
  }, [mode, setCookie])

  // Keyboard shortcuts: 'F' toggles immersion (when in Split mode or already in immersion), 'Escape' exits immersion
  useEventListener('keydown', (e: KeyboardEvent) => {
    // Don't intercept when user is typing into an input, textarea, or contentEditable
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.isContentEditable
    ) {
      return
    }

    if (e.key === 'Escape' && isImmersive) {
      setIsImmersive(false)
      bloomSound()
    } else if (
      (e.key === 'f' || e.key === 'F') &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      (mode === Mode.split || isImmersive)
    ) {
      e.preventDefault()
      toggleImmersive()
    }
  })

  const setMode = useCallback(
    (next: LayoutMode) => {
      if (isModeLocked) return
      bloomSound()
      slideSound('in')
      setPageOverride(next)
      setUserPreferredMode(next)
      if (next === Mode.standard) {
        removeSplitInfo()
        removeMobileSplitInfo()
      }
    },
    [isModeLocked, setUserPreferredMode, removeSplitInfo, removeMobileSplitInfo],
  )

  const cycleMode = useCallback(() => {
    if (isModeLocked) return
    bloomSound()
    slideSound('in')
    const next: LayoutMode = mode === Mode.standard ? Mode.split : Mode.standard
    setPageOverride(next)
    setUserPreferredMode(next)
    if (next === Mode.standard) {
      removeSplitInfo()
      removeMobileSplitInfo()
    }
  }, [isModeLocked, mode, setUserPreferredMode, removeSplitInfo, removeMobileSplitInfo])

  const registerDefaultPreview = useCallback((info: ActivePreviewInfo) => {
    setActivePreview((current) => {
      if (!current || current.name !== info.name) {
        return info
      }
      return {
        ...current,
        ...info,
        code: info.code ?? current.code,
        component: info.component ?? current.component,
        componentProps: info.componentProps ?? current.componentProps,
        binds: info.binds ?? current.binds,
        themeOverride: info.themeOverride ?? current.themeOverride,
        restart: info.restart ?? current.restart,
        open: info.open ?? current.open,
        contained: info.contained ?? current.contained,
        componentGroup: info.componentGroup ?? current.componentGroup,
        bigScreen: info.bigScreen ?? current.bigScreen,
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      mode,
      userPreferredMode,
      setMode,
      cycleMode,
      isSplit: mode === Mode.split,
      isStandard: mode === Mode.standard,
      activePreview,
      setActivePreview,
      registerDefaultPreview,
      pageConstraint,
      setPageConstraint,
      canSwitchMode,
      isModeLocked,
      isImmersive,
      setIsImmersive,
      toggleImmersive,
      activeTweakName,
      setActiveTweakName,
    }),
    [
      mode,
      userPreferredMode,
      setMode,
      cycleMode,
      activePreview,
      registerDefaultPreview,
      pageConstraint,
      canSwitchMode,
      isModeLocked,
      isImmersive,
      toggleImmersive,
      activeTweakName,
      setActiveTweakName,
    ],
  )

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>
}

export function useLayoutMode() {
  return useContext(LayoutModeContext)
}
