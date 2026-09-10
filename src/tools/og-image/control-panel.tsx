'use client'

import React, { useRef, useState } from 'react'
import {
  IconArrowsShuffle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconLayersLinked,
  IconMovie,
  IconPalette,
  IconPhoto,
  IconTypography,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Slider } from '@/registry/primitives/slider'
import { Switch } from '@/registry/primitives/switch'
import { Input } from '@/registry/primitives/input'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { PRESET_PALETTES } from '@usespaceui/gradients'
import { useFileUpload } from '@/registry/hooks/form/use-file-upload'
import {
  bloomSound,
  confirmSound,
  openSound,
  pageSound,
  tapSound,
  tickSound,
  toggleSound,
} from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import type { AnimType, BgMode, Chip, ChipKey, OgState, ShowcaseLayout, ShowcaseShape, ShowcaseType } from './types'
import { ANIMS, CHIP_KEYS, PRESETS } from './presets'
import { colorToHex, hexToRgbString } from './color'
import { TECH_KEYS, TECH_LABELS } from './showcase-gallery'

interface OgControlPanelProps {
  s: OgState
  set: <K extends keyof OgState>(k: K, v: OgState[K]) => void
  setChip: (id: ChipKey, patch: Partial<Chip>) => void
  activePresetId: string
  onRandomizeColors: () => void
  onOpenExport: () => void
}

export function OgControlPanel({
  s,
  set,
  setChip,
  activePresetId,
  onRandomizeColors,
  onOpenExport,
}: OgControlPanelProps) {
  const [activeTab, setActiveTab] = useState('look')
  const [activeChipKey, setActiveChipKey] = useState<ChipKey>('badge')
  const [paletteIdx, setPaletteIdx] = useState<string>('')

  const handleBgFile = (file?: File | null) => {
    if (!file) return
    pageSound()
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        set('bgMode', 'image')
        set('bgImage', reader.result)
        bloomSound()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLogoFile = (file?: File | null) => {
    if (!file) return
    pageSound()
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        set('logoUrl', reader.result)
        set('showLogo', true)
        bloomSound()
      }
    }
    reader.readAsDataURL(file)
  }

  // Registry useFileUpload hook for background image upload & drag-drop
  const {
    openFileDialog: openBgDialog,
    getInputProps: getBgInputProps,
    getRootProps: getBgRootProps,
    isDragging: isBgDragging,
  } = useFileUpload({
    accept: 'image',
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        handleBgFile(item.file)
      }
    },
  })

  // Registry useFileUpload hook for logo upload
  const { openFileDialog: openLogoDialog, getInputProps: getLogoInputProps } = useFileUpload({
    accept: 'image',
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        handleLogoFile(item.file)
      }
    },
  })

  const handleSlider = <K extends keyof OgState>(key: K, val: number | readonly number[]) => {
    const num = Array.isArray(val) ? val[0] : val
    set(key, num as OgState[K])
    tickSound()
  }

  const currentPreset = PRESETS.find((p) => p.id === activePresetId) ?? PRESETS[0]

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      {/* Title Header matching Plush */}
      <div className="flex h-10 shrink-0 items-center px-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Appearance & Content</h2>
          {/* <span className="text-[0.625rem] text-muted-foreground">Appearance & Content</span> */}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="shrink-0 border-b border-border/40 px-3 pb-2 pt-1.5">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            tickSound()
            setActiveTab(v)
          }}
          className="w-full"
        >
          <TabsList size="sm" className="grid w-full grid-cols-4">
            <TabsTab value="look" className="gap-1 px-1 text-xs">
              <IconPalette className="size-3.5 shrink-0" />
              <span>Look</span>
            </TabsTab>
            <TabsTab value="showcase" className="gap-1 px-1 text-xs">
              <IconLayersLinked className="size-3.5 shrink-0" />
              <span>Showcase</span>
            </TabsTab>
            <TabsTab value="content" className="gap-1 px-1 text-xs">
              <IconTypography className="size-3.5 shrink-0" />
              <span>Content</span>
            </TabsTab>
            <TabsTab value="motion" className="gap-1 px-1 text-xs">
              <IconMovie className="size-3.5 shrink-0" />
              <span>Motion</span>
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          {/* Active Card Summary (Matching Plush / Flags / ImageSplit) */}
          <div
            onClick={() => {
              pageSound()
              onOpenExport()
            }}
            className="group relative flex items-center gap-3 rounded-xl bg-muted p-2.5 cursor-pointer transition-all hover:bg-muted/80"
            title="Click to export or view metadata"
          >
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-background flex items-center justify-center">
              <div
                className="size-full rounded-md transition-transform group-hover:scale-105"
                style={{
                  background:
                    s.bgMode === 'gradient'
                      ? `linear-gradient(${s.angle}deg, ${s.bgFrom}, ${s.bgVia}, ${s.bgTo})`
                      : s.bgMode === 'blur'
                        ? s.bgVia
                        : s.bgBase,
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{s.title || 'Social Card'}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                {s.width}×{s.height} px · {currentPreset?.name ?? 'Custom'} · {s.layout}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onOpenExport()
              }}
              aria-label="Export card"
              data-space-hover="tick"
              className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconDownload className="size-3.5" />
            </Button>
          </div>

          {/* ==================== TAB 1: LOOK & SHADER ==================== */}
          {activeTab === 'look' && (
            <>
              {/* Background Mode Cards */}
              <div className="flex flex-col gap-2">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Background Engine</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['orbs', 'gradient', 'blur', 'solid', 'image'] as BgMode[]).map((m) => {
                    const isSelected = s.bgMode === m
                    return (
                      <Button
                        key={m}
                        type="button"
                        variant="ghost"
                        data-space-hover="tick"
                        onClick={() => {
                          tapSound()
                          set('bgMode', m)
                        }}
                        className={cn(
                          'group flex h-auto! flex-col items-center gap-1 rounded-xl p-1.5 cursor-pointer bg-muted hover:bg-muted transition-all',
                          isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
                        )}
                      >
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-background p-1 flex items-center justify-center">
                          <EnginePreview mode={m} s={s} />
                        </div>
                        <span
                          className={cn(
                            'w-full truncate px-0.5 text-center text-[0.625rem] font-medium capitalize',
                            isSelected
                              ? 'text-foreground font-semibold'
                              : 'text-muted-foreground group-hover:text-foreground',
                          )}
                        >
                          {m}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Background Image Upload Section */}
              {s.bgMode === 'image' && (
                <div className="flex flex-col gap-2.5 rounded-xl bg-muted p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6875rem] font-semibold text-muted-foreground">Background Image</span>
                    {s.bgImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          tapSound()
                          set('bgImage', '')
                        }}
                        className="h-6 gap-1 text-[0.625rem] text-muted-foreground hover:text-destructive"
                      >
                        <IconX className="size-3" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {s.bgImage ? (
                    <div className="flex items-center gap-2.5 rounded-lg bg-background p-2">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.bgImage} alt="Background" className="size-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">Custom Image</p>
                        <p className="text-[0.625rem] text-muted-foreground">Active background source</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          openSound()
                          openBgDialog()
                        }}
                        className="h-7 text-xs"
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <div
                      {...getBgRootProps({
                        onClick: () => {
                          openSound()
                          openBgDialog()
                        },
                        className: cn(
                          'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border/80 bg-background/50 p-4 text-center cursor-pointer transition-colors hover:bg-background hover:border-primary/50',
                          isBgDragging && 'border-primary bg-primary/5',
                        ),
                      })}
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <IconUpload className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Click to upload image</p>
                        <p className="text-[0.625rem] text-muted-foreground">or drag & drop PNG, JPG, WebP, SVG</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Image Dim / Tint</span>
                      <span className="text-muted-foreground">{s.bgImageDim}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[s.bgImageDim]}
                      onValueChange={(v) => handleSlider('bgImageDim', v)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Image Scale</span>
                      <span className="text-muted-foreground">{s.bgScale}%</span>
                    </div>
                    <Slider
                      min={80}
                      max={160}
                      step={1}
                      value={[s.bgScale]}
                      onValueChange={(v) => handleSlider('bgScale', v)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Or paste image URL</label>
                    <Input
                      placeholder="https://... or data:image/..."
                      value={s.bgImage.startsWith('data:') ? 'Embedded image data' : s.bgImage}
                      onChange={(e) => set('bgImage', e.target.value)}
                      className="h-7 text-xs bg-background border-none"
                    />
                  </div>
                </div>
              )}

              {/* Color Palette Controls with Progressive Disclosure */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                    {s.bgMode === 'solid' ? 'Solid Color' : 'Color Palette'}
                  </span>
                  {s.bgMode !== 'solid' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        bloomSound()
                        onRandomizeColors()
                      }}
                      className="h-6 gap-1 text-[0.625rem] text-muted-foreground hover:text-foreground"
                    >
                      <IconArrowsShuffle className="size-3" />
                      Shuffle
                    </Button>
                  )}
                </div>

                {/* Preset Palettes from @usespaceui/gradients (hidden in solid and image mode) */}
                {s.bgMode !== 'solid' && s.bgMode !== 'image' && (
                  <Select
                    value={paletteIdx}
                    onValueChange={(val) => {
                      const idx = Number(val)
                      const p = PRESET_PALETTES[idx]
                      if (p) {
                        tapSound()
                        setPaletteIdx(val ?? '')
                        const c0 = hexToRgbString(p.colors[0] ?? '#2770EA')
                        const c1 = hexToRgbString(p.colors[1] ?? '#06C4F8')
                        const c2 = hexToRgbString(p.colors[2] ?? '#1A8BBF')
                        const c3 = hexToRgbString(p.colors[3] ?? p.colors[2] ?? '#0CBFF9')
                        const c4 = p.colors[4] ? hexToRgbString(p.colors[4]) : 'rgb(9, 9, 9)'
                        set('bgFrom', c0)
                        set('bgVia', c1)
                        set('glow', c2)
                        set('bgTo', c3)
                        set('bgBase', c4)
                      }
                    }}
                  >
                    <SelectTrigger
                      aria-label="Color palette"
                      className="h-10 w-full rounded-xl text-xs bg-muted border-none px-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex shrink-0 items-center -space-x-1">
                          {(paletteIdx && PRESET_PALETTES[Number(paletteIdx)]
                            ? PRESET_PALETTES[Number(paletteIdx)].colors
                            : [
                                colorToHex(s.bgFrom),
                                colorToHex(s.bgVia),
                                colorToHex(s.glow),
                                colorToHex(s.bgTo),
                                colorToHex(s.bgBase),
                              ]
                          )
                            .slice(0, 5)
                            .map((c, i) => (
                              <span
                                key={`trigger-${c}-${i}`}
                                className="size-5 rounded-full border border-background"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                        </span>
                        <span className="truncate">
                          {paletteIdx && PRESET_PALETTES[Number(paletteIdx)]
                            ? PRESET_PALETTES[Number(paletteIdx)].name
                            : 'Pick a palette'}
                        </span>
                      </span>
                    </SelectTrigger>
                    <SelectPopup>
                      {PRESET_PALETTES.map((palette, idx) => (
                        <SelectItem key={palette.name} value={String(idx)} label={palette.name}>
                          <span className="flex items-center gap-2">
                            <span className="flex shrink-0 items-center -space-x-1">
                              {palette.colors.slice(0, 5).map((c, i) => (
                                <span
                                  key={`${c}-${i}`}
                                  className="size-4 rounded-full border border-background"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </span>
                            <span className="text-xs font-medium">{palette.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                )}

                {/* Progressive Color Inputs: Only display what is applicable */}
                <div className="flex flex-col gap-1.5">
                  {s.bgMode === 'solid' ? (
                    <ColorFieldRow label="Background" value={s.bgBase} onChange={(v) => set('bgBase', v)} />
                  ) : s.bgMode === 'image' ? (
                    <ColorFieldRow label="Tint / Canvas Base" value={s.bgBase} onChange={(v) => set('bgBase', v)} />
                  ) : s.bgMode === 'gradient' || s.bgMode === 'blur' ? (
                    <>
                      <ColorFieldRow label="Accent 1 (From)" value={s.bgFrom} onChange={(v) => set('bgFrom', v)} />
                      <ColorFieldRow label="Accent 2 (Via)" value={s.bgVia} onChange={(v) => set('bgVia', v)} />
                      <ColorFieldRow label="Accent 3 (To)" value={s.bgTo} onChange={(v) => set('bgTo', v)} />
                    </>
                  ) : (
                    <>
                      <ColorFieldRow label="Canvas Base" value={s.bgBase} onChange={(v) => set('bgBase', v)} />
                      <ColorFieldRow label="Accent 1 (From)" value={s.bgFrom} onChange={(v) => set('bgFrom', v)} />
                      <ColorFieldRow label="Accent 2 (Via)" value={s.bgVia} onChange={(v) => set('bgVia', v)} />
                      <ColorFieldRow label="Accent 3 (Glow)" value={s.glow} onChange={(v) => set('glow', v)} />
                      <ColorFieldRow label="Accent 4 (To)" value={s.bgTo} onChange={(v) => set('bgTo', v)} />
                    </>
                  )}
                </div>
              </div>

              {/* Angle Slider */}
              {(s.bgMode === 'gradient' || s.bgMode === 'blur') && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Gradient Angle</span>
                    <span className="text-muted-foreground">{s.angle}°</span>
                  </div>
                  <Slider
                    min={0}
                    max={360}
                    step={5}
                    value={[s.angle]}
                    onValueChange={(v) => handleSlider('angle', v)}
                  />
                </div>
              )}

              {/* Orbs Sliders */}
              {s.bgMode === 'orbs' && (
                <div className="flex flex-col gap-3 pt-1">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground">Orb Dynamics</span>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Orb Blur</span>
                      <span className="text-muted-foreground">{s.orbBlur}px</span>
                    </div>
                    <Slider
                      min={20}
                      max={200}
                      step={2}
                      value={[s.orbBlur]}
                      onValueChange={(v) => handleSlider('orbBlur', v)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Orb Opacity</span>
                      <span className="text-muted-foreground">{s.orbOpacity}%</span>
                    </div>
                    <Slider
                      min={10}
                      max={100}
                      step={1}
                      value={[s.orbOpacity]}
                      onValueChange={(v) => handleSlider('orbOpacity', v)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Orb Size</span>
                      <span className="text-muted-foreground">{s.orbSize}%</span>
                    </div>
                    <Slider
                      min={60}
                      max={160}
                      step={1}
                      value={[s.orbSize]}
                      onValueChange={(v) => handleSlider('orbSize', v)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== TAB: SHOWCASE ASSETS ==================== */}
          {activeTab === 'showcase' && (
            <>
              {/* Showcase Gallery Toggle Card */}
              <div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold">Showcase Asset Gallery</span>
                    <span className="text-[10px] text-muted-foreground">
                      Floating constellation or shelf of visual assets
                    </span>
                  </div>
                  <Switch
                    checked={s.showcaseOn}
                    onCheckedChange={(v) => {
                      toggleSound()
                      set('showcaseOn', v)
                    }}
                  />
                </div>

                {s.showcaseOn && (
                  <div className="flex flex-col gap-3.5 pt-2 border-t border-border/40">
                    {/* Asset Type */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Asset Source</label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['flags', 'avatars', 'squishmoji', 'tech'] as ShowcaseType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              tickSound()
                              set('showcaseType', t)
                            }}
                            className={cn(
                              'flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-all capitalize',
                              s.showcaseType === t
                                ? 'bg-background text-foreground font-semibold ring-1 ring-border/60'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                            )}
                          >
                            {t === 'flags'
                              ? 'Flags'
                              : t === 'avatars'
                                ? 'Avatars'
                                : t === 'squishmoji'
                                  ? 'Squish'
                                  : 'Tech'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Pattern */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Arrangement Pattern</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['cloud', 'shelf', 'grid'] as ShowcaseLayout[]).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              tickSound()
                              set('showcaseLayout', l)
                            }}
                            className={cn(
                              'flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-all',
                              s.showcaseLayout === l
                                ? 'bg-background text-foreground font-semibold ring-1 ring-border/60'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                            )}
                          >
                            {l === 'cloud' ? 'Cloud (Right)' : l === 'shelf' ? 'Shelf (Bottom)' : 'Grid Matrix'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Item Shape */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">Asset Shape</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['circle', 'squircle', 'rect'] as ShowcaseShape[]).map((sh) => (
                          <button
                            key={sh}
                            type="button"
                            onClick={() => {
                              tickSound()
                              set('showcaseShape', sh)
                            }}
                            className={cn(
                              'flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-all',
                              s.showcaseShape === sh
                                ? 'bg-background text-foreground font-semibold ring-1 ring-border/60'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                            )}
                          >
                            {sh === 'circle' ? 'Circle' : sh === 'squircle' ? 'Squircle' : '4:3 Rect'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sizing & Counts */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Item Size</span>
                          <span className="text-muted-foreground">{s.showcaseSize}px</span>
                        </div>
                        <Slider
                          min={32}
                          max={96}
                          step={2}
                          value={[s.showcaseSize]}
                          onValueChange={(v) => handleSlider('showcaseSize', v)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Item Count</span>
                          <span className="text-muted-foreground">{s.showcaseCount}</span>
                        </div>
                        <Slider
                          min={8}
                          max={36}
                          step={1}
                          value={[s.showcaseCount]}
                          onValueChange={(v) => handleSlider('showcaseCount', v)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Item Spacing Gap</span>
                          <span className="text-muted-foreground">{s.showcaseGap}px</span>
                        </div>
                        <Slider
                          min={8}
                          max={32}
                          step={2}
                          value={[s.showcaseGap]}
                          onValueChange={(v) => handleSlider('showcaseGap', v)}
                        />
                      </div>

                      {s.showcaseLayout === 'shelf' && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">Subtle Wavy Divider</span>
                          <Switch
                            checked={s.showcaseWave}
                            onCheckedChange={(v) => {
                              toggleSound()
                              set('showcaseWave', v)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Framework Badges Bar */}
              <div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold">Tech Badges Row</span>
                    <span className="text-[10px] text-muted-foreground">
                      Framework icon tiles displayed under the headline
                    </span>
                  </div>
                  <Switch
                    checked={s.showTechBadges}
                    onCheckedChange={(v) => {
                      toggleSound()
                      set('showTechBadges', v)
                    }}
                  />
                </div>

                {s.showTechBadges && (
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-border/40">
                    <span className="text-[11px] font-medium text-muted-foreground">Select Technologies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {TECH_KEYS.map((key) => {
                        const isSelected = s.techBadges.includes(key)
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              tickSound()
                              const next = isSelected ? s.techBadges.filter((b) => b !== key) : [...s.techBadges, key]
                              set('techBadges', next)
                            }}
                            className={cn(
                              'flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition-all',
                              isSelected
                                ? 'bg-primary text-primary-foreground font-semibold'
                                : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground border border-border/40',
                            )}
                          >
                            <span>{TECH_LABELS[key]}</span>
                            {isSelected && <IconCheck className="size-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dual-Tone Headline Accent */}
              <div className="flex flex-col gap-2.5 rounded-xl bg-muted/60 p-3 border border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold">Headline Dual-Tone Accent</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Surround any word in your headline with{' '}
                    <code className="rounded bg-background px-1 py-0.5 text-primary">{'{...}'}</code> to render it in
                    this accent color. Example:{' '}
                    <span className="font-semibold text-foreground">
                      Blade <span className="text-primary font-bold">{'{Flags}'}</span>
                    </span>
                  </p>
                </div>
                <ColorFieldRow
                  label="Accent Color"
                  value={s.titleAccentColor}
                  onChange={(v) => set('titleAccentColor', v)}
                />
              </div>
            </>
          )}

          {/* ==================== TAB 2: CONTENT & CHIPS ==================== */}
          {activeTab === 'content' && (
            <>
              {/* Copy Inputs */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Card Copy</span>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Brand Title</label>
                  <Input
                    value={s.brand}
                    onChange={(e) => set('brand', e.target.value)}
                    className="h-8 rounded-lg text-xs bg-muted border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Main Headline</label>
                  <Input
                    value={s.title}
                    onChange={(e) => set('title', e.target.value)}
                    className="h-8 rounded-lg text-xs font-semibold bg-muted border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Subtitle</label>
                  <Input
                    value={s.subtitle}
                    onChange={(e) => set('subtitle', e.target.value)}
                    className="h-8 rounded-lg text-xs bg-muted border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Badge Text</label>
                  <Input
                    value={s.badge}
                    onChange={(e) => set('badge', e.target.value)}
                    className="h-8 rounded-lg text-xs font-mono bg-muted border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Tags / Stack</label>
                  <Input
                    value={s.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    className="h-8 rounded-lg text-xs bg-muted border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Footer Text</label>
                  <Input
                    value={s.footer}
                    onChange={(e) => set('footer', e.target.value)}
                    className="h-8 rounded-lg text-xs bg-muted border-none"
                  />
                </div>
              </div>

              {/* Typography Styling */}
              <div className="flex flex-col gap-3 pt-1">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Typography Colors</span>
                <div className="flex flex-col gap-1.5">
                  <ColorFieldRow label="Title Color" value={s.titleColor} onChange={(v) => set('titleColor', v)} />
                  <ColorFieldRow
                    label="Accent Color ({word})"
                    value={s.titleAccentColor}
                    onChange={(v) => set('titleAccentColor', v)}
                  />
                  <ColorFieldRow
                    label="Subtitle Color"
                    value={s.subtitleColor}
                    onChange={(v) => set('subtitleColor', v)}
                  />
                  <ColorFieldRow label="Muted Color" value={s.mutedColor} onChange={(v) => set('mutedColor', v)} />
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Title Font Size</span>
                    <span className="text-muted-foreground">{s.titleSize}px</span>
                  </div>
                  <Slider
                    min={32}
                    max={140}
                    step={1}
                    value={[s.titleSize]}
                    onValueChange={(v) => handleSlider('titleSize', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Title Weight</span>
                    <span className="text-muted-foreground">{s.titleWeight}</span>
                  </div>
                  <Slider
                    min={400}
                    max={800}
                    step={100}
                    value={[s.titleWeight]}
                    onValueChange={(v) => handleSlider('titleWeight', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tracking (Spacing)</span>
                    <span className="text-muted-foreground">{s.titleTracking}%</span>
                  </div>
                  <Slider
                    min={-10}
                    max={2}
                    step={0.2}
                    value={[s.titleTracking]}
                    onValueChange={(v) => handleSlider('titleTracking', v)}
                  />
                </div>
              </div>

              {/* Chips Per Element */}
              <div className="flex flex-col gap-2.5 pt-1 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground">Element Chips</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        tickSound()
                        CHIP_KEYS.forEach((c) => setChip(c.id, { on: true }))
                      }}
                      className="h-5 px-1.5 text-[10px]"
                    >
                      All On
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        tickSound()
                        CHIP_KEYS.forEach((c) => setChip(c.id, { on: false }))
                      }}
                      className="h-5 px-1.5 text-[10px]"
                    >
                      All Off
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {CHIP_KEYS.map((k) => {
                    const isSelected = activeChipKey === k.id
                    const isOn = s.chips[k.id]?.on
                    return (
                      <Button
                        key={k.id}
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          tapSound()
                          setActiveChipKey(k.id)
                        }}
                        className={cn(
                          'h-7 text-[11px] justify-between px-2 rounded-lg bg-muted hover:bg-muted transition-all',
                          isSelected &&
                            'ring-2 ring-muted ring-offset-2 ring-offset-background font-semibold text-foreground',
                        )}
                      >
                        <span className="truncate">{k.name}</span>
                        {isOn && <span className="size-1.5 rounded-full shrink-0 bg-primary" />}
                      </Button>
                    )
                  })}
                </div>

                {s.chips[activeChipKey] && (
                  <div className="flex flex-col gap-2.5 rounded-xl bg-muted p-2.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        Enable {CHIP_KEYS.find((k) => k.id === activeChipKey)?.name} Chip
                      </span>
                      <Switch
                        checked={s.chips[activeChipKey].on}
                        onCheckedChange={(c) => {
                          toggleSound(c ? 'on' : 'off')
                          setChip(activeChipKey, { on: c })
                        }}
                      />
                    </div>

                    {s.chips[activeChipKey].on && (
                      <div className="flex flex-col gap-2 pt-1">
                        <ColorFieldRow
                          label="Chip Background"
                          value={s.chips[activeChipKey].bg}
                          onChange={(v) => setChip(activeChipKey, { bg: v })}
                        />
                        <ColorFieldRow
                          label="Chip Border"
                          value={s.chips[activeChipKey].border}
                          onChange={(v) => setChip(activeChipKey, { border: v })}
                        />

                        <div className="flex flex-col gap-1.5 pt-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Radius</span>
                            <span className="text-muted-foreground">{s.chips[activeChipKey].radius}px</span>
                          </div>
                          <Slider
                            min={0}
                            max={999}
                            step={2}
                            value={[s.chips[activeChipKey].radius]}
                            onValueChange={(v) =>
                              setChip(activeChipKey, {
                                radius: Array.isArray(v) ? v[0] : v,
                              })
                            }
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            confirmSound()
                            const current = s.chips[activeChipKey]
                            CHIP_KEYS.forEach((c) => setChip(c.id, { ...current, on: s.chips[c.id].on }))
                          }}
                          className="h-7 w-full text-[11px] bg-background hover:bg-background/80"
                        >
                          <IconCopy className="mr-1.5 size-3" />
                          Apply style to all chips
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Logo & Media Section */}
                <div className="flex flex-col gap-2.5 rounded-xl bg-muted p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-foreground">Brand Logo</span>
                      <p className="text-[0.625rem] text-muted-foreground">Space UI emblem or custom uploaded asset</p>
                    </div>
                    <Switch
                      checked={s.showLogo}
                      onCheckedChange={(checked) => {
                        toggleSound(checked ? 'on' : 'off')
                        set('showLogo', checked)
                      }}
                    />
                  </div>

                  {s.showLogo && (
                    <div className="flex flex-col gap-2.5 pt-1">
                      {s.logoUrl ? (
                        <div className="flex items-center gap-2.5 rounded-lg bg-background p-2">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40 p-1 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.logoUrl} alt="Logo" className="size-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">Custom Logo</p>
                            <p className="text-[0.625rem] text-muted-foreground">Active badge asset</p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              openSound()
                              openLogoDialog()
                            }}
                            className="h-7 text-xs"
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              tapSound()
                              set('logoUrl', '')
                            }}
                            className="size-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <IconX className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              openSound()
                              openLogoDialog()
                            }}
                            className="h-8 flex-1 gap-1.5 text-xs font-medium"
                          >
                            <IconUpload className="size-3.5" />
                            <span>Upload Custom Logo</span>
                          </Button>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Logo Size</span>
                          <span className="text-muted-foreground">{s.logoSize}px</span>
                        </div>
                        <Slider
                          min={24}
                          max={80}
                          step={2}
                          value={[s.logoSize]}
                          onValueChange={(v) => handleSlider('logoSize', v)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Logo Gap</span>
                          <span className="text-muted-foreground">{s.logoGap}px</span>
                        </div>
                        <Slider
                          min={8}
                          max={40}
                          step={2}
                          value={[s.logoGap]}
                          onValueChange={(v) => handleSlider('logoGap', v)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Or paste Logo URL</label>
                        <Input
                          placeholder="https://... or data:image/..."
                          value={s.logoUrl.startsWith('data:') ? 'Embedded logo asset' : s.logoUrl}
                          onChange={(e) => set('logoUrl', e.target.value)}
                          className="h-7 text-xs bg-background border-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ==================== TAB 3: MOTION & ANIMATION ==================== */}
          {activeTab === 'motion' && (
            <>
              {/* Entrance Toggle Row */}
              <div className="flex items-center justify-between rounded-xl bg-muted p-2.5">
                <div>
                  <p className="text-xs font-medium">Entrance Animation</p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    Staggered elements during playback & MP4 export
                  </p>
                </div>
                <Switch
                  checked={s.animOn}
                  onCheckedChange={(checked) => {
                    toggleSound(checked ? 'on' : 'off')
                    set('animOn', checked)
                  }}
                />
              </div>

              {/* Animation Types */}
              <div className="flex flex-col gap-2">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Transition Effect</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ANIMS.map((a) => {
                    const isSelected = s.animType === a
                    return (
                      <Button
                        key={a}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          tapSound()
                          set('animType', a as AnimType)
                        }}
                        className={cn(
                          'h-8 rounded-xl text-xs capitalize bg-muted hover:bg-muted transition-all',
                          isSelected &&
                            'ring-2 ring-muted ring-offset-2 ring-offset-background font-semibold text-foreground',
                        )}
                      >
                        {a}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Timing Sliders */}
              <div className="flex flex-col gap-3 pt-1">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Timing & Cadence</span>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="text-muted-foreground">{s.animDuration}s</span>
                  </div>
                  <Slider
                    min={0.4}
                    max={12}
                    step={0.1}
                    value={[s.animDuration]}
                    onValueChange={(v) => handleSlider('animDuration', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stagger Delay</span>
                    <span className="text-muted-foreground">{s.animStagger}s</span>
                  </div>
                  <Slider
                    min={0}
                    max={1.2}
                    step={0.02}
                    value={[s.animStagger]}
                    onValueChange={(v) => handleSlider('animStagger', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Hold at End</span>
                    <span className="text-muted-foreground">{s.animHold}s</span>
                  </div>
                  <Slider
                    min={0}
                    max={8}
                    step={0.1}
                    value={[s.animHold]}
                    onValueChange={(v) => handleSlider('animHold', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Background Drift</span>
                    <span className="text-muted-foreground">{s.animBgDrift}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={200}
                    step={5}
                    value={[s.animBgDrift]}
                    onValueChange={(v) => handleSlider('animBgDrift', v)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Framerate</span>
                    <span className="text-muted-foreground">{s.animFps} fps</span>
                  </div>
                  <Slider
                    min={12}
                    max={60}
                    step={1}
                    value={[s.animFps]}
                    onValueChange={(v) => handleSlider('animFps', v)}
                  />
                </div>
              </div>

              {/* Open Export Action */}
              <Button
                type="button"
                onClick={() => {
                  bloomSound()
                  onOpenExport()
                }}
                className="mt-2 h-9 w-full gap-2 rounded-xl text-xs font-semibold"
              >
                <IconMovie className="size-4" />
                Open Export Drawer
              </Button>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Registry useFileUpload hidden inputs */}
      <input {...getBgInputProps()} className="sr-only hidden pointer-events-none" tabIndex={-1} />
      <input {...getLogoInputProps()} className="sr-only hidden pointer-events-none" tabIndex={-1} />
    </div>
  )
}

/** Helper Row for color input + hex field */
function ColorFieldRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = colorToHex(value)
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-muted p-2">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-36 px-2 font-mono text-[11px] bg-background border-none"
        />
        <label className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border">
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(hexToRgbString(e.target.value))}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span className="block size-full rounded-md" style={{ backgroundColor: value }} />
        </label>
      </div>
    </div>
  )
}

/** Mini preview for engine modes */
function EnginePreview({ mode, s }: { mode: BgMode; s: OgState }) {
  switch (mode) {
    case 'orbs':
      return (
        <div className="size-full rounded relative overflow-hidden bg-background">
          <div
            className="absolute -left-1 -top-1 size-4 rounded-full blur-xs opacity-90"
            style={{ background: s.bgFrom }}
          />
          <div
            className="absolute -right-1 -bottom-1 size-4 rounded-full blur-xs opacity-80"
            style={{ background: s.bgVia }}
          />
        </div>
      )
    case 'gradient':
      return (
        <div
          className="size-full rounded"
          style={{ background: `linear-gradient(135deg, ${s.bgFrom}, ${s.bgVia}, ${s.bgTo})` }}
        />
      )
    case 'blur':
      return (
        <div
          className="size-full rounded filter blur-xs"
          style={{ background: `radial-gradient(${s.bgVia}, ${s.glow})` }}
        />
      )
    case 'solid':
      return <div className="size-full rounded" style={{ background: s.bgBase }} />
    case 'image':
    default:
      return (
        <div className="size-full rounded bg-muted flex items-center justify-center">
          <IconUpload className="size-3 text-muted-foreground" />
        </div>
      )
  }
}
