'use client'

import { Fragment } from 'react'
import { Avatar } from '@usespaceui/avatars/react'
import { IconPlayerStop } from '@tabler/icons-react'
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
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { TickSlider } from '@/registry/components/spaceui/tick-slider'
import { SloshSlider } from '@/registry/components/spaceui/slosh-slider'
import { nudgeSound, tapSound, tickSound, toggleSound } from '@/components/providers/sound-provider'
import {
  ASPECT_RATIOS,
  SCALES,
  type AspectRatioValue,
  type InteractionGroup,
  type InteractionRecorderItem,
  type ScaleValue,
} from './types'

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
}: InteractionControlPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex h-10 shrink-0 items-center px-3">
        <h2 className="text-xs font-semibold">Interaction Recorder</h2>
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Element Zoom</span>
              <span className="text-xs text-muted-foreground">{elementZoom.toFixed(1)}×</span>
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
            {withSound && (
              <p className="text-[11px] text-muted-foreground">
                The browser will ask which tab to share — pick this one and enable &quot;Share tab audio&quot;.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Loop</span>
            <p className="text-xs text-muted-foreground">
              {cycleSeconds != null
                ? `Full flow: ${cycleSeconds.toFixed(1)}s (auto-detected) · total clip ${(cycleSeconds * loops).toFixed(1)}s`
                : `No auto-detected cycle, defaulting to 10s · total clip ${(10 * loops).toFixed(1)}s`}
            </p>
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
              full
              className="flex-1 rounded-xl font-semibold"
            >
              {busy ? 'Recording…' : 'Record'}
            </Button>
            {busy && (
              <Button
                type="button"
                variant="outline"
                onClick={onStop}
                data-space-hover="tick"
                className="gap-2 rounded-xl"
                size="sm"
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
