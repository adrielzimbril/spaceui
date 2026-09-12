'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, RotateCcw, Sparkles, Hand, Sliders } from 'lucide-react'
import { Frame, FrameHeader, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { bloomSound, dropletSound, tapSound, tickSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { PlushEngine, loadPlushArtwork } from '@/tools/plush/engine'
import { DEFAULT_CONFIG, PLUSH_PRESETS } from '@/tools/plush/presets'
import type { PlushConfig, PlushPreset } from '@/tools/plush/types'

const SHOWCASE_PRESETS = PLUSH_PRESETS.filter((p) =>
  ['spaceui', 'logo', 'squish', 'invader', 'squiggle'].includes(p.id),
)

const INITIAL_PRESET = SHOWCASE_PRESETS[0] ?? PLUSH_PRESETS[0]

export function PlushShowcase() {
  const canvasContainerRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<PlushEngine | null>(null)

  const [activePreset, setActivePreset] = React.useState<PlushPreset>(INITIAL_PRESET)
  const [config, setConfig] = React.useState<PlushConfig>(DEFAULT_CONFIG)
  const [furStyle, setFurStyle] = React.useState<'velvet' | 'fluffy' | 'sherpa'>('fluffy')
  const [loading, setLoading] = React.useState(true)

  // Initialize Plush Engine
  React.useEffect(() => {
    if (!canvasContainerRef.current) return

    let isMounted = true
    let engine: PlushEngine | null = null

    try {
      engine = new PlushEngine(canvasContainerRef.current, DEFAULT_CONFIG, {
        onPet: () => dropletSound(),
        onClick: () => bloomSound(),
        onDragEnd: () => tapSound(),
      })
      engineRef.current = engine

      loadPlushArtwork(INITIAL_PRESET.preview, INITIAL_PRESET.id, INITIAL_PRESET.label, INITIAL_PRESET.sideColor)
        .then((art) => {
          if (isMounted && engine) {
            engine.setArtwork(art)
            setLoading(false)
          }
        })
        .catch((err) => {
          console.error('Failed to load initial plush artwork:', err)
          if (isMounted) setLoading(false)
        })
    } catch (err) {
      console.error('Failed to initialize PlushEngine:', err)
      if (isMounted) setLoading(false)
    }

    return () => {
      isMounted = false
      if (engine) {
        engine.dispose()
      }
      engineRef.current = null
    }
  }, [])

  // Switch preset
  const handleSelectPreset = async (preset: PlushPreset) => {
    tickSound()
    setActivePreset(preset)
    setLoading(true)

    try {
      const art = await loadPlushArtwork(preset.preview, preset.id, preset.label, preset.sideColor)
      if (engineRef.current) {
        engineRef.current.setArtwork(art)
        if (preset.sideColor) {
          engineRef.current.updateConfig({
            ...config,
            sideColor: preset.sideColor,
          })
        }
      }
    } catch (err) {
      console.error('Failed to switch plush preset:', err)
    } finally {
      setLoading(false)
    }
  }

  // Change fur style
  const handleSelectFurStyle = (style: 'velvet' | 'fluffy' | 'sherpa') => {
    tickSound()
    setFurStyle(style)

    let furSize = 1.62
    let furThickness = 1.5

    if (style === 'velvet') {
      furSize = 1.05
      furThickness = 1.2
    } else if (style === 'sherpa') {
      furSize = 2.2
      furThickness = 1.85
    }

    const updated = { ...config, furSize, furThickness }
    setConfig(updated)
    engineRef.current?.updateConfig(updated)
  }

  // Reset orientation
  const handleResetOrientation = () => {
    tickSound()
    engineRef.current?.resetOrientation()
    engineRef.current?.resetZoom()
  }

  return (
    <section id="plush" data-page-section className="mx-auto max-w-[1280px] scroll-mt-16 px-5 sm:px-6 py-20">
      {/* ── Section Header ── */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-foreground" />
            <span>Tactile WebGL 3D</span>
          </div>
          <h2 className="mt-3 text-[34px] font-semibold tracking-tight leading-[1.08] text-foreground sm:text-[46px] md:text-[54px]">
            Plush.
            <br />
            <span className="text-muted-foreground">Procedural 3D Fur in the browser.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Transform any vector badge or illustration into an interactive 3D cushion with 140,000+ procedural fur
            strands, realistic grooming physics, and tactile Web Audio feedback.
          </p>
        </div>

        <Link
          href="/tools/plush"
          data-space-hover
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span>Open Plush Studio</span>
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {/* ── Interactive Demo Stage ── */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: 3D Interactive Canvas Stage */}
        <Frame className="flex flex-col h-full">
          <FrameHeader className="flex flex-row items-center justify-between p-2">
            <FrameTitle>Interactive Fur Canvas</FrameTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleResetOrientation}
                title="Reset orientation"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Link href="/tools/plush" data-space-hover className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </FrameHeader>
          <Card className="flex-1 flex flex-col h-full">
            <CardPanel className="flex-1 relative flex min-h-[440px] p-0 overflow-hidden items-center justify-center bg-muted/20">
              {/* WebGL Canvas with smooth blur transition while loading */}
              <div
                ref={canvasContainerRef}
                className={cn(
                  'absolute inset-0 size-full select-none cursor-grab active:cursor-grabbing transition-all duration-300 ease-out',
                  loading
                    ? 'filter blur-md scale-[0.98] opacity-50 pointer-events-none'
                    : 'filter blur-0 scale-100 opacity-100',
                )}
              />

              {/* Floating Helper Pill */}
              <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xs border-2 border-muted">
                <Hand className="size-3.5 text-foreground" />
                <span>Drag to groom fur · Scroll to zoom</span>
              </div>
            </CardPanel>
          </Card>
        </Frame>

        {/* Right: Presets & Texture Customizer */}
        <div className="flex flex-col gap-6">
          {/* Presets Card */}
          <Frame>
            <FrameHeader className="p-2">
              <FrameTitle>Select Artwork Preset</FrameTitle>
            </FrameHeader>
            <Card>
              <CardPanel className="flex flex-col gap-2 p-3">
                {SHOWCASE_PRESETS.map((preset) => {
                  const isSelected = activePreset.id === preset.id
                  return (
                    <Button
                      key={preset.id}
                      variant={isSelected ? 'secondary' : 'ghost'}
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        'flex h-auto! w-full items-center justify-between rounded-xl p-2.5 text-left transition-all duration-200 cursor-pointer',
                        isSelected ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 overflow-hidden rounded-lg border-2 border-muted bg-background p-1 flex items-center justify-center">
                          <Image
                            src={preset.preview}
                            alt={preset.label}
                            width={32}
                            height={32}
                            unoptimized
                            className="size-full object-contain pointer-events-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{preset.label}</span>
                          <span className="text-[11px] text-muted-foreground">{preset.description}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                          Active
                        </span>
                      )}
                    </Button>
                  )
                })}
              </CardPanel>
            </Card>
          </Frame>

          {/* Fur Dynamics Style Card */}
          <Frame>
            <FrameHeader className="p-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="size-3.5 text-muted-foreground" />
                <FrameTitle>Fur Dynamics</FrameTitle>
              </div>
            </FrameHeader>
            <Card>
              <CardPanel className="flex flex-col gap-3 p-4">
                <span className="text-xs text-muted-foreground">
                  Adjust procedural fur strand density and physics spring response:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'velvet', label: 'Velvet', desc: 'Short & dense' },
                    { id: 'fluffy', label: 'Fluffy', desc: 'Balanced softness' },
                    { id: 'sherpa', label: 'Sherpa', desc: 'Deep curls' },
                  ].map((style) => {
                    const isSelected = furStyle === style.id
                    return (
                      <Button
                        key={style.id}
                        variant={isSelected ? 'default' : 'secondary'}
                        onClick={() => handleSelectFurStyle(style.id as 'velvet' | 'fluffy' | 'sherpa')}
                        className={cn(
                          'flex h-auto! flex-col items-center rounded-xl p-2.5 text-center transition-all duration-200 cursor-pointer',
                          isSelected
                            ? 'bg-foreground text-background font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span className="text-xs font-semibold">{style.label}</span>
                        <span
                          className={cn(
                            'mt-0.5 text-[10px]',
                            isSelected ? 'text-background/80' : 'text-muted-foreground',
                          )}
                        >
                          {style.desc}
                        </span>
                      </Button>
                    )
                  })}
                </div>

                <div className="mt-2 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">Full Studio Capabilities</span>
                    <span className="text-[11px] text-muted-foreground">
                      Upload custom SVG, APNG export &amp; color detection
                    </span>
                  </div>
                  <Link
                    href="/tools/plush"
                    data-space-hover
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <span>Open Tool</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </CardPanel>
            </Card>
          </Frame>
        </div>
      </div>
    </section>
  )
}
