'use client'

import React, { useState } from 'react'
import {
  useLayoutMode,
  SPLIT_INFO_STORAGE_KEY,
  SPLIT_MOBILE_INFO_STORAGE_KEY,
} from '@/components/providers/layout-mode-provider'
import { bloomSound, slideSound } from '@/components/providers/sound-provider'
import { useLocalStorage } from '@/registry/hooks/browser/use-local-storage'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { PlaygroundDocPanel } from './playground-doc-panel'
import { PlaygroundCanvasStage } from './playground-canvas-stage'
import type { ViewportMode } from './playground-viewport-switcher'

export function PlaygroundSplitView({ children }: { children: React.ReactNode }) {
  const { setMode, isStandard, activePreview, isImmersive, toggleImmersive } = useLayoutMode()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [viewport, setViewport] = useState<ViewportMode>('desktop')
  const [desktopShowInfo, setDesktopShowInfo, removeDesktopShowInfo] = useLocalStorage<boolean>(
    SPLIT_INFO_STORAGE_KEY,
    true,
  )
  const [mobileShowInfo, setMobileShowInfo, removeMobileShowInfo] = useLocalStorage<boolean>(
    SPLIT_MOBILE_INFO_STORAGE_KEY,
    false,
  )
  const [reloadKey, setReloadKey] = useState(0)

  if (isStandard) {
    return <>{children}</>
  }

  const hideDocPanel = Boolean(activePreview?.hideDocPanel)
  const showInfo = hideDocPanel ? false : isImmersive ? false : isDesktop ? desktopShowInfo : mobileShowInfo

  const handleToggleInfo = () => {
    bloomSound()
    if (isDesktop) {
      setDesktopShowInfo((prev) => !prev)
    } else {
      setMobileShowInfo((prev) => !prev)
    }
  }

  const handleReplay = () => {
    slideSound('in')
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground overscroll-none flex flex-col z-30">
      {/* 2. Left Sliding Documentation & Code Panel (40%) — omitted entirely when the active preview has no doc content */}
      {!hideDocPanel && (
        <PlaygroundDocPanel showInfo={showInfo} onClose={handleToggleInfo}>
          {children}
        </PlaygroundDocPanel>
      )}

      {/* 3. Right Interactive Canvas Stage (60% or 100%) */}
      <PlaygroundCanvasStage
        showInfo={showInfo}
        isImmersive={isImmersive}
        onToggleImmersive={toggleImmersive}
        activePreview={activePreview}
        viewport={viewport}
        onViewportChange={setViewport}
        onToggleInfo={handleToggleInfo}
        onReplay={handleReplay}
        reloadKey={reloadKey}
      />
    </div>
  )
}

export { ToolbarSection } from './playground-toolbar-section'
export { ToolbarButton } from './playground-toolbar-button'
