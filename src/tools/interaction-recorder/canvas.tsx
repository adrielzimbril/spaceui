'use client'

import { PreviewLoading } from '@/components/shared/preview-loading'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
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
  isRecording?: boolean
  /** Bumped on reset to remount the interaction so its animation restarts from scratch. */
  resetKey?: number
  /** Target number of sequence cycles to execute before halting */
  targetLoops?: number
  /** Callback fired when targetLoops sequence cycles have completed */
  onSequenceComplete?: () => void
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
  isRecording = false,
  resetKey = 0,
  targetLoops,
  onSequenceComplete,
}: InteractionCanvasProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = React.useState(1)

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

  const stageContent =
    item && Component ? (
      <div ref={stageRef} className="flex w-full max-w-xl items-center justify-center">
        <React.Suspense fallback={<PreviewLoading />}>
          <Component
            key={resetKey}
            {...demoProps}
            targetLoops={targetLoops}
            onSequenceComplete={onSequenceComplete}
          />
        </React.Suspense>
      </div>
    ) : (
      <div ref={stageRef} className="text-sm text-muted-foreground">
        {item ? 'Loading interaction…' : 'Select an interaction from the panel to preview it here.'}
      </div>
    )

  const expectedFit = fitScale * 0.8
  const expectedElementFit = elementZoom

  return (
    <div ref={wrapperRef} className="relative flex size-full items-center justify-center overflow-hidden p-6 sm:p-10">
      {showGuide ? (
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ width: outputWidth * expectedFit, height: outputHeight * expectedFit }}
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
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `scale(${expectedElementFit})`,
              }}
            >
              {stageContent}
            </div>
            {!isRecording && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 border-2 border-muted">
                <Badge className="absolute left-2 top-2">
                  {Math.round(outputWidth * scale)}×{Math.round(outputHeight * scale)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ) : (
        stageContent
      )}
    </div>
  )
}
