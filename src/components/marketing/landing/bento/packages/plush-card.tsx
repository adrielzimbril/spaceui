'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconRotateClockwise, IconArrowsShuffle, IconHandFinger } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { bloomSound, dropletSound, tapSound, tickSound } from '@/components/providers/sound-provider'
import { PlushEngine, loadPlushArtwork } from '@/tools/plush/engine'
import { DEFAULT_CONFIG, PLUSH_PRESETS } from '@/tools/plush/presets'
import type { PlushPreset } from '@/tools/plush/types'
import { BENTO_CYCLE_INTERVAL, USER_INTERACTION_DEBOUNCE } from '@/config/space-config'
import { cn } from '@/registry/lib/utils'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'
import { logger } from '@/registry/utils/logger'

const SHOWCASE_PLUSH_PRESETS = PLUSH_PRESETS.filter((p) =>
  ['spaceui', 'logo', 'squish', 'invader', 'squiggle', 'kendo', 'doddle'].includes(p.id),
)

interface PlushCardProps {
  isVisible?: boolean
  hasBeenVisible?: boolean
}

export function PlushCard({ isVisible = true, hasBeenVisible = true }: PlushCardProps) {
  const plushCanvasRef = React.useRef<HTMLDivElement>(null)
  const plushEngineRef = React.useRef<PlushEngine | null>(null)
  const [activePlushPreset, setActivePlushPreset] = React.useState<PlushPreset>(
    SHOWCASE_PLUSH_PRESETS[0] ?? PLUSH_PRESETS[0],
  )
  const [plushLoading, setPlushLoading] = React.useState(true)

  const lastPlushInteractionRef = React.useRef<number>(Date.now())
  const isPlushInteractingRef = React.useRef<boolean>(false)

  React.useEffect(() => {
    if (!hasBeenVisible || !plushCanvasRef.current) return

    let isMounted = true
    let engine: PlushEngine | null = null

    try {
      engine = new PlushEngine(plushCanvasRef.current, DEFAULT_CONFIG, {
        onPet: () => {
          lastPlushInteractionRef.current = Date.now()
          dropletSound()
        },
        onClick: () => {
          lastPlushInteractionRef.current = Date.now()
          bloomSound()
        },
        onDragEnd: () => {
          lastPlushInteractionRef.current = Date.now()
          isPlushInteractingRef.current = false
          tapSound()
        },
      })
      plushEngineRef.current = engine

      loadPlushArtwork(
        activePlushPreset.preview,
        activePlushPreset.id,
        activePlushPreset.label,
        activePlushPreset.sideColor,
      )
        .then((art) => {
          if (isMounted && engine) {
            engine.setArtwork(art)
            setPlushLoading(false)
          }
        })
        .catch((err) => {
          logger.error('Failed to load plush artwork:', err)
          if (isMounted) setPlushLoading(false)
        })
    } catch (err) {
      logger.error('Failed to init plush engine:', err)
      if (isMounted) setPlushLoading(false)
    }

    return () => {
      isMounted = false
      if (engine) {
        engine.dispose()
      }
      plushEngineRef.current = null
    }
  }, [
    hasBeenVisible,
    activePlushPreset.id,
    activePlushPreset.label,
    activePlushPreset.preview,
    activePlushPreset.sideColor,
  ])

  const applyPlushPreset = React.useCallback(
    async (nextPreset: (typeof SHOWCASE_PLUSH_PRESETS)[0], playSound = false) => {
      if (playSound) bloomSound()
      setActivePlushPreset(nextPreset)
      setPlushLoading(true)
      const startTime = Date.now()

      try {
        const art = await loadPlushArtwork(nextPreset.preview, nextPreset.id, nextPreset.label, nextPreset.sideColor)
        if (plushEngineRef.current) {
          plushEngineRef.current.setArtwork(art)
          if (nextPreset.sideColor) {
            plushEngineRef.current.updateConfig({
              ...DEFAULT_CONFIG,
              sideColor: nextPreset.sideColor,
            })
          }
        }
      } catch (err) {
        logger.error('Error switching plush preset:', err)
      } finally {
        const elapsed = Date.now() - startTime
        if (elapsed < 250) {
          await new Promise((resolve) => setTimeout(resolve, 250 - elapsed))
        }
        setPlushLoading(false)
      }
    },
    [],
  )

  const activePlushPresetRef = React.useRef(activePlushPreset)
  activePlushPresetRef.current = activePlushPreset
  const plushLoadingRef = React.useRef(plushLoading)
  plushLoadingRef.current = plushLoading

  const randomizePlushPreset = React.useCallback(() => {
    lastPlushInteractionRef.current = Date.now()
    const available = SHOWCASE_PLUSH_PRESETS.filter((p) => p.id !== activePlushPresetRef.current.id)
    const nextPreset = available[Math.floor(Math.random() * available.length)] ?? SHOWCASE_PLUSH_PRESETS[0]
    applyPlushPreset(nextPreset, true)
  }, [applyPlushPreset])

  useStaggeredInterval(
    () => {
      if (
        plushLoadingRef.current ||
        isPlushInteractingRef.current ||
        Date.now() - lastPlushInteractionRef.current < USER_INTERACTION_DEBOUNCE
      ) {
        return
      }
      const available = SHOWCASE_PLUSH_PRESETS.filter((p) => p.id !== activePlushPresetRef.current.id)
      const nextPreset = available[Math.floor(Math.random() * available.length)] ?? SHOWCASE_PLUSH_PRESETS[0]
      applyPlushPreset(nextPreset, false)
    },
    BENTO_CYCLE_INTERVAL,
    isVisible,
  )

  const resetPlushOrientation = () => {
    lastPlushInteractionRef.current = Date.now()
    tickSound()
    plushEngineRef.current?.resetOrientation()
    plushEngineRef.current?.resetZoom()
  }

  return (
    <Frame className="flex flex-col h-full sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 relative flex min-h-95 p-0 overflow-hidden items-center justify-center bg-muted/20 rounded-lg">
          <div
            ref={plushCanvasRef}
            onPointerDown={() => {
              isPlushInteractingRef.current = true
              lastPlushInteractionRef.current = Date.now()
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) {
                isPlushInteractingRef.current = true
                lastPlushInteractionRef.current = Date.now()
              }
            }}
            onPointerUp={() => {
              isPlushInteractingRef.current = false
              lastPlushInteractionRef.current = Date.now()
            }}
            onPointerCancel={() => {
              isPlushInteractingRef.current = false
              lastPlushInteractionRef.current = Date.now()
            }}
            className={cn(
              'absolute inset-0 size-full select-none cursor-grab active:cursor-grabbing transition-[filter,transform,opacity] duration-220 ease-[0.16,1,0.3,1] will-change-[opacity,transform,filter]',
              plushLoading
                ? 'filter blur-[3px] scale-[0.98] opacity-70 pointer-events-none'
                : 'filter blur-0 scale-100 opacity-100',
            )}
          />

          <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xs border-2 border-muted">
            <IconHandFinger className="size-3.5 text-foreground" />
            <span>Drag to groom fur · 3D WebGL</span>
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Plush 3D Fur</FrameTitle>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon-xs"
            onClick={randomizePlushPreset}
            data-space-hover
            title="Randomize plush preset"
            className="rounded-full cursor-pointer"
          >
            <IconArrowsShuffle className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={resetPlushOrientation}
            data-space-hover
            title="Reset orientation"
            className="rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <IconRotateClockwise className="size-3.5" />
          </Button>
          <Link
            href="/tools/plush"
            data-space-hover
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowUpRight className="size-4" />
          </Link>
        </div>
      </FrameFooter>
    </Frame>
  )
}
