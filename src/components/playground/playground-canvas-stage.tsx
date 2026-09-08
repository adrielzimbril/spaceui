'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { IconLayout2 } from '@tabler/icons-react'
import { ToolbarButton } from './playground-toolbar-button'
import { ToolbarSection } from './playground-toolbar-section'
import { PlaygroundViewportSwitcher, type ViewportMode } from './playground-viewport-switcher'
import { PlaygroundToolbar } from './playground-toolbar'
import { InlineInstallBar } from '@/components/docs/installation/inline-install-bar'
import { PreviewContent } from '@/components/docs/preview/preview-content'
import { index } from '@/__registry__/index'
import { useLayoutMode, type ActivePreviewInfo } from '@/components/providers/layout-mode-provider'
import { Tweakpane, type Binds } from '@/components/docs/preview/tweakpane'
import { cn } from '@/registry/lib/utils'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { source, uiKitSource, resourcesSource } from '@/lib/source'
import { getEffectiveContained } from '@/config/preview-config'
import { useMediaQuery, useIsMobile } from '@/registry/hooks/browser/use-media-query'
import { useRegistryEntry } from '@/components/docs/preview/hooks/use-registry-entry'
import { REGISTRY_NAMESPACE } from '@/lib/install-command'

export interface PlaygroundCanvasStageProps {
  showInfo: boolean
  isImmersive?: boolean
  onToggleImmersive?: () => void
  activePreview: ActivePreviewInfo | null
  viewport: ViewportMode
  onViewportChange: (mode: ViewportMode) => void
  onToggleInfo: () => void
  onReplay: () => void
  reloadKey: number
}

const VIEWPORT_WIDTH_CLASSES: Record<ViewportMode, string> = {
  desktop: 'w-full max-w-full',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[375px] max-w-full',
}

function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    if ('value' in obj) {
      return obj.value
    }
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = unwrapValues(obj[key])
      }
    }
    return result
  }
  return obj
}

function flattenFirstLevel(obj: Record<string, Record<string, unknown>> | null): Record<string, unknown> {
  if (!obj) return {}
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      for (const nestedKey in obj[key]) {
        result[nestedKey] = obj[key][nestedKey]
      }
    } else {
      result[key] = obj[key]
    }
  }
  return result
}

export function PlaygroundCanvasStage({
  showInfo,
  isImmersive = false,
  onToggleImmersive,
  activePreview,
  viewport,
  onViewportChange,
  onToggleInfo,
  onReplay,
  reloadKey,
}: PlaygroundCanvasStageProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)', true)
  const isMobile = useIsMobile()
  const { setActivePreview } = useLayoutMode()
  const { entry } = useRegistryEntry(activePreview?.name ?? null)
  const [tweakMode, setTweakMode] = useState(false)
  const hasAutoOpenedRef = useRef(false)

  useEffect(() => {
    if (!hasAutoOpenedRef.current && !isMobile) {
      hasAutoOpenedRef.current = true
      setTweakMode(true)
    }
  }, [isMobile])

  const [tweakpaneKey, setTweakpaneKey] = useState(0)
  const [localBinds, setLocalBinds] = useState<Binds | null>(activePreview?.binds ?? null)
  const [localProps, setLocalProps] = useState<Record<string, any> | null>(activePreview?.componentProps ?? null)

  const effectiveContained = getEffectiveContained(
    activePreview?.contained,
    undefined,
    activePreview?.name,
    activePreview?.componentGroup,
  )
  const effectiveOpen = activePreview?.open ?? !effectiveContained

  const resolvedPreviewName = activePreview?.previewName || activePreview?.name

  useEffect(() => {
    setLocalBinds(activePreview?.binds ?? null)
    setLocalProps(activePreview?.componentProps ?? null)
  }, [activePreview?.name, activePreview?.binds, activePreview?.componentProps])

  const handleBindsChange = (newBinds: Binds) => {
    setLocalBinds(newBinds)
    const unwrapped = unwrapValues(newBinds)
    setLocalProps(unwrapped)
    if (activePreview) {
      const flattenedProps = flattenFirstLevel(unwrapped as Record<string, Record<string, unknown>> | null)
      const serializedProps = Object.keys(flattenedProps).length
        ? `?props=${encodeURIComponent(JSON.stringify(flattenedProps))}`
        : ''
      const baseName = activePreview.previewName?.split('?')[0] || activePreview.name

      setActivePreview({
        ...activePreview,
        binds: newBinds,
        componentProps: unwrapped,
        previewName: `${baseName}${serializedProps}`,
      })
    }
  }

  const ActiveComponent =
    activePreview?.component ?? (activePreview?.name ? index[activePreview.name]?.component : undefined)
  const themeOverride = activePreview?.themeOverride ?? 'system'

  const handleReplay = () => {
    onReplay()
    setTweakpaneKey((k) => k + 1)

    const defaultDemoProps =
      entry?.meta?.demoProps ??
      (ActiveComponent as any)?.demoProps ??
      (activePreview?.name ? (index[activePreview.name]?.component as any)?.demoProps : undefined)

    if (defaultDemoProps && Object.keys(defaultDemoProps).length > 0) {
      const freshBinds = JSON.parse(JSON.stringify(defaultDemoProps)) as Binds
      const freshProps = unwrapValues(freshBinds)

      setLocalBinds(freshBinds)
      setLocalProps(freshProps)

      if (activePreview) {
        const baseName = activePreview.previewName?.split('?')[0] || activePreview.name

        setActivePreview({
          ...activePreview,
          binds: freshBinds,
          componentProps: freshProps,
          previewName: baseName,
        })
      }
    } else if (activePreview?.binds) {
      setLocalBinds(activePreview.binds)
      setLocalProps(activePreview.componentProps ?? null)
    }
  }

  return (
    <div
      className={cn(
        'relative flex h-dvh w-full items-center justify-end overflow-hidden transition-all duration-300 ease-in-out',
        isImmersive ? 'bg-background p-0' : 'bg-muted p-2',
      )}
    >
      <motion.div
        initial={false}
        animate={{
          width: isDesktop && showInfo ? '60%' : '100%',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 26, mass: 0.82 }}
        className={cn(
          'relative h-full overflow-clip flex items-center justify-center transition-colors duration-200',
          isImmersive ? 'rounded-none' : 'rounded-2xl',
          themeOverride === 'dark'
            ? 'force-dark dark bg-background text-foreground'
            : themeOverride === 'light'
              ? 'force-light bg-background text-foreground'
              : 'bg-background text-foreground',
        )}
      >
        {/* Top Left Navigation, Search (hidden in immersive mode) */}
        {!isImmersive && (
          <ToolbarSection aria-label="Navigation and Drawer triggers" className="left-2 top-2 md:top-4">
            {/* Global Navigation Drawer Button */}
            <MobileNavDrawer
              trees={[source.pageTree, uiKitSource.pageTree, resourcesSource.pageTree]}
              triggerClassName="flex!"
              trigger={
                <ToolbarButton label="Open Mobile Navigation Menu">
                  <IconLayout2 className="size-4" />
                </ToolbarButton>
              }
            />
          </ToolbarSection>
        )}

        {/* Top Center Viewport Switcher (hidden in immersive mode) */}
        {!isImmersive && <PlaygroundViewportSwitcher viewport={viewport} onChange={onViewportChange} />}

        {/* Top Right Floating Actions Toolbar */}
        <PlaygroundToolbar
          showInfo={showInfo}
          onToggleInfo={onToggleInfo}
          isImmersive={isImmersive}
          onToggleImmersive={onToggleImmersive}
          onReplay={handleReplay}
          previewName={resolvedPreviewName}
          hasBinds={Boolean(localBinds || activePreview?.binds)}
          tweakpaneOpen={tweakMode}
          onToggleTweakpane={() => setTweakMode((prev) => !prev)}
          restart={activePreview?.restart || Boolean(localBinds || activePreview?.binds)}
          open={effectiveOpen}
          themeOverride={themeOverride}
          onThemeOverrideChange={(next) => {
            if (activePreview) {
              setActivePreview({
                ...activePreview,
                themeOverride: next,
              })
            }
          }}
        />

        {/* Active Canvas Stage */}
        <div key={reloadKey} className="relative size-full min-h-0 min-w-0">
          <div
            className={cn(
              'relative size-full min-h-0 min-w-0 transition-all duration-300',
              !isImmersive && VIEWPORT_WIDTH_CLASSES[viewport],
            )}
            data-loaded={activePreview ? 'true' : 'false'}
          >
            {activePreview && (
              <PreviewContent
                name={activePreview.name}
                previewName={activePreview.previewName}
                componentGroup={activePreview.componentGroup}
                Component={ActiveComponent}
                componentProps={localProps ?? activePreview.componentProps}
                useIframe={activePreview.useIframe}
                contained={activePreview.contained}
                bigScreen={activePreview.bigScreen}
                themeOverride={themeOverride}
                reloadKey={reloadKey}
              />
            )}
          </div>
        </div>

        {/* Global Floating Tweakpane (hidden in immersive mode) */}
        {!isImmersive && localBinds && (
          <Tweakpane
            key={`${activePreview?.name ?? ''}-${tweakpaneKey}`}
            binds={localBinds}
            onBindsChange={handleBindsChange}
            show={tweakMode}
            onClose={() => setTweakMode(false)}
          />
        )}

        {/* Bottom Center Inline Install Bar (hidden in immersive mode) */}
        {!isImmersive && !showInfo && (
          <div
            data-playground-ui
            className="pointer-events-auto fixed bottom-18 left-1/2 z-30 hidden -translate-x-1/2 lg:block"
          >
            <InlineInstallBar
              packageName={activePreview?.name ? `${REGISTRY_NAMESPACE}/${activePreview.name}` : undefined}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
