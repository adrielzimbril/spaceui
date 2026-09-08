'use client'

import React from 'react'
import { IconCut, IconPhoto, IconUpload } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Slider } from '@/registry/primitives/slider'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import { bloomSound } from '@/components/providers/sound-provider'
import { formatBytes, getColFlex, type Ratio, type SplitConfig } from './split'

const RATIO_TABS: { label: string; value: string; ratio: Ratio }[] = [
  { label: 'Original', value: 'original', ratio: 'original' },
  { label: '4:5', value: String(4 / 5), ratio: 4 / 5 },
  { label: '1x1', value: '1', ratio: 1 },
  { label: '3:4', value: String(3 / 4), ratio: 3 / 4 },
]

const COLUMN_TABS = [1, 2, 3, 4, 5] as const

const RESOLUTION_OPTIONS = [
  { value: '1', label: '1×' },
  { value: '2', label: '2×' },
  { value: '3', label: '3×' },
  { value: '0.5', label: '0.5×' },
]

const FORMAT_OPTIONS = [
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/webp', label: 'WebP' },
]

const PRESET_OPTIONS = [
  { value: 'flex-1-2-1', label: 'Focus Center' },
  { value: 'flex-1-2-2', label: 'Wide Right' },
  { value: 'flex-2-2-1', label: 'Wide Left' },
  { value: 'carousel-3', label: 'Carousel ×3' },
  { value: 'carousel-4', label: 'Carousel ×4' },
  { value: 'panorama-2', label: 'Panorama ×2' },
  { value: 'square-4', label: 'Square strip ×4' },
  { value: 'portrait-5', label: 'Portrait strip ×5' },
]

export function XplitControlPanel({
  cfg,
  setCfg,
  file,
  img,
  dims,
  busy,
  onReset,
  onDownloadZip,
  onDownloadBatch,
  onPickFile,
}: {
  cfg: SplitConfig
  setCfg: React.Dispatch<React.SetStateAction<SplitConfig>>
  file: { name: string; size: number } | null
  img: HTMLImageElement | null
  dims: { stageW: number; stageH: number; tileW: number; tileH: number } | null
  busy: boolean
  onReset: () => void
  onDownloadZip: () => void
  onDownloadBatch: () => void
  onPickFile: () => void
}) {
  const set = <K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => {
    setCfg((c) => ({ ...c, [key]: value }))
  }

  const [activePreset, setActivePreset] = React.useState<string | null>(null)
  const colFlex = getColFlex(cfg)

  const toggleColFlex = (index: number) => {
    bloomSound()
    const next = [...colFlex]
    next[index] = next[index] === 1 ? 2 : 1
    setCfg((c) => ({ ...c, colFlex: next }))
  }

  const applyPreset = (preset: string | null) => {
    if (!preset) return
    bloomSound()
    setActivePreset(preset)
    if (preset === 'flex-1-2-1') setCfg((c) => ({ ...c, cols: 3, ratio: 'original', colFlex: [1, 2, 1] }))
    if (preset === 'flex-1-2-2') setCfg((c) => ({ ...c, cols: 3, ratio: 'original', colFlex: [1, 2, 2] }))
    if (preset === 'flex-2-2-1') setCfg((c) => ({ ...c, cols: 3, ratio: 'original', colFlex: [2, 2, 1] }))
    if (preset === 'carousel-3') setCfg((c) => ({ ...c, cols: 3, ratio: 'original', colFlex: [1, 1, 1] }))
    if (preset === 'carousel-4') setCfg((c) => ({ ...c, cols: 4, ratio: 'original', colFlex: [1, 1, 1, 1] }))
    if (preset === 'panorama-2') setCfg((c) => ({ ...c, cols: 2, ratio: 'original', colFlex: [1, 1] }))
    if (preset === 'square-4') setCfg((c) => ({ ...c, cols: 4, ratio: 'original', colFlex: [1, 1, 1, 1] }))
    if (preset === 'portrait-5') setCfg((c) => ({ ...c, cols: 5, ratio: 'original', colFlex: [1, 1, 1, 1, 1] }))
  }

  const activePresetLabel = PRESET_OPTIONS.find((p) => p.value === activePreset)?.label
  const activeScale = RESOLUTION_OPTIONS.find((r) => r.value === String(cfg.scale))
  const activeFormat = FORMAT_OPTIONS.find((f) => f.value === cfg.format)

  const currentRatioValue = String(cfg.ratio)

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Panel Top Title Bar */}
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Xplit</h2>
          <span className="text-[0.625rem] text-muted-foreground">Image Slicer</span>
        </div>
      </div>

      {/* Panel Body */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          {/* Active Image Summary Card */}
          <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-background">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.src} alt={file?.name ?? 'Preview'} className="size-full object-cover" />
              ) : (
                <IconCut className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{file ? file.name : 'No image loaded'}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                {file
                  ? `${img?.naturalWidth}×${img?.naturalHeight} px · ${formatBytes(file.size)}`
                  : 'Upload a file to start'}
              </p>
            </div>
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onPickFile}
                aria-label="Replace image"
                className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <IconUpload className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onPickFile}
                aria-label="Upload image"
                className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <IconPhoto className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Preset</span>
            <Select value={activePreset} onValueChange={applyPreset}>
              <SelectTrigger aria-label="Preset" className="h-9 border-0 bg-muted px-3 text-xs">
                <SelectValue>
                  <span className="truncate">{activePresetLabel ?? 'Choose a preset...'}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRESET_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value} label={item.label}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Columns Tabs (1 to 5) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Columns</span>
              <span className="text-[0.625rem] font-mono text-muted-foreground">{cfg.cols} parts</span>
            </div>
            <Tabs
              value={String(cfg.cols)}
              onValueChange={(val) => {
                if (!val) return
                bloomSound()
                const n = Number(val)
                setActivePreset(null)
                setCfg((c) => {
                  const current = getColFlex(c)
                  const nextFlex = Array.from({ length: n }, (_, i) => current[i] ?? 1)
                  return { ...c, cols: n, colFlex: nextFlex }
                })
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full h-auto p-0.5 gap-0.5">
                {COLUMN_TABS.map((n) => (
                  <TabsTab key={n} value={String(n)} className="text-xs py-1.5 px-2">
                    {n}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Column Widths (Flex per column) */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Column Widths</span>
            <div className="flex items-center gap-1.5 w-full">
              {colFlex.map((f, i) => (
                <Button
                  key={i}
                  type="button"
                  variant={f === 2 ? 'default' : 'secondary'}
                  size="xs"
                  onClick={() => {
                    setActivePreset(null)
                    toggleColFlex(i)
                  }}
                  className="flex-1 text-[0.6875rem] font-mono h-7 border-0 cursor-pointer"
                  title={`Column ${i + 1}: click to toggle flex (1x / 2x)`}
                >
                  {f}×
                </Button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio with Tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Aspect Ratio</span>
            <Tabs
              value={currentRatioValue}
              onValueChange={(val) => {
                if (!val) return
                const found = RATIO_TABS.find((item) => item.value === val)
                if (found) {
                  bloomSound()
                  set('ratio', found.ratio)
                }
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full h-auto p-0.5 gap-0.5">
                {RATIO_TABS.map((r) => (
                  <TabsTab key={r.value} value={r.value} className="text-xs py-1.5 px-2">
                    {r.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Fitting Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Fitting</span>
            <ToggleGroup
              value={[cfg.fit]}
              onValueChange={(val) => {
                const next = val[0]
                if (next === 'cover' || next === 'contain') {
                  bloomSound()
                  set('fit', next)
                }
              }}
              className="w-full"
            >
              <ToggleGroupItem value="cover" className="flex-1 text-xs">
                Cover
              </ToggleGroupItem>
              <ToggleGroupItem value="contain" className="flex-1 text-xs">
                Contain
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Zoom */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Zoom</span>
              <span className="text-[0.625rem] font-mono text-muted-foreground">{cfg.zoom.toFixed(2)}×</span>
            </div>
            <Slider
              value={[cfg.zoom]}
              min={1}
              max={5}
              step={0.01}
              onValueChange={(val) => {
                const next = Array.isArray(val) ? val[0] : val
                if (typeof next === 'number') set('zoom', next)
              }}
            />
          </div>

          {/* Horizontal Position (Pan X) - Only if contain */}
          {cfg.fit === 'contain' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Horizontal Pan</span>
                <span className="text-[0.625rem] font-mono text-muted-foreground">{Math.round(cfg.panX * 100)}%</span>
              </div>
              <Slider
                value={[cfg.panX]}
                min={0}
                max={1}
                step={0.005}
                onValueChange={(val) => {
                  const next = Array.isArray(val) ? val[0] : val
                  if (typeof next === 'number') set('panX', next)
                }}
              />
            </div>
          )}

          {/* Vertical Position (Pan Y) - Only if cover */}
          {cfg.fit === 'cover' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Vertical Pan</span>
                <span className="text-[0.625rem] font-mono text-muted-foreground">{Math.round(cfg.panY * 100)}%</span>
              </div>
              <Slider
                value={[cfg.panY]}
                min={0}
                max={1}
                step={0.005}
                onValueChange={(val) => {
                  const next = Array.isArray(val) ? val[0] : val
                  if (typeof next === 'number') set('panY', next)
                }}
              />
            </div>
          )}

          {/* Slice Direction */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Slice Direction</span>
            <ToggleGroup
              value={[cfg.reverse ? 'reverse' : 'normal']}
              onValueChange={(val) => {
                const next = val[0]
                if (next) {
                  bloomSound()
                  set('reverse', next === 'reverse')
                }
              }}
              className="w-full"
            >
              <ToggleGroupItem value="normal" className="flex-1 text-xs">
                Normal (1 → {cfg.cols})
              </ToggleGroupItem>
              <ToggleGroupItem value="reverse" className="flex-1 text-xs">
                Reversed ({cfg.cols} → 1)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Export Settings */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Export</span>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Resolution</span>
                <Select
                  value={String(cfg.scale)}
                  onValueChange={(val) => {
                    if (!val) return
                    bloomSound()
                    set('scale', Number(val))
                  }}
                >
                  <SelectTrigger className="h-9 border-0 bg-muted px-2.5 text-xs">
                    <SelectValue placeholder="Resolution">{activeScale?.label ?? `${cfg.scale}×`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTION_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value} label={r.label}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">Format</span>
                <Select
                  value={cfg.format}
                  onValueChange={(val) => {
                    if (!val) return
                    bloomSound()
                    set('format', val as SplitConfig['format'])
                  }}
                >
                  <SelectTrigger className="h-9 border-0 bg-muted px-2.5 text-xs">
                    <SelectValue placeholder="Format">{activeFormat?.label ?? 'PNG'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value} label={f.label}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button"
                disabled={!img || busy}
                onClick={onDownloadZip}
                className="w-full h-9 font-medium cursor-pointer border-0"
                data-space-click="confirm"
              >
                {busy ? 'Downloading…' : 'Download'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!img || busy}
                onClick={onDownloadBatch}
                className="w-full h-9 border-0 bg-muted text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                data-space-click="open"
              >
                {busy ? 'Exporting…' : 'Download Batch'}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
