'use client'

import { nudgeSound, tapSound, tickSound, toggleSound } from '@/components/providers/sound-provider'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { SloshSlider } from '@/registry/components/spaceui/slosh-slider'
import { TickSlider } from '@/registry/components/spaceui/tick-slider'
import { cn } from '@/registry/lib/utils'
import {
  Combobox,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxSeparator,
} from '@/registry/primitives/combobox'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { IconCapture, IconPlayerStop } from '@tabler/icons-react'
import { Avatar } from '@usespaceui/avatars/react'
import { Fragment } from 'react'
import type { SequenceTiming } from './timing'
import {
  ASPECT_RATIOS,
  SCALES,
  type AspectRatioValue,
  type InteractionGroup,
  type InteractionRecorderItem,
  type ScaleValue,
} from './types'

function OffsetSlider({
  label,
  value,
  onChange,
  min = -400,
  max = 400,
  step = 5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  const fraction = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const markCount = 21
  const centerIndex = Math.floor(markCount / 2)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value > 0 ? `+${value}` : value}px</span>
      </div>
      <div className="relative flex h-9 items-center rounded-lg bg-muted px-3 transition-opacity overflow-hidden focus-within:ring-2 focus-within:ring-ring">
        {/* Ruler ticks */}
        <div aria-hidden="true" className="flex h-full w-full items-center justify-between pointer-events-none">
          {Array.from({ length: markCount }).map((_, i) => {
            const isCenter = i === centerIndex
            const isMajor = isCenter || i === 0 || i === markCount - 1 || i % 5 === 0
            const markFrac = i / (markCount - 1)
            const markVal = min + markFrac * (max - min)
            const isActive =
              isCenter ||
              (value > 0 && markVal > 0 && markVal <= value) ||
              (value < 0 && markVal < 0 && markVal >= value)

            return (
              <span
                key={i}
                className={cn(
                  'w-0.5 rounded-full transition-colors',
                  isCenter ? 'h-4' : isMajor ? 'h-3' : 'h-2',
                  isActive ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              />
            )
          })}
        </div>

        {/* Thumb */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-4 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/5 bg-white shadow-sm transition-[left] duration-150 ease-out"
          style={{
            left: `calc(14px + ${fraction} * (100% - 28px))`,
          }}
        />

        {/* Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            tickSound()
            onChange(e.currentTarget.valueAsNumber)
          }}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>
    </div>
  )
}

export interface InteractionControlPanelProps {
  groups: InteractionGroup[]
  selected: InteractionRecorderItem | null
  onSelect: (item: InteractionRecorderItem | null) => void
  scale: ScaleValue
  onScaleChange: (s: ScaleValue) => void
  aspectRatio: AspectRatioValue
  onAspectRatioChange: (r: AspectRatioValue) => void
  elementZoom: number
  onElementZoomChange: (n: number) => void
  loops: number
  onLoopsChange: (n: number) => void
  cycleSeconds: number | null
  withSound: boolean
  onWithSoundChange: (v: boolean) => void
  busy: string | null
  progress: number
  onRecord: () => void
  onStop: () => void
  hasBinds?: boolean
  showTweakpane?: boolean
  onToggleTweakpane?: () => void
  timing?: SequenceTiming
  pan?: { x: number; y: number }
  onPanChange?: (pan: { x: number; y: number }) => void
  onResetFraming?: () => void
  onScreenshot?: () => void
}

export function InteractionControlPanel({
  groups,
  selected,
  onSelect,
  scale,
  onScaleChange,
  aspectRatio,
  onAspectRatioChange,
  elementZoom,
  onElementZoomChange,
  loops,
  onLoopsChange,
  cycleSeconds,
  withSound,
  onWithSoundChange,
  busy,
  progress,
  onRecord,
  onStop,
  onScreenshot,
  hasBinds,
  showTweakpane,
  onToggleTweakpane,
  timing,
  pan,
  onPanChange,
  onResetFraming,
}: InteractionControlPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Interaction Recorder</h2>
          <Badge variant="secondary" size="sm">
            GPU Renderer
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Interaction</span>
            <Combobox
              items={groups}
              value={selected}
              onValueChange={(v) => onSelect(v as InteractionRecorderItem | null)}
              itemToStringLabel={(item: InteractionRecorderItem | null) => item?.title ?? ''}
            >
              <ComboboxInput aria-label="Select an interaction" placeholder="Select an interaction…" showClear />
              <ComboboxPopup>
                <ComboboxEmpty>No interactions found.</ComboboxEmpty>
                <ComboboxList>
                  {(group: InteractionGroup) => (
                    <Fragment key={group.value}>
                      <ComboboxGroup items={group.items}>
                        <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                        <ComboboxCollection>
                          {(item: InteractionRecorderItem) => (
                            <ComboboxItem key={item.name} value={item}>
                              <div className="flex min-w-0 items-center gap-2">
                                <Avatar name={item.name} variant="all" size={22} circle className="shrink-0" />
                                <span className="truncate">{item.title}</span>
                              </div>
                            </ComboboxItem>
                          )}
                        </ComboboxCollection>
                      </ComboboxGroup>
                      <ComboboxSeparator />
                    </Fragment>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Resolution</span>
            <Tabs
              value={String(scale)}
              onValueChange={(val) => {
                if (!val) return
                tapSound()
                onScaleChange(Number(val) as ScaleValue)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 gap-0.5 p-0.5">
                {SCALES.map((item) => (
                  <TabsTab key={item.value} value={String(item.value)} data-space-hover="tick" className="text-xs">
                    {item.value}×
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Aspect Ratio</span>
            <Tabs
              value={String(aspectRatio)}
              onValueChange={(val) => {
                if (!val) return
                tapSound()
                onAspectRatioChange(Number(val) as AspectRatioValue)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 gap-0.5 p-0.5">
                {ASPECT_RATIOS.map((item) => (
                  <TabsTab key={item.value} value={String(item.value)} data-space-hover="tick" className="text-xs">
                    {item.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Framing & Position</span>
              {onResetFraming && ((pan && (pan.x !== 0 || pan.y !== 0)) || elementZoom !== 1.6) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    tapSound()
                    onResetFraming()
                  }}
                  data-space-hover="tick"
                  className="h-5 px-1.5 text-[0.625rem] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Element Zoom */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Zoom</span>
                <span className="text-muted-foreground tabular-nums">{elementZoom.toFixed(1)}×</span>
              </div>
              <TickSlider
                label="Element zoom"
                value={elementZoom}
                onChange={(next) => {
                  tickSound()
                  onElementZoomChange(next)
                }}
                min={0.5}
                max={3}
                step={0.1}
                showValue={false}
              />
            </div>

            {/* Position X */}
            <OffsetSlider
              label="Position X"
              value={pan?.x ?? 0}
              onChange={(next) => onPanChange?.({ x: next, y: pan?.y ?? 0 })}
              min={-500}
              max={500}
              step={5}
            />

            {/* Position Y */}
            <OffsetSlider
              label="Position Y"
              value={pan?.y ?? 0}
              onChange={(next) => onPanChange?.({ x: pan?.x ?? 0, y: next })}
              min={-400}
              max={400}
              step={5}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Sound</span>
            <Tabs
              value={withSound ? 'on' : 'off'}
              onValueChange={(val) => {
                if (!val) return
                const next = val === 'on'
                toggleSound(next ? 'on' : 'off')
                onWithSoundChange(next)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 gap-0.5 p-0.5">
                <TabsTab value="off" data-space-hover="tick" className="text-xs">
                  Off
                </TabsTab>
                <TabsTab value="on" data-space-hover="tick" className="text-xs">
                  On
                </TabsTab>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Loop Sequence</span>
              {timing && (
                <span className="text-[0.6875rem] font-semibold text-foreground tabular-nums">
                  {timing.totalDurationSeconds.toFixed(1)}s clip
                </span>
              )}
            </div>

            {timing && (
              <div className="flex flex-col gap-1 [corner-shape:superellipse(1.25)] rounded-xl bg-muted p-2.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="truncate text-foreground font-semibold">{timing.scopeLabel}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums text-[0.6875rem]">
                    {timing.unitDurationSeconds.toFixed(1)}s
                  </span>
                </div>
                <span className="text-[0.6875rem] truncate">{timing.detailLabel}</span>
              </div>
            )}

            <TickSlider
              label="Loop count"
              value={loops}
              onChange={(next) => {
                nudgeSound('up')
                onLoopsChange(next)
              }}
              min={1}
              max={5}
              step={1}
              unit="×"
            />
          </div>

          {busy && (
            <div className="flex flex-col gap-2 rounded-xl bg-muted p-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="truncate text-foreground">{busy}</span>
                <span className="text-foreground">{progress}%</span>
              </div>
              <SloshSlider
                value={progress}
                min={0}
                max={100}
                height={30}
                corner={4}
                ring
                disabled
                className="[&>div]:opacity-100!"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              disabled={!selected || Boolean(busy)}
              onClick={onRecord}
              data-space-hover="tick"
              size="sm"
              className="flex-1 rounded-xl font-semibold gap-2 cursor-pointer"
            >
              <span>{busy ? 'Recording…' : 'Record'}</span>
            </Button>
            {onScreenshot && (
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                disabled={!selected || Boolean(busy)}
                onClick={onScreenshot}
                data-space-hover="tick"
                pointer
                title="Screenshot (PNG)"
              >
                <IconCapture className="size-4" />
              </Button>
            )}
            {busy && (
              <Button
                type="button"
                variant="outline"
                onClick={onStop}
                data-space-hover="tick"
                size="icon-lg"
                pointer
                title="Stop and save what's recorded so far"
              >
                <IconPlayerStop className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
