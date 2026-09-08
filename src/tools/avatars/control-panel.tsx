'use client'

import {
  AvatarEffect,
  type AvatarDetails,
  type AvatarEffect as AvatarEffectType,
  type AvatarVariant,
} from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react'
import { PRESET_PALETTES } from '@usespaceui/gradients'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Slider } from '@/registry/primitives/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import { AvatarVariantSelect, PaletteSelect } from './option-select'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'
import { toLabel, type AvatarViewMode } from './utils'

const SIZE_MIN = 64
const SIZE_MAX = 256

export function AvatarControlPanel({
  pool,
  pattern,
  setPattern,
  paletteIndex,
  setPaletteIndex,
  customColors,
  setCustomColors,
  size,
  setSize,
  effect,
  setEffect,
  circle,
  setCircle,
  animate,
  setAnimate,
  parsedColors,
  details,
  regenerateSeeds,
  view,
  setView,
  previewSeed,
}: {
  pool: string[]
  pattern: AvatarVariant | 'all'
  setPattern: (value: AvatarVariant | 'all') => void
  paletteIndex: number
  setPaletteIndex: (value: number) => void
  customColors: string[]
  setCustomColors: (colors: string[]) => void
  size: number
  setSize: (size: number) => void
  effect: AvatarEffectType
  setEffect: (effect: AvatarEffectType) => void
  circle: boolean
  setCircle: (circle: boolean) => void
  animate: boolean
  setAnimate: (animate: boolean) => void
  parsedColors: string[] | undefined
  details: AvatarDetails
  regenerateSeeds: () => void
  view: AvatarViewMode
  setView: (view: AvatarViewMode) => void
  previewSeed?: string
}) {
  const activeSeed = (view === 'seed' ? previewSeed : pool[0]) ?? DEFAULT_SEEDS

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Avatar</h2>
          <span className="text-[0.625rem] text-muted-foreground">
            {view === 'mockup' ? 'Mockup' : view === 'gallery' ? 'Gallery' : 'Seed'}
          </span>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-background">
              <Avatar
                name={activeSeed}
                variant={pattern === 'all' ? 'triton' : pattern}
                size={44}
                colors={parsedColors}
                circle={circle}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{pattern === 'all' ? 'All families' : toLabel(pattern)}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">Infinite canvas</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={regenerateSeeds}
              aria-label="Randomize avatar seeds"
              className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <IconRefresh className="size-3.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Family</span>
            <AvatarVariantSelect
              value={pattern}
              seed={activeSeed}
              colors={parsedColors}
              onChange={(value) => {
                setPattern(value)
                setEffect('none')
                setAnimate(false)
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Palette</span>
            <PaletteSelect
              value={String(paletteIndex)}
              seed={activeSeed}
              customColors={customColors}
              onChange={(value) => {
                const next = Number(value)
                setPaletteIndex(next)
                if (next >= 0) setCustomColors([...PRESET_PALETTES[next].colors])
              }}
            />
            <div className="flex items-center justify-between gap-2 px-0.5">
              {customColors.map((color, index) => (
                <label
                  key={`${index}-${color}`}
                  className="relative size-7 cursor-pointer overflow-hidden rounded-full"
                  style={{ backgroundColor: color }}
                >
                  <span className="sr-only">Custom color {index + 1}</span>
                  <input
                    type="color"
                    aria-label={`Custom color ${index + 1}`}
                    value={color}
                    onChange={(event) => {
                      const nextColors = [...customColors]
                      nextColors[index] = event.target.value
                      setCustomColors(nextColors)
                      setPaletteIndex(-1)
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {view === 'seed' ? (
            <div className="flex flex-col gap-2">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Size · {size}px</span>
              <Slider
                value={[size]}
                min={SIZE_MIN}
                max={SIZE_MAX}
                onValueChange={(val) => {
                  const next = Array.isArray(val) ? val[0] : val
                  if (typeof next === 'number') setSize(next)
                }}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Effect</span>
            <Select
              value={effect}
              onValueChange={(value) => {
                if (!value) return
                const nextEffect = value as AvatarEffectType
                setEffect(nextEffect)
                if (nextEffect !== 'none') setAnimate(false)
              }}
            >
              <SelectTrigger aria-label="Avatar effect" className="h-9 border-0 bg-muted px-3 text-xs">
                <SelectValue placeholder={toLabel(effect)} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AvatarEffect).map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                    label={toLabel(item)}
                    disabled={!details?.supportedEffects.includes(item)}
                  >
                    {toLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Shape</span>
            <ToggleGroup
              value={[circle ? 'circle' : 'rect']}
              onValueChange={(value) => {
                const next = value[0]
                if (next) setCircle(next === 'circle')
              }}
              className="w-full"
            >
              <ToggleGroupItem value="rect" className="flex-1">
                Square
              </ToggleGroupItem>
              <ToggleGroupItem value="circle" className="flex-1">
                Circle
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Motion</span>
            <ToggleGroup
              value={[animate ? 'on' : 'off']}
              onValueChange={(value) => {
                const next = value[0]
                if (next) setAnimate(next === 'on')
              }}
              className="w-full"
            >
              <ToggleGroupItem value="off" className="flex-1">
                Off
              </ToggleGroupItem>
              <ToggleGroupItem value="on" className="flex-1" disabled={!details?.supportsAnimate || effect !== 'none'}>
                On
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
