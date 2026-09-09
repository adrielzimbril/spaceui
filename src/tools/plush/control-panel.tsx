'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { IconSparkles, IconUpload, IconDownload } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Slider } from '@/registry/primitives/slider'
import { Switch } from '@/registry/primitives/switch'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import { confirmSound, pageSound, tickSound, toggleSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { PLUSH_PRESETS } from './presets'
import type { PlushConfig, PlushPreset, ArtworkData } from './types'

interface PlushControlPanelProps {
  config: PlushConfig
  onChange: (patch: Partial<PlushConfig>) => void
  activePresetId: string | null
  onSelectPreset: (preset: PlushPreset) => void
  onUploadFile: (file: File) => void
  activeArtwork: ArtworkData | null
  isUploading?: boolean
  onExport?: (frontView: boolean) => void
}

export function PlushControlPanel({
  config,
  onChange,
  activePresetId,
  onSelectPreset,
  onUploadFile,
  activeArtwork,
  isUploading,
  onExport,
}: PlushControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCardDragging, setIsCardDragging] = React.useState(false)

  const handleSlider = (key: keyof PlushConfig, val: number | readonly number[]) => {
    const num = Array.isArray(val) ? val[0] : (val as number)
    onChange({ [key]: num })
    tickSound()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadFile(file)
      confirmSound()
      e.target.value = ''
    }
  }

  const handleCardDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsCardDragging(true)
  }

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCardDragging(false)
  }

  const handleCardDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCardDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onUploadFile(file)
      confirmSound()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Plush</h2>
          <span className="text-[0.625rem] text-muted-foreground">Tactile 3D Studio</span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          <div
            onDragOver={handleCardDragOver}
            onDragLeave={handleCardDragLeave}
            onDrop={handleCardDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition-all bg-muted hover:bg-muted"
            title="Click or drop an image to upload"
          >
            <div
              className={cn(
                'relative size-11 shrink-0 overflow-hidden rounded-lg transition-all flex items-center justify-center',
                isCardDragging && 'ring-2 ring-dashed ring-foreground',
              )}
            >
              {activeArtwork?.preview ? (
                <Image
                  src={activeArtwork.preview}
                  alt={activeArtwork.label}
                  width={44}
                  height={44}
                  unoptimized
                  className="size-full object-cover rounded-lg"
                />
              ) : (
                <IconSparkles className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {isCardDragging ? 'Drop image here' : activeArtwork ? activeArtwork.label : 'Bunny'}
              </p>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                {isCardDragging
                  ? 'PNG, WebP, SVG, JPG, GIF'
                  : activeArtwork?.animationType === 'svg'
                    ? 'Animated SVG · 140k strands'
                    : activeArtwork?.apngPlayer
                      ? 'Animated APNG · 140k strands'
                      : 'Tactile 3D plush sphere'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              aria-label="Upload custom image"
              data-space-hover="tick"
              className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
            >
              <IconUpload className="size-3.5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Presets</span>
            <div className="grid grid-cols-5 gap-1.5">
              {PLUSH_PRESETS.map((p) => {
                const isSelected = activePresetId === p.id
                return (
                  <Button
                    key={p.id}
                    type="button"
                    variant="ghost"
                    data-space-hover="tick"
                    onClick={() => {
                      pageSound()
                      onSelectPreset(p)
                    }}
                    className={cn(
                      'group flex h-auto! flex-col items-center gap-1 rounded-xl p-1 cursor-pointer bg-muted hover:bg-muted transition-all',
                      isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
                    )}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg flex items-center justify-center">
                      <Image
                        src={p.preview}
                        alt={p.label}
                        width={64}
                        height={64}
                        unoptimized
                        className="size-full object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span
                      className={cn(
                        'w-full truncate px-0.5 text-center text-[0.625rem] font-medium transition-colors',
                        isSelected
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {p.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Shape Geometry</span>
            <ToggleGroup
              value={[config.roundness >= 0.85 ? 'sphere' : config.roundness <= 0.05 ? 'cube' : 'cushion']}
              onValueChange={(val) => {
                const next = val[0]
                if (next === 'sphere') {
                  onChange({ roundness: 1.0, cornerRadius: 0.35, puffiness: 1.0 })
                  toggleSound('on')
                } else if (next === 'cushion') {
                  onChange({ roundness: 0.35, cornerRadius: 0.2, puffiness: 0.65 })
                  toggleSound('on')
                } else if (next === 'cube') {
                  onChange({ roundness: 0.0, cornerRadius: 0.08, puffiness: 0.0 })
                  toggleSound('on')
                }
              }}
              className="w-full"
            >
              <ToggleGroupItem value="sphere" className="flex-1 text-xs">
                Sphere
              </ToggleGroupItem>
              <ToggleGroupItem value="cushion" className="flex-1 text-xs">
                Cushion
              </ToggleGroupItem>
              <ToggleGroupItem value="cube" className="flex-1 text-xs">
                Cube
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Roundness</span>
                <span className="text-muted-foreground">{(config.roundness * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.02}
                value={[config.roundness]}
                onValueChange={(val) => handleSlider('roundness', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Corner Radius</span>
                <span className="text-muted-foreground">{config.cornerRadius.toFixed(2)}</span>
              </div>
              <Slider
                min={0.01}
                max={0.4}
                step={0.01}
                value={[config.cornerRadius]}
                onValueChange={(val) => handleSlider('cornerRadius', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Puffiness & Inflation</span>
                <span className="text-muted-foreground">{(config.puffiness * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.02}
                value={[config.puffiness]}
                onValueChange={(val) => handleSlider('puffiness', val)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Rim & Base Color</span>

            <div className="flex items-center justify-between rounded-xl bg-muted p-2.5">
              <div>
                <p className="text-xs font-medium">
                  {activeArtwork?.hasAlpha ? 'Auto Blend Color' : 'Auto Edge Color'}
                </p>
                <p className="text-[0.625rem] text-muted-foreground">
                  {activeArtwork?.hasAlpha
                    ? config.autoColor
                      ? 'Blends dominant artwork color'
                      : 'Default white rim'
                    : config.autoColor
                      ? 'Continuous border gradient'
                      : 'Default white rim'}
                </p>
              </div>
              <Switch
                checked={config.autoColor}
                onCheckedChange={(checked) => {
                  const patch: Partial<PlushConfig> = { autoColor: checked }
                  if (checked) {
                    if (activeArtwork?.hasAlpha) {
                      const vibrant = activeArtwork.palette?.find(
                        (c) =>
                          c.toLowerCase() !== '#ffffff' &&
                          c.toLowerCase() !== '#121214' &&
                          c.toLowerCase() !== '#000000',
                      )
                      patch.sideColor = vibrant || activeArtwork.palette?.[0] || activeArtwork.edgeColor || '#ffffff'
                    } else {
                      patch.sideColor = activeArtwork?.edgeColor || '#ffffff'
                    }
                  } else {
                    patch.sideColor = '#ffffff'
                  }
                  onChange(patch)
                  toggleSound(checked ? 'on' : 'off')
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Fur Fiber Properties</span>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Strand Length</span>
                <span className="text-muted-foreground">{config.furSize.toFixed(2)}</span>
              </div>
              <Slider
                min={0.4}
                max={1.8}
                step={0.05}
                value={[config.furSize]}
                onValueChange={(val) => handleSlider('furSize', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fiber Thickness</span>
                <span className="text-muted-foreground">{config.furThickness.toFixed(2)}</span>
              </div>
              <Slider
                min={0.4}
                max={2.0}
                step={0.05}
                value={[config.furThickness]}
                onValueChange={(val) => handleSlider('furThickness', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Rim Sheen & Highlights</span>
                <span className="text-muted-foreground">{config.furHighlight.toFixed(2)}</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[config.furHighlight]}
                onValueChange={(val) => handleSlider('furHighlight', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Artwork Dye Opacity</span>
                <span className="text-muted-foreground">{Math.round(config.iconOpacity * 100)}%</span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[config.iconOpacity]}
                onValueChange={(val) => handleSlider('iconOpacity', val)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 pb-6">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Tactile Touch & Grooming</span>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Petting Radius</span>
                <span className="text-muted-foreground">{config.handSize.toFixed(2)}</span>
              </div>
              <Slider
                min={0.5}
                max={2.0}
                step={0.05}
                value={[config.handSize]}
                onValueChange={(val) => handleSlider('handSize', val)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Indent Pressure</span>
                <span className="text-muted-foreground">{config.pressure.toFixed(2)}</span>
              </div>
              <Slider
                min={0.2}
                max={1.8}
                step={0.05}
                value={[config.pressure]}
                onValueChange={(val) => handleSlider('pressure', val)}
              />
            </div>
          </div>

          <div className="hidden flex flex-col gap-2 pt-1 pb-6">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Export Asset</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  confirmSound()
                  onExport?.(true)
                }}
                className="w-full text-xs font-medium cursor-pointer"
              >
                <IconDownload className="size-3.5 mr-1.5" />
                Front (1:1)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  confirmSound()
                  onExport?.(false)
                }}
                className="w-full text-xs font-medium cursor-pointer"
              >
                <IconDownload className="size-3.5 mr-1.5" />
                3D View (1:1)
              </Button>
            </div>
            <p className="text-[0.625rem] text-muted-foreground text-center">
              1024x1024 Transparent PNG · Social & Avatar Ready
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
