'use client'

import React from 'react'
import { ToolbarButton } from './playground-toolbar-button'
import { ToolbarSection } from './playground-toolbar-section'
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconRotateClockwise,
  IconSun,
  IconMoon,
  IconLayoutColumns,
  IconExternalLink,
  IconAdjustmentsHorizontal,
  IconDeviceDesktop,
} from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { triggerThemeTransition, type ThemeValue } from '@/registry/components/spaceui/mode-switcher'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { getEffectivePreviewTheme } from '@/config/preview-config'
import { cn } from '@/registry/lib/utils'

export interface PlaygroundToolbarProps {
  showInfo: boolean
  onToggleInfo: () => void
  isImmersive?: boolean
  onToggleImmersive?: () => void
  onReplay: () => void
  previewName?: string
  hasBinds?: boolean
  tweakpaneOpen?: boolean
  onToggleTweakpane?: () => void
  restart?: boolean
  open?: boolean
  themeOverride?: 'system' | 'light' | 'dark'
  onThemeOverrideChange?: (theme: 'system' | 'light' | 'dark') => void
  className?: string
}

export function PlaygroundToolbar({
  showInfo,
  onToggleInfo,
  isImmersive = false,
  onToggleImmersive,
  onReplay,
  previewName,
  hasBinds,
  tweakpaneOpen,
  onToggleTweakpane,
  restart = true,
  open = true,
  themeOverride = 'system',
  onThemeOverrideChange,
  className,
}: PlaygroundToolbarProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const effectiveTheme: ThemeValue = getEffectivePreviewTheme(themeOverride, resolvedTheme || theme)

  const handleToggleTheme = (e?: React.MouseEvent<HTMLElement>) => {
    const target = e?.currentTarget ?? (typeof document !== 'undefined' ? document.body : undefined)
    const nextTheme: ThemeValue =
      themeOverride === 'system'
        ? effectiveTheme === 'light'
          ? 'dark'
          : 'light'
        : themeOverride === 'light'
          ? 'dark'
          : 'system'

    if (onThemeOverrideChange) {
      if (target) {
        void triggerThemeTransition(target, () => {
          onThemeOverrideChange(nextTheme)
        })
      } else {
        onThemeOverrideChange(nextTheme)
      }
    } else {
      if (target) {
        void triggerThemeTransition(target, () => {
          setTheme(nextTheme)
        })
      } else {
        setTheme(nextTheme)
      }
    }
  }

  if (isImmersive) {
    return (
      <ToolbarSection
        aria-label="Exit immersion"
        className={cn(
          'right-3 top-3 opacity-60 hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md',
          className,
        )}
      >
        <ToolbarButton label="Exit immersion (Esc / F)" onClick={onToggleImmersive}>
          <IconArrowsMinimize className="size-4" />
        </ToolbarButton>
      </ToolbarSection>
    )
  }

  return (
    <ToolbarSection aria-label="Playground actions" className={cn('right-2 top-2 md:top-4', className)}>
      {/* 1. Toggle Doc Panel (Hide/Show side elements to expand canvas) */}
      <ToolbarButton label={showInfo ? 'Hide side panel' : 'Show side panel'} pressed={showInfo} onClick={onToggleInfo}>
        <MorphIcon activeKey={showInfo ? 'expanded' : 'collapsed'} variant="blur-scale">
          {showInfo ? (
            <IconLayoutSidebarLeftCollapse className="size-4" />
          ) : (
            <IconLayoutSidebarLeftExpand className="size-4" />
          )}
        </MorphIcon>
      </ToolbarButton>

      {/* 2. Total Immersion (Hide UI / Fullscreen 100vw x 100vh) */}
      {onToggleImmersive && (
        <ToolbarButton label="Total immersion (Hide UI) [F]" onClick={onToggleImmersive}>
          <IconArrowsMaximize className="size-4" />
        </ToolbarButton>
      )}
      {/* 3. Open in new tab / window (Full immersion / Respects open prop from standard mode) */}
      {open !== false && (
        <ToolbarButton
          label="Open in new window"
          onClick={() => {
            window.open(`/registry/view/${previewName}`, '_blank')
          }}
        >
          <IconExternalLink className="size-4" />
        </ToolbarButton>
      )}

      {/* 4. Canvas / Site Theme Toggle with MorphIcon */}
      <ToolbarButton
        label={
          themeOverride === 'system' ? `Preview theme: auto (${effectiveTheme})` : `Preview theme: ${themeOverride}`
        }
        onClick={handleToggleTheme}
        className="relative overflow-hidden cursor-pointer"
      >
        <MorphIcon activeKey={effectiveTheme} variant="blur-scale">
          {themeOverride === 'system' && <IconDeviceDesktop className="size-4" />}
          {themeOverride !== 'system' && effectiveTheme === 'light' && <IconSun className="size-4" />}
          {themeOverride !== 'system' && effectiveTheme === 'dark' && <IconMoon className="size-4" />}
        </MorphIcon>
      </ToolbarButton>

      {/* 2. Replay / Reset animation (shown by default if component has tweakpane binds or restart is enabled) */}
      {(restart || hasBinds) && (
        <ToolbarButton label={hasBinds ? 'Reset controls & replay' : 'Replay animation'} onClick={onReplay}>
          <IconRotateClockwise className="size-4" />
        </ToolbarButton>
      )}

      {/* 5. Tweakpane config props (only if component has configurable binds) */}
      {hasBinds && onToggleTweakpane && (
        <ToolbarButton label="Configure props" pressed={tweakpaneOpen} onClick={onToggleTweakpane}>
          <IconAdjustmentsHorizontal className="size-4" />
        </ToolbarButton>
      )}
    </ToolbarSection>
  )
}
