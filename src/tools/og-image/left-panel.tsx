'use client'

import React from 'react'
import { IconUpload } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Slider } from '@/registry/primitives/slider'
import { Switch } from '@/registry/primitives/switch'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { openSound, pageSound, tapSound, tickSound, toggleSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import type { Layout, OgState, Preset } from './types'
import { LAYOUTS, PRESETS, SIZES } from './presets'

interface OgLeftPanelProps {
  s: OgState
  set: <K extends keyof OgState>(k: K, v: OgState[K]) => void
  onSelectPreset: (id: string) => void
  activePresetId: string
  onSelectSize?: (w: number, h: number) => void
  onImportJson?: () => void
}

export function OgLeftPanel({
  s,
  set,
  onSelectPreset,
  activePresetId,
  onSelectSize,
  onImportJson,
}: OgLeftPanelProps) {
  const handleSlider = <K extends keyof OgState>(key: K, val: number | readonly number[]) => {
    const num = Array.isArray(val) ? val[0] : val
    set(key, num as OgState[K])
    tickSound()
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      {/* Title Header matching Plush */}
      <div className="flex h-10 shrink-0 items-center px-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Presets & Layout</h2>
          <span className="text-[0.625rem] text-muted-foreground">Styles & Structure</span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          {/* Style Presets Grid (Visual Cards inspired by Plush) */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Style Presets</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => {
                const isSelected = activePresetId === p.id
                return (
                  <Button
                    key={p.id}
                    type="button"
                    variant="ghost"
                    data-space-hover="tick"
                    onClick={() => {
                      pageSound()
                      onSelectPreset(p.id)
                    }}
                    className={cn(
                      'group flex h-auto! flex-col items-center gap-1 rounded-xl p-1 cursor-pointer bg-muted hover:bg-muted transition-all',
                      isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
                    )}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg flex items-center justify-center">
                      <PresetMiniSwatch preset={p} />
                    </div>
                    <span
                      className={cn(
                        'w-full truncate px-0.5 text-center text-[0.625rem] font-medium transition-colors',
                        isSelected
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {p.name}
                    </span>
                  </Button>
                )
              })}

              {/* Custom Upload JSON Card */}
              {onImportJson && (
                <Button
                  type="button"
                  variant="ghost"
                  data-space-hover="tick"
                  onClick={() => {
                    openSound()
                    onImportJson()
                  }}
                  className="group flex h-auto! flex-col items-center gap-1 rounded-xl p-1 cursor-pointer bg-muted hover:bg-muted transition-all border border-dashed border-border/70 hover:border-foreground/30"
                  title="Import your custom JSON configuration"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-background/60 flex flex-col items-center justify-center gap-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                    <IconUpload className="size-3.5" />
                    <span className="text-[9px] font-mono tracking-wider uppercase">JSON</span>
                  </div>
                  <span className="w-full truncate px-0.5 text-center text-[0.625rem] font-medium text-muted-foreground group-hover:text-foreground">
                    Upload JSON
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Composition Layouts (12 Wireframe Skeleton Cards) */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Composition Layout</span>
            <div className="grid grid-cols-3 gap-1.5">
              {LAYOUTS.map((l) => {
                const isSelected = s.layout === l.id
                return (
                  <Button
                    key={l.id}
                    type="button"
                    variant="ghost"
                    data-space-hover="tick"
                    onClick={() => {
                      pageSound()
                      set('layout', l.id)
                    }}
                    title={l.description}
                    className={cn(
                      'group flex h-auto! flex-col items-center gap-1.5 rounded-xl p-1.5 cursor-pointer bg-muted hover:bg-muted transition-all',
                      isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
                    )}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-background/60 p-1 flex items-center justify-center">
                      <WireframeSkeleton layout={l.id} />
                    </div>
                    <span
                      className={cn(
                        'w-full truncate px-0.5 text-center text-[0.625rem] font-medium transition-colors',
                        isSelected
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {l.name}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Dimensions & Ratio */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Dimensions & Ratio</span>
            <Tabs
              value={SIZES.find((z) => s.width === z.w && s.height === z.h)?.id ?? 'og'}
              onValueChange={(val) => {
                const z = SIZES.find((sz) => sz.id === val)
                if (z) {
                  tapSound()
                  if (onSelectSize) {
                    onSelectSize(z.w, z.h)
                  } else {
                    set('width', z.w)
                    set('height', z.h)
                  }
                }
              }}
            >
              <TabsList size="sm" className="grid w-full grid-cols-3">
                {SIZES.map((z) => (
                  <TabsTab key={z.id} value={z.id}>
                    {z.name.split(' ')[0]}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Alignment as Tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Text Alignment</span>
            <Tabs
              value={s.align}
              onValueChange={(val) => {
                tapSound()
                if (val) set('align', val as OgState['align'])
              }}
            >
              <TabsList size="sm" className="grid w-full grid-cols-3">
                <TabsTab value="left">Left</TabsTab>
                <TabsTab value="center">Center</TabsTab>
                <TabsTab value="right">Right</TabsTab>
              </TabsList>
            </Tabs>
          </div>

          {/* Framing Geometry Sliders */}
          <div className="flex flex-col gap-3 pt-1">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Framing & Geometry</span>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Corner Radius</span>
                <span className="text-muted-foreground">{s.radius}px</span>
              </div>
              <Slider min={0} max={64} step={1} value={[s.radius]} onValueChange={(v) => handleSlider('radius', v)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Inner Padding</span>
                <span className="text-muted-foreground">{s.padding}px</span>
              </div>
              <Slider
                min={24}
                max={140}
                step={2}
                value={[s.padding]}
                onValueChange={(v) => handleSlider('padding', v)}
              />
            </div>
          </div>

          {/* Elements Visibility */}
          <div className="flex flex-col gap-2 pt-1 pb-4">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Elements Visibility</span>
            <div className="flex flex-col gap-1.5">
              {[
                { key: 'showLogo', label: 'Logo & Avatar', desc: 'Space UI or custom icon' },
                { key: 'showBrand', label: 'Brand Name', desc: 'Top header label' },
                { key: 'showBadge', label: 'Pill / Chip Badge', desc: 'Accent tag label' },
                { key: 'showSubtitle', label: 'Subtitle Text', desc: 'Supporting description' },
                { key: 'showTags', label: 'Tech Stack & Tags', desc: 'Footer bullet points' },
                { key: 'showFooter', label: 'Footer URL', desc: 'Domain link anchor' },
              ].map(({ key, label, desc }) => {
                const isChecked = Boolean(s[key as keyof OgState])
                return (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-muted p-2.5">
                    <div>
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-[0.625rem] text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        toggleSound(checked ? 'on' : 'off')
                        set(key as keyof OgState, checked as never)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

/** Visual Swatch for Preset */
function PresetMiniSwatch({ preset }: { preset: Preset }) {
  const patch = preset.patch
  const from = patch.bgFrom ?? '#2770EA'
  const via = patch.bgVia ?? '#06C4F8'
  const to = patch.bgTo ?? '#0CBFF9'
  const base = patch.bgBase ?? '#090909'
  const mode = patch.bgMode ?? 'orbs'

  return (
    <div
      className="size-full rounded-md relative overflow-hidden transition-transform group-hover:scale-105"
      style={{
        background:
          mode === 'gradient'
            ? `linear-gradient(135deg, ${from}, ${via}, ${to})`
            : base,
      }}
    >
      {mode === 'orbs' && (
        <>
          <div
            className="absolute -left-2 -top-2 size-5 rounded-full blur-xs opacity-80"
            style={{ background: from }}
          />
          <div
            className="absolute -right-2 -bottom-2 size-5 rounded-full blur-xs opacity-70"
            style={{ background: to }}
          />
        </>
      )}
      <div className="absolute inset-x-1.5 bottom-1.5 flex flex-col gap-0.5">
        <div
          className="h-1 w-6 rounded-xs opacity-90"
          style={{ background: patch.titleColor ?? 'rgb(255, 255, 255)' }}
        />
        <div
          className="h-0.5 w-4 rounded-xs opacity-60"
          style={{ background: patch.subtitleColor ?? 'rgba(255, 255, 255, 0.7)' }}
        />
      </div>
    </div>
  )
}

/** Visual Skeleton for Layouts */
function WireframeSkeleton({ layout }: { layout: Layout }) {
  switch (layout) {
    case 'centered':
      return (
        <div className="flex flex-col items-center justify-center size-full gap-1 text-center">
          <div className="w-4 h-1 bg-muted-foreground/20 rounded-xs" />
          <div className="w-10 h-1.5 bg-muted-foreground/45 rounded-xs" />
          <div className="w-6 h-1 bg-muted-foreground/25 rounded-xs" />
        </div>
      )
    case 'split':
      return (
        <div className="grid grid-cols-2 gap-1 size-full items-center">
          <div className="flex flex-col gap-1">
            <div className="w-7 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-5 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
          <div className="size-full rounded bg-muted-foreground/8 flex items-center justify-center">
            <div className="size-3 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
      )
    case 'bottom':
      return (
        <div className="flex flex-col justify-between size-full py-0.5">
          <div className="w-4 h-1 bg-muted-foreground/25 rounded-xs" />
          <div className="space-y-0.5">
            <div className="w-9 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-5 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
        </div>
      )
    case 'panel':
      return (
        <div className="size-full p-0.5 flex items-center justify-center">
          <div className="size-full rounded bg-muted-foreground/8 p-1 flex flex-col justify-center gap-0.5">
            <div className="w-7 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-4 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
        </div>
      )
    case 'banner':
      return (
        <div className="flex flex-col justify-center size-full">
          <div className="w-full h-3 rounded bg-muted-foreground/10 flex items-center px-1 justify-between">
            <div className="w-5 h-1 bg-muted-foreground/45 rounded-xs" />
            <div className="w-3 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
        </div>
      )
    case 'poster':
      return (
        <div className="flex flex-col justify-between size-full py-0.5">
          <div className="flex gap-1">
            <div className="w-3 h-1 bg-muted-foreground/25 rounded-xs" />
            <div className="w-2 h-1 bg-muted-foreground/20 rounded-xs" />
          </div>
          <div className="w-10 h-2 bg-muted-foreground/45 rounded-xs" />
          <div className="w-6 h-1 bg-muted-foreground/25 rounded-xs" />
        </div>
      )
    case 'sidebar':
      return (
        <div className="flex gap-1 size-full items-center">
          <div className="w-3 h-full rounded-xs bg-muted-foreground/10 flex flex-col justify-between py-1 items-center">
            <div className="size-1.5 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="w-7 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-4 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
        </div>
      )
    case 'quote':
      return (
        <div className="flex flex-col justify-center size-full gap-0.5">
          <span className="font-serif text-[8px] leading-none text-muted-foreground/50">“</span>
          <div className="w-9 h-1.5 bg-muted-foreground/45 rounded-xs" />
          <div className="w-5 h-1 bg-muted-foreground/25 rounded-xs" />
        </div>
      )
    case 'ticket':
      return (
        <div className="flex size-full items-center">
          <div className="flex-1 pr-1">
            <div className="w-7 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-4 h-1 bg-muted-foreground/25 rounded-xs mt-0.5" />
          </div>
          <div className="h-full border-r border-dashed border-muted-foreground/20 mx-0.5" />
          <div className="w-3 flex flex-col items-center justify-center gap-0.5 pl-0.5">
            <div className="size-1 rounded-full bg-muted-foreground/25" />
          </div>
        </div>
      )
    case 'corners':
      return (
        <div className="relative size-full flex items-center justify-center">
          <div className="absolute top-0 left-0 size-1 bg-muted-foreground/25 rounded-full" />
          <div className="absolute top-0 right-0 size-1 bg-muted-foreground/25 rounded-full" />
          <div className="absolute bottom-0 left-0 size-1 bg-muted-foreground/25 rounded-full" />
          <div className="absolute bottom-0 right-0 size-1 bg-muted-foreground/25 rounded-full" />
          <div className="w-7 h-1.5 bg-muted-foreground/45 rounded-xs" />
        </div>
      )
    case 'stack':
      return (
        <div className="flex flex-col justify-center gap-1 size-full">
          <div className="w-3 h-1 bg-muted-foreground/25 rounded-xs" />
          <div className="w-9 h-1.5 bg-muted-foreground/45 rounded-xs" />
          <div className="w-6 h-1 bg-muted-foreground/25 rounded-xs" />
        </div>
      )
    case 'editorial':
    default:
      return (
        <div className="flex flex-col justify-between size-full py-0.5">
          <div className="flex justify-between items-center">
            <div className="w-3 h-1 bg-muted-foreground/25 rounded-xs" />
            <div className="w-2 h-1 bg-muted-foreground/15 rounded-xs" />
          </div>
          <div className="space-y-0.5 my-auto">
            <div className="w-9 h-1.5 bg-muted-foreground/45 rounded-xs" />
            <div className="w-6 h-1 bg-muted-foreground/25 rounded-xs" />
          </div>
          <div className="flex justify-between items-center">
            <div className="w-4 h-1 bg-muted-foreground/15 rounded-xs" />
            <div className="w-5 h-1 bg-muted-foreground/20 rounded-xs" />
          </div>
        </div>
      )
  }
}

/** Ratio silhouette */
function RatioShape({ ratio, isSelected }: { ratio: string; isSelected: boolean }) {
  const boxCls = cn(
    'rounded transition-colors',
    isSelected ? 'bg-muted-foreground/70' : 'bg-muted-foreground/25',
  )

  switch (ratio) {
    case 'square':
      return <div className={cn(boxCls, 'size-4')} />
    case 'wide':
      return <div className={cn(boxCls, 'w-5 h-3')} />
    case 'og':
    default:
      return <div className={cn(boxCls, 'w-5 h-2.5')} />
  }
}

