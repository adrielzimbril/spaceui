'use client'

import { IconRefresh } from '@tabler/icons-react'
import {
  EXPRESSION_VALUES,
  resolveBackgroundStyle,
  resolveExpression,
  resolveShape,
  SHAPE_VALUES,
  type SquishBackgroundStyleChoice,
  type SquishExpressionChoice,
  type SquishShapeChoice,
} from '@usespaceui/squishmoji'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Slider } from '@/registry/primitives/slider'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import { Button } from '@/registry/primitives/button'
import type { ReactNode } from 'react'
import type { ResourceViewMode } from '@/tools/shared/types'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'

const SIZE_MIN = 64
const SIZE_MAX = 256

function toLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

const BACKGROUND_SWATCHES: Array<{ id: SquishBackgroundStyleChoice; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'solid', label: 'Solid' },
  { id: 'taygeta', label: 'Taygeta' },
  { id: 'maia', label: 'Maia' },
  { id: 'merope', label: 'Merope' },
  { id: 'celaeno', label: 'Celaeno' },
  { id: 'alcyone', label: 'Alcyone' },
]

function OptionPreview({
  seed,
  shape,
  expression,
  backgroundStyle,
}: {
  seed: string
  shape: SquishShapeChoice
  expression: SquishExpressionChoice
  backgroundStyle: SquishBackgroundStyleChoice
}) {
  return (
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-muted [&_svg]:size-full! [&_svg]:shrink-0 [&_svg]:self-center">
      <Squishmoji
        seed={seed}
        size={24}
        shape={resolveShape(seed, shape)}
        expression={resolveExpression(seed, expression)}
        backgroundStyle={resolveBackgroundStyle(seed, backgroundStyle)}
        animate={false}
      />
    </span>
  )
}

export function SquishmojiControlPanel({
  seed,
  shape,
  setShape,
  expression,
  setExpression,
  backgroundStyle,
  setBackgroundStyle,
  size,
  setSize,
  animate,
  setAnimate,
  animWobble,
  setAnimWobble,
  animOnHover,
  setAnimOnHover,
  animOnClick,
  setAnimOnClick,
  regenerateSeeds,
  view,
  videoActions,
  children,
}: {
  seed: string
  shape: SquishShapeChoice
  setShape: (value: SquishShapeChoice) => void
  expression: SquishExpressionChoice
  setExpression: (value: SquishExpressionChoice) => void
  backgroundStyle: SquishBackgroundStyleChoice
  setBackgroundStyle: (value: SquishBackgroundStyleChoice) => void
  size: number
  setSize: (value: number) => void
  animate: boolean
  setAnimate: (value: boolean) => void
  animWobble: boolean
  setAnimWobble: (value: boolean) => void
  animOnHover: boolean
  setAnimOnHover: (value: boolean) => void
  animOnClick: boolean
  setAnimOnClick: (value: boolean) => void
  regenerateSeeds: () => void
  view: ResourceViewMode
  videoActions?: ReactNode
  children?: ReactNode
}) {
  const activeSeed = seed.trim() || DEFAULT_SEEDS

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Squishmoji</h2>
          <span className="text-[0.625rem] text-muted-foreground">
            {view === 'mockup' ? 'Mockup' : view === 'gallery' ? 'Gallery' : view === 'video' ? 'Video' : 'Seed'}
          </span>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-background">
              <Squishmoji
                seed={activeSeed}
                size={44}
                shape={resolveShape(activeSeed, shape)}
                expression={resolveExpression(activeSeed, expression)}
                backgroundStyle={resolveBackgroundStyle(activeSeed, backgroundStyle)}
                animate={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{toLabel(shape === 'all' ? 'All shapes' : shape)}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                {toLabel(expression === 'all' ? 'All expressions' : expression)}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Randomize seeds" onClick={regenerateSeeds}>
              <IconRefresh />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Shape</span>
            <Select value={shape} onValueChange={(value) => value && setShape(value as SquishShapeChoice)}>
              <SelectTrigger aria-label="Shape" className="h-10 border-0 bg-muted px-2.5 text-xs">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <OptionPreview
                      seed={activeSeed}
                      shape={shape}
                      expression={expression}
                      backgroundStyle={backgroundStyle}
                    />
                    <span className="truncate">{shape === 'all' ? 'All shapes' : toLabel(shape)}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" label="All shapes">
                  <span className="flex items-center gap-2">
                    <OptionPreview
                      seed={activeSeed}
                      shape="all"
                      expression={expression}
                      backgroundStyle={backgroundStyle}
                    />
                    All shapes
                  </span>
                </SelectItem>
                {SHAPE_VALUES.map((item) => (
                  <SelectItem key={item} value={item} label={toLabel(item)}>
                    <span className="flex items-center gap-2">
                      <OptionPreview
                        seed={activeSeed}
                        shape={item}
                        expression={expression}
                        backgroundStyle={backgroundStyle}
                      />
                      {toLabel(item)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Expression</span>
            <Select
              value={expression}
              onValueChange={(value) => value && setExpression(value as SquishExpressionChoice)}
            >
              <SelectTrigger aria-label="Expression" className="h-10 border-0 bg-muted px-2.5 text-xs">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <OptionPreview
                      seed={activeSeed}
                      shape={shape}
                      expression={expression}
                      backgroundStyle={backgroundStyle}
                    />
                    <span className="truncate">{expression === 'all' ? 'All expressions' : toLabel(expression)}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" label="All expressions">
                  <span className="flex items-center gap-2">
                    <OptionPreview seed={activeSeed} shape={shape} expression="all" backgroundStyle={backgroundStyle} />
                    All expressions
                  </span>
                </SelectItem>
                {EXPRESSION_VALUES.map((item) => (
                  <SelectItem key={item} value={item} label={toLabel(item)}>
                    <span className="flex items-center gap-2">
                      <OptionPreview
                        seed={activeSeed}
                        shape={shape}
                        expression={item}
                        backgroundStyle={backgroundStyle}
                      />
                      {toLabel(item)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Background style</span>
            <Select
              value={backgroundStyle}
              onValueChange={(value) => value && setBackgroundStyle(value as SquishBackgroundStyleChoice)}
            >
              <SelectTrigger className="h-10 border-0 bg-muted px-2.5 text-xs">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <OptionPreview
                      seed={activeSeed}
                      shape={shape}
                      expression={expression}
                      backgroundStyle={backgroundStyle}
                    />
                    <span className="truncate">
                      {BACKGROUND_SWATCHES.find((item) => item.id === backgroundStyle)?.label ??
                        toLabel(backgroundStyle)}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BACKGROUND_SWATCHES.map((swatch) => (
                  <SelectItem key={swatch.id} value={swatch.id} label={swatch.label}>
                    <span className="flex items-center gap-2">
                      <OptionPreview
                        seed={activeSeed}
                        shape={shape}
                        expression={expression}
                        backgroundStyle={swatch.id}
                      />
                      {swatch.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {view === 'seed' ? (
            <div className="flex flex-col gap-2">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Size</span>
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
              <ToggleGroupItem value="on" className="flex-1">
                On
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Wobble</span>
            <ToggleGroup
              value={[animWobble ? 'on' : 'off']}
              onValueChange={(value) => {
                const next = value[0]
                if (next) setAnimWobble(next === 'on')
              }}
              className="w-full"
            >
              <ToggleGroupItem value="off" className="flex-1">
                Off
              </ToggleGroupItem>
              <ToggleGroupItem value="on" className="flex-1">
                On
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Hover</span>
            <ToggleGroup
              value={[animOnHover ? 'on' : 'off']}
              onValueChange={(value) => {
                const next = value[0]
                if (next) setAnimOnHover(next === 'on')
              }}
              className="w-full"
            >
              <ToggleGroupItem value="off" className="flex-1">
                Off
              </ToggleGroupItem>
              <ToggleGroupItem value="on" className="flex-1">
                On
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Click</span>
            <ToggleGroup
              value={[animOnClick ? 'on' : 'off']}
              onValueChange={(value) => {
                const next = value[0]
                if (next) setAnimOnClick(next === 'on')
              }}
              className="w-full"
            >
              <ToggleGroupItem value="off" className="flex-1">
                Off
              </ToggleGroupItem>
              <ToggleGroupItem value="on" className="flex-1">
                On
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {view === 'video' ? videoActions : null}
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}
