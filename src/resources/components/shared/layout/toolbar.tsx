'use client'

import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconDeviceDesktop,
  IconLayoutGrid,
  IconInputSpark,
  IconVideo,
  IconRotateClockwise,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { ToolbarSection } from '@/components/playground/playground-toolbar-section'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { triggerThemeTransition } from '@/registry/components/spaceui/mode-switcher'
import { useEventListener } from '@/registry/hooks/dom/use-event-listener'
import { bloomSound } from '@/components/providers/sound-provider'
import type { ResourceViewMode } from '@/resources/shared/types'

export type ResourceToolbarConfig = {
  theme?: boolean
  expand?: boolean
  info?: boolean
  sidebar?: boolean
  reset?: boolean
  viewToggle?: boolean
  video?: boolean
  view?: ResourceViewMode
  views?: ResourceViewMode[]
  onViewChange?: (view: ResourceViewMode) => void
  onReset?: () => void
  onToggleExpand?: (expanded: boolean) => void
  onToggleInfo?: (visible: boolean) => void
  onToggleSidebar?: (visible: boolean) => void
  infoVisible?: boolean
  sidebarVisible?: boolean
  expanded?: boolean
}

export function ResourceToolbar({
  left,
  right,
  config = {},
}: {
  left?: ReactNode
  right?: ReactNode
  config?: ResourceToolbarConfig
}) {
  const {
    theme = true,
    expand = true,
    info = false,
    sidebar = true,
    reset = true,
    viewToggle = false,
    video = false,
    view = 'gallery',
    views = ['gallery', 'mockup', 'seed'],
    onViewChange,
    onReset,
    onToggleExpand,
    onToggleInfo,
    onToggleSidebar,
    infoVisible = true,
    sidebarVisible = true,
    expanded = false,
  } = config

  const { resolvedTheme, setTheme } = useTheme()
  const activeTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  const handleToggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = activeTheme === 'dark' ? 'light' : 'dark'
    void triggerThemeTransition(event.currentTarget, () => setTheme(next))
  }

  const cycleView = () => {
    if (!onViewChange || views.length === 0) return
    const index = views.indexOf(view)
    const next = views[(index + 1) % views.length] ?? views[0]
    onViewChange(next)
  }

  const nextView = views[(Math.max(views.indexOf(view), 0) + 1) % views.length] ?? view
  const viewLabel =
    nextView === 'mockup' ? 'Mockup' : nextView === 'gallery' ? 'Gallery' : nextView === 'seed' ? 'Seed' : 'Video'

  // Keyboard shortcuts: 'F' toggles immersion/expand, 'Escape' exits immersion (like doc playground)
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (!expand || !onToggleExpand) return

    // Don't intercept when user is typing into an input, textarea, or contentEditable
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.isContentEditable
    ) {
      return
    }

    if (e.key === 'Escape' && expanded) {
      e.preventDefault()
      bloomSound()
      onToggleExpand(false)
    } else if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      bloomSound()
      onToggleExpand(!expanded)
    }
  })

  const handleToggleExpand = () => {
    bloomSound()
    onToggleExpand?.(!expanded)
  }

  const handleToggleInfo = () => {
    bloomSound()
    onToggleInfo?.(!infoVisible)
  }

  const handleToggleSidebar = () => {
    bloomSound()
    onToggleSidebar?.(!sidebarVisible)
  }

  const leftButtons = (
    <>
      {/* {info && !expanded ? (
        <ToolbarButton
          label={infoVisible ? 'Hide side panel' : 'Show side panel'}
          pressed={infoVisible}
          onClick={handleToggleInfo}
        >
          <MorphIcon activeKey={infoVisible ? 'expanded' : 'collapsed'} variant="blur-scale">
            {infoVisible ? (
              <IconLayoutSidebarLeftCollapse className="size-4" />
            ) : (
              <IconLayoutSidebarLeftExpand className="size-4" />
            )}
          </MorphIcon>
        </ToolbarButton>
      ) : null} */}
    </>
  )

  const defaultButtons = (
    <>
      {info && !expanded ? (
        <ToolbarButton
          label={infoVisible ? 'Hide side panel' : 'Show side panel'}
          pressed={infoVisible}
          onClick={handleToggleInfo}
        >
          <MorphIcon activeKey={infoVisible ? 'expanded' : 'collapsed'} variant="blur-scale">
            {infoVisible ? (
              <IconLayoutSidebarLeftCollapse className="size-4" />
            ) : (
              <IconLayoutSidebarLeftExpand className="size-4" />
            )}
          </MorphIcon>
        </ToolbarButton>
      ) : null}
      {sidebar && !expanded ? (
        <ToolbarButton
          label={sidebarVisible ? 'Hide controls' : 'Show controls'}
          pressed={sidebarVisible}
          onClick={handleToggleSidebar}
        >
          <MorphIcon activeKey={sidebarVisible ? 'expanded' : 'collapsed'} variant="blur-scale">
            {sidebarVisible ? (
              <IconLayoutSidebarRightCollapse className="size-4" />
            ) : (
              <IconLayoutSidebarRightExpand className="size-4" />
            )}
          </MorphIcon>
        </ToolbarButton>
      ) : null}

      {/* 3. Plein écran (Expand / Immersion) */}
      {expand ? (
        <ToolbarButton
          label={expanded ? 'Exit immersion (Esc / F)' : 'Total immersion (Hide UI) [F]'}
          pressed={expanded}
          onClick={handleToggleExpand}
        >
          <MorphIcon activeKey={expanded ? 'expanded' : 'collapsed'} variant="blur-scale">
            {expanded ? <IconArrowsMinimize className="size-4" /> : <IconArrowsMaximize className="size-4" />}
          </MorphIcon>
        </ToolbarButton>
      ) : null}

      {/* 4. Vue (Gallery / Mockup / Seed) */}
      {viewToggle && !expanded ? (
        <ToolbarButton label={viewLabel} pressed={view !== 'gallery' && view !== 'video'} onClick={cycleView}>
          {view === 'gallery' ? (
            <IconLayoutGrid className="size-4" />
          ) : view === 'mockup' ? (
            <IconDeviceDesktop className="size-4" />
          ) : (
            <IconInputSpark className="size-4" />
          )}
        </ToolbarButton>
      ) : null}

      {video && !expanded ? (
        <ToolbarButton
          label="Video"
          pressed={view === 'video'}
          onClick={() => onViewChange?.(view === 'video' ? 'gallery' : 'video')}
        >
          <IconVideo className="size-4" />
        </ToolbarButton>
      ) : null}

      {/* 5. Reset */}
      {reset && !expanded ? (
        <ToolbarButton label="Reset" onClick={onReset}>
          <IconRotateClockwise className="size-4" />
        </ToolbarButton>
      ) : null}

      {/* 6. Thème */}
      {theme ? (
        <ToolbarButton
          label={activeTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          onClick={handleToggleTheme}
        >
          <MorphIcon activeKey={activeTheme} variant="blur-scale">
            {activeTheme === 'dark' ? <IconMoon className="size-4" /> : <IconSun className="size-4" />}
          </MorphIcon>
        </ToolbarButton>
      ) : null}
    </>
  )

  return (
    <>
      {left || info ? (
        <ToolbarSection aria-label="Resource navigation" className="left-2 top-6">
          {left}
          {leftButtons}
        </ToolbarSection>
      ) : null}
      <ToolbarSection aria-label="Resource actions" className="right-2 top-6">
        {defaultButtons}
        {right}
      </ToolbarSection>
    </>
  )
}
