'use client'

import { useMemo, useRef, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconChevronRight, IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { Button } from '@/registry/primitives/button'
import { Toggle } from '@/registry/primitives/toggle'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { cn } from '@/registry/lib/utils'
import type { SequenceStep } from './squish-video'

const PX_PER_SEC = 96
const ROW_H = 36
const LABEL_CLASS = 'w-32 md:w-48'
const MIN_SEC = 0.5
const MAX_SEC = 10

function formatTime(seconds: number) {
  const whole = Math.max(0, seconds)
  const m = Math.floor(whole / 60)
  const s = whole % 60
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`
}

function ShotRow({
  step,
  index,
  start,
  timelineWidth,
  selected,
  expanded,
  onSelect,
  onToggle,
  onUpdate,
  onRemove,
}: {
  step: SequenceStep
  index: number
  start: number
  timelineWidth: number
  selected: boolean
  expanded: boolean
  onSelect: () => void
  onToggle: () => void
  onUpdate: (patch: Partial<SequenceStep>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const dragStart = useRef({ x: 0, duration: 0 })
  const tracks = [
    { key: 'animate' as const, label: 'Motion', on: step.animate },
    { key: 'wobble' as const, label: 'Wobble', on: step.wobble },
    { key: 'blink' as const, label: 'Blink', on: step.blink },
  ]
  const barWidth = Math.max(48, step.durationSec * PX_PER_SEC)

  const onResizePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragStart.current = { x: event.clientX, duration: step.durationSec }
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (next: PointerEvent) => {
      const delta = (next.clientX - dragStart.current.x) / PX_PER_SEC
      const duration = Math.min(MAX_SEC, Math.max(MIN_SEC, Math.round((dragStart.current.duration + delta) * 2) / 2))
      onUpdate({ durationSec: duration })
    }
    const up = (next: PointerEvent) => {
      target.releasePointerCapture(next.pointerId)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('transition-colors duration-200', isDragging && 'z-10', selected && 'bg-muted/60')}
    >
      <div className="flex" style={{ height: ROW_H }}>
        <div
          className={`sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-border bg-background px-1.5 md:px-2 ${LABEL_CLASS}`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground"
            {...attributes}
            {...listeners}
            aria-label="Reorder"
          >
            <IconGripVertical className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground"
            onClick={onToggle}
            aria-label="Toggle tracks"
          >
            <IconChevronRight className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-90')} />
          </Button>
          <Squishmoji
            seed={step.seed}
            size={22}
            shape={step.shape}
            expression={step.expression}
            backgroundStyle={step.backgroundStyle}
            animate={false}
            frozenAt={0}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onSelect()
              onToggle()
            }}
            className="h-auto min-w-0 flex-1 justify-start truncate px-1 text-left text-xs font-medium"
          >
            Shot {index + 1}
          </Button>
          <span className="text-[0.625rem] tabular-nums text-muted-foreground">{step.durationSec.toFixed(1)}s</span>
        </div>
        <div className="relative overflow-hidden" style={{ width: timelineWidth, minWidth: timelineWidth }}>
          <Button
            type="button"
            variant="ghost"
            onClick={onSelect}
            className={cn(
              'absolute top-1.5 h-6 items-center rounded-md pr-3 pl-2 text-left text-[0.625rem] font-medium transition-[width,left] duration-150 hover:bg-muted',
              selected ? 'bg-primary text-primary-foreground hover:bg-primary' : 'bg-muted text-foreground',
            )}
            style={{ left: start * PX_PER_SEC, width: barWidth }}
          >
            Shot {index + 1}
            <span
              aria-label="Resize duration"
              onPointerDown={onResizePointerDown}
              className="absolute top-0 right-0 h-full w-2 cursor-ew-resize rounded-r-md"
            />
          </Button>
        </div>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {tracks.map((track) => (
            <div key={track.key} className="flex" style={{ height: ROW_H }}>
              <div
                className={`sticky left-0 z-10 flex shrink-0 items-center justify-between border-r border-border bg-background px-2 md:px-3 ${LABEL_CLASS}`}
              >
                <span className="text-[0.625rem] text-muted-foreground">{track.label}</span>
                <Toggle
                  pressed={track.on}
                  onPressedChange={(pressed) => onUpdate({ [track.key]: pressed })}
                  size="sm"
                  className={cn(
                    'h-5 min-w-0 px-1.5 text-[0.5625rem] font-medium',
                    track.on
                      ? 'bg-primary text-primary-foreground data-pressed:bg-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {track.on ? 'On' : 'Off'}
                </Toggle>
              </div>
              <div className="relative" style={{ width: timelineWidth, minWidth: timelineWidth }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onUpdate({ [track.key]: !track.on })}
                  className={cn(
                    'absolute top-2 h-4 min-w-0 rounded-sm p-0 transition-[width,left,background-color] duration-150',
                    track.on ? 'bg-primary/70 hover:bg-primary/70' : 'bg-muted hover:bg-muted',
                  )}
                  style={{ left: start * PX_PER_SEC, width: barWidth }}
                />
              </div>
            </div>
          ))}
          <div className={`flex h-8 items-center border-t border-border px-2 md:px-3 ${LABEL_CLASS}`}>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-auto gap-1 px-0 text-[0.625rem] text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <IconTrash className="size-3" /> Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SequenceTimeline({
  sequence,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  onExport,
  onExportJson,
  onImportJson,
}: {
  sequence: SequenceStep[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<SequenceStep>) => void
  onRemove: (id: string) => void
  onReorder: (steps: SequenceStep[]) => void
  onExport: () => void
  onExportJson?: () => void
  onImportJson?: (file: File) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<string[]>([])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const total = sequence.reduce((sum, step) => sum + step.durationSec, 0)
  const starts = useMemo(() => {
    let cursor = 0
    return sequence.map((step) => {
      const start = cursor
      cursor += step.durationSec
      return start
    })
  }, [sequence])
  const ticks = Math.max(6, Math.ceil(total) + 2)
  const timelineWidth = ticks * PX_PER_SEC

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sequence.findIndex((step) => step.id === active.id)
    const newIndex = sequence.findIndex((step) => step.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(sequence, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b border-border px-3 py-2 md:h-10 md:flex-row md:items-center md:justify-between md:gap-2 md:py-0">
        <span className="w-fit rounded-md bg-muted px-2 py-0.5 text-[0.625rem] font-medium tabular-nums">
          {formatTime(total)}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="hidden px-2 text-[0.625rem] font-medium text-muted-foreground md:inline">Config</span>
          <div className="hidden h-4 w-px bg-border md:block" />
          {onImportJson ? (
            <Button type="button" size="xs" variant="secondary" className="relative">
              Import
              <input
                type="file"
                accept="application/json"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onImportJson(file)
                  event.target.value = ''
                }}
              />
            </Button>
          ) : null}
          {onExportJson ? (
            <Button type="button" size="xs" variant="secondary" disabled={sequence.length === 0} onClick={onExportJson}>
              Export
            </Button>
          ) : null}
          <Button type="button" size="xs" variant="secondary" onClick={onAdd}>
            <IconPlus className="size-3.5" /> Add shot
          </Button>
          <Button type="button" size="xs" disabled={sequence.length === 0} onClick={onExport}>
            Render
          </Button>
        </div>
      </div>
      <ScrollArea className="h-40 md:h-64" data-lenis-prevent="true" scrollbarGutter clampContentMinWidth={false}>
        <div className="flex min-w-full flex-col">
          <div className="flex border-b border-border" style={{ height: 28 }}>
            <div className={`sticky left-0 z-10 shrink-0 border-r border-border bg-background ${LABEL_CLASS}`} />
            <div className="flex h-full" style={{ width: timelineWidth }}>
              {Array.from({ length: ticks }, (_, index) => (
                <div
                  key={index}
                  className="shrink-0 border-l border-border/70 pl-1 text-[0.5625rem] tabular-nums text-muted-foreground"
                  style={{ width: PX_PER_SEC }}
                >
                  {index}s
                </div>
              ))}
            </div>
          </div>
          {sequence.length === 0 ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Add a shot to start the timeline.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sequence.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                {sequence.map((step, index) => (
                  <ShotRow
                    key={step.id}
                    step={step}
                    index={index}
                    start={starts[index] ?? 0}
                    timelineWidth={timelineWidth}
                    selected={selectedId === step.id}
                    expanded={openIds.includes(step.id)}
                    onSelect={() => setSelectedId(step.id)}
                    onToggle={() => setOpenIds((ids) => (ids[0] === step.id ? [] : [step.id]))}
                    onUpdate={(patch) => onUpdate(step.id, patch)}
                    onRemove={() => onRemove(step.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={onAdd}
            className={`h-9 justify-start gap-1 rounded-none border-t border-border px-3 text-left text-[0.625rem] text-muted-foreground ${LABEL_CLASS}`}
          >
            <IconPlus className="size-3" /> Add shot
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
