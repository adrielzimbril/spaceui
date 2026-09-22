'use client'

import { PreviewLoading } from '@/components/shared/preview-loading'
import { ProximityGrid } from '@/registry/blocks/interactive-grid-hero/interactive-grid-hero-1/proximity-grid'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'
import * as React from 'react'
import { BASE_CANVAS_SIZE, type AspectRatioValue, type InteractionRecorderItem, type ScaleValue } from './types'

export interface InteractionCanvasProps {
  item: InteractionRecorderItem | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component?: React.ComponentType<any>
  demoProps: Record<string, unknown>
  stageRef: React.RefObject<HTMLDivElement | null>
  showGuide?: boolean
  scale?: ScaleValue
  aspectRatio?: AspectRatioValue
  elementZoom?: number
  pan?: { x: number; y: number }
  onPanChange?: (pan: { x: number; y: number }) => void
  isRecording?: boolean
  /** Bumped on reset to remount the interaction so its animation restarts from scratch. */
  resetKey?: number
  /** Target number of sequence cycles to execute before halting */
  targetLoops?: number
  /** Callback fired when targetLoops sequence cycles have completed */
  onSequenceComplete?: () => void
  /** Proximity-reactive grid rendered behind the interaction, same effect as the /community canvas. */
  showBackground?: boolean
}

export function InteractionCanvas({
  item,
  Component,
  demoProps,
  stageRef,
  showGuide = false,
  scale = 1,
  aspectRatio = 1,
  elementZoom = 1,
  pan = { x: 0, y: 0 },
  onPanChange,
  isRecording = false,
  resetKey = 0,
  targetLoops,
  onSequenceComplete,
  showBackground = true,
}: InteractionCanvasProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = React.useState(1)
  const isDraggingRef = React.useRef(false)
  const dragOriginRef = React.useRef({ startX: 0, startY: 0, panX: 0, panY: 0 })
  const [isDragging, setIsDragging] = React.useState(false)

  const outputWidth = BASE_CANVAS_SIZE * aspectRatio
  const outputHeight = BASE_CANVAS_SIZE

  React.useEffect(() => {
    if (!showGuide) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const compute = () => {
      const { width, height } = wrapper.getBoundingClientRect()
      const next = Math.min(width / outputWidth, height / outputHeight)
      setFitScale(next > 0 ? next : 1)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [showGuide, outputWidth, outputHeight])

  const expectedFit = fitScale * 0.8
  const expectedElementFit = elementZoom

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRecording) return
    const target = e.target as HTMLElement | null
    // Let clicks on buttons, inputs or links pass through without initiating a drag
    if (target?.closest('button, input, select, textarea, a, [role="button"], [data-no-drag]')) {
      return
    }
    if (e.button !== 0) return

    isDraggingRef.current = true
    setIsDragging(true)
    dragOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !onPanChange) return
    const divisor = expectedFit || 1
    const dx = (e.clientX - dragOriginRef.current.startX) / divisor
    const dy = (e.clientY - dragOriginRef.current.startY) / divisor
    onPanChange({
      x: Math.round(dragOriginRef.current.panX + dx),
      y: Math.round(dragOriginRef.current.panY + dy),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {}
    }
  }

  const stageContent =
    item && Component ? (
      <div ref={stageRef} className="flex w-full max-w-4xl items-center justify-center">
        <React.Suspense fallback={<PreviewLoading />}>
          <Component key={resetKey} {...demoProps} {...(isRecording ? { targetLoops, onSequenceComplete } : {})} />
        </React.Suspense>
      </div>
    ) : (
      <div ref={stageRef} className="text-sm text-muted-foreground">
        {item ? 'Loading interaction…' : 'Select an interaction from the panel to preview it here.'}
      </div>
    )

  return (
    <div
      ref={wrapperRef}
      className="relative isolate flex size-full items-center justify-center overflow-hidden p-6 sm:p-10 select-none"
    >
      {showBackground && (
        <ProximityGrid
          cellSize={56}
          gap={4}
          radius="rounded"
          proximity={4}
          inset={6}
          className="absolute inset-0 z-0 size-full min-h-0 overflow-hidden select-none"
        />
      )}

      {showGuide ? (
        <div
          className={cn(
            'relative z-10 shrink-0 overflow-hidden',
            !isRecording && 'cursor-grab',
            isDragging && 'cursor-grabbing',
          )}
          style={{ width: outputWidth * expectedFit, height: outputHeight * expectedFit }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => onPanChange?.({ x: 0, y: 0 })}
          title="Drag to reposition element. Double-click to recenter."
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: outputWidth,
              height: outputHeight,
              transform: `scale(${expectedFit})`,
              transformOrigin: 'top left',
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-5"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${expectedElementFit})`,
              }}
            >
              <div className="pointer-events-auto flex flex-col w-full items-center [&>div]:flex-1">{stageContent}</div>
            </div>

            {!isRecording && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 border-4 border-muted bg-background"
              >
                <Badge className="absolute left-2 top-2">
                  {Math.round(outputWidth * scale)}×{Math.round(outputHeight * scale)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'relative z-10 size-full flex items-center justify-center',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => onPanChange?.({ x: 0, y: 0 })}
        >
          <div
            className="pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${expectedElementFit})`,
            }}
          >
            <div className="pointer-events-auto flex flex-col w-full items-center [&>div]:flex-1 [&>div]:w-xl!">
              {stageContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
