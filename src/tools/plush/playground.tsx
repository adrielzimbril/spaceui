'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  IconSparkles,
  IconUpload,
  IconHandFinger,
  IconCamera,
  IconFocus2,
} from '@tabler/icons-react'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import {
  confirmSound,
  dropletSound,
  nudgeSound,
  sparkleSound,
  tickSound,
  toggleSound,
  chimeSound,
  bloomSound,
  whisperSound,
} from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { PlushControlPanel } from './control-panel'
import { PlushEngine, loadPlushArtwork } from './engine'
import { DEFAULT_CONFIG, DEFAULT_PRESET, PLUSH_PRESETS } from './presets'
import type { PlushConfig, PlushPreset, ArtworkData } from './types'

export function PlushPlayground() {
  const [config, setConfig] = useState<PlushConfig>(DEFAULT_CONFIG)
  const [activePreset, setActivePreset] = useState<PlushPreset | null>(DEFAULT_PRESET)
  const [activeArtwork, setActiveArtwork] = useState<ArtworkData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const { isDesktop, showRight, setShowRight } = useResourceSidebars()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<PlushEngine | null>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    const preventWindowDrop = (e: DragEvent) => {
      e.preventDefault()
    }
    window.addEventListener('dragover', preventWindowDrop)
    window.addEventListener('drop', preventWindowDrop)
    return () => {
      window.removeEventListener('dragover', preventWindowDrop)
      window.removeEventListener('drop', preventWindowDrop)
    }
  }, [])

  useEffect(() => {
    if (!canvasContainerRef.current) return

    const engine = new PlushEngine(canvasContainerRef.current, config, {
      onPet: () => dropletSound(),
      onClick: () => bloomSound(),
      onDragEnd: () => whisperSound(),
    })
    engineRef.current = engine

    loadPlushArtwork(DEFAULT_PRESET.preview, DEFAULT_PRESET.id, DEFAULT_PRESET.label, DEFAULT_PRESET.sideColor)
      .then((art) => {
        engine.setArtwork(art)
        setActiveArtwork(art)
        if (config.autoColor && art.edgeColor) {
          handleConfigChange({ sideColor: art.edgeColor })
        }
      })
      .catch((err) => {
        console.error('Failed to load initial artwork:', err)
      })

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const handleConfigChange = useCallback((patch: Partial<PlushConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      engineRef.current?.updateConfig(next)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setActivePreset(DEFAULT_PRESET)
    setConfig(DEFAULT_CONFIG)
    loadPlushArtwork(DEFAULT_PRESET.preview, DEFAULT_PRESET.id, DEFAULT_PRESET.label, DEFAULT_PRESET.sideColor)
      .then((art) => {
        engineRef.current?.setArtwork(art)
        setActiveArtwork(art)
      })
      .catch((err) => {
        console.error('Error resetting artwork:', err)
      })
    engineRef.current?.updateConfig(DEFAULT_CONFIG)
    engineRef.current?.resetOrientation()
    engineRef.current?.resetTouch()
    engineRef.current?.resetZoom()
    dropletSound()
  }, [])

  const handleSelectPreset = useCallback(
    (preset: PlushPreset) => {
      setActivePreset(preset)
      setIsUploading(true)
      loadPlushArtwork(preset.preview, preset.id, preset.label, preset.sideColor)
        .then((art) => {
          engineRef.current?.setArtwork(art)
          setActiveArtwork(art)
          const shouldAutoColor = preset.defaultAutoColor ?? (preset.id !== 'squish')
          const patch: Partial<PlushConfig> = { autoColor: shouldAutoColor }
          if (shouldAutoColor) {
            if (art.hasAlpha) {
              const vibrant = art.palette?.find(
                (c) =>
                  c.toLowerCase() !== '#ffffff' &&
                  c.toLowerCase() !== '#121214' &&
                  c.toLowerCase() !== '#000000',
              )
              patch.sideColor = vibrant || preset.sideColor || art.palette?.[0] || art.edgeColor || '#ffffff'
            } else if (art.edgeColor) {
              patch.sideColor = art.edgeColor
            } else {
              patch.sideColor = preset.sideColor
            }
          } else {
            patch.sideColor = preset.sideColor || '#ffffff'
          }
          if (preset.defaultRoundness !== undefined) patch.roundness = preset.defaultRoundness
          if (preset.defaultCornerRadius !== undefined) patch.cornerRadius = preset.defaultCornerRadius
          if (preset.defaultPuffiness !== undefined) patch.puffiness = preset.defaultPuffiness
          handleConfigChange(patch)
          confirmSound()
        })
        .catch((err) => {
          console.error('Error loading preset:', err)
        })
        .finally(() => {
          setIsUploading(false)
        })
    },
    [handleConfigChange],
  )

  const handleUploadFile = useCallback(
    (file: File) => {
      setIsUploading(true)
      setActivePreset(null)
      const url = URL.createObjectURL(file)

      loadPlushArtwork(url, 'custom', file.name, '#ffffff')
        .then((art) => {
          engineRef.current?.setArtwork(art)
          setActiveArtwork(art)
          const patch: Partial<PlushConfig> = { autoColor: true }
          if (art.hasAlpha) {
            const vibrant = art.palette?.find(
              (c) =>
                c.toLowerCase() !== '#ffffff' &&
                c.toLowerCase() !== '#121214' &&
                c.toLowerCase() !== '#000000',
            )
            patch.sideColor = vibrant || art.palette?.[0] || art.edgeColor || '#ffffff'
          } else if (art.edgeColor) {
            patch.sideColor = art.edgeColor
          }
          handleConfigChange(patch)
          sparkleSound()
        })
        .catch((err) => {
          console.error('Error loading custom file:', err)
        })
        .finally(() => {
          setIsUploading(false)
        })
    },
    [handleConfigChange, config.autoColor],
  )

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDraggingOver(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || /\.(png|apng|jpg|jpeg|webp|svg|gif)$/i.test(file.name))) {
      handleUploadFile(file)
    }
  }

  const handleSnapshot = useCallback((frontView = true) => {
    if (!engineRef.current) return
    const dataUrl = engineRef.current.takeSnapshot({ frontView })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `plush-${activePreset?.id ?? 'custom'}-${frontView ? 'front' : '3d'}-${Date.now()}.png`
    a.click()
    sparkleSound()
  }, [activePreset])

  const handleCenterView = useCallback(() => {
    engineRef.current?.resetOrientation()
    engineRef.current?.resetZoom()
    dropletSound()
  }, [])

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    sidebar: true,
    reset: true,
    onReset: handleReset,
    onToggleExpand: setExpanded,
    onToggleSidebar: setShowRight,
    sidebarVisible: showRight,
    expanded,
  }

  return (
    <>
      <ResourceStudio
        showRight={showRight && !expanded}
        rightWidth="20rem"
        onToggleRight={() => {
          setShowRight(!showRight)
          toggleSound(!showRight ? 'on' : 'off')
        }}
        className={expanded ? 'p-0' : undefined}
        right={
          <PlushControlPanel
            config={config}
            onChange={handleConfigChange}
            activePresetId={activePreset?.id ?? null}
            onSelectPreset={handleSelectPreset}
            onUploadFile={handleUploadFile}
            activeArtwork={activeArtwork}
            isUploading={isUploading}
            onExport={handleSnapshot}
          />
        }
        canvas={
          <div
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="relative size-full flex items-center justify-center bg-background select-none overflow-hidden"
          >
            <div ref={canvasContainerRef} className="size-full" />

            {isDraggingOver && (
              <div className="absolute inset-4 z-40 rounded-2xl border-2 border-dashed border-border bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none animate-in fade-in duration-150">
                <IconUpload className="size-8 text-muted-foreground animate-bounce" />
                <p className="text-sm font-semibold">Drop your image here</p>
                <p className="text-xs text-muted-foreground">PNG, WebP, SVG, JPG, APNG or GIF</p>
              </div>
            )}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
              <Badge variant="secondary">
                <IconHandFinger className="size-3.5 animate-pulse" />
                Pet & groom fur • Drag to rotate • Click to squish
              </Badge>

              {activeArtwork?.apngPlayer && (
                <Badge variant="outline">
                  {activeArtwork.animationType === 'svg' ? 'Animated SVG' : 'Animated APNG'}
                </Badge>
              )}
            </div>
          </div>
        }
        float={
          <ResourceToolbar
            config={toolbarConfig}
            left={<ResourceNav />}
            right={
              <ToolbarButton label="Center view orientation" onClick={handleCenterView}>
                <IconFocus2 className="size-4" />
              </ToolbarButton>
            }
          />
        }
      />
    </>
  )
}
