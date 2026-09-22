'use client'

import { cn } from '@/registry/lib/utils'
import * as React from 'react'

const DEFAULT_HEIGHT = 32
const DEFAULT_TICK = 8
const DEFAULT_TRACK_HEIGHT = 48
const MAX_TICKS = 21

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export type SmoothSliderProps = {
  value?: number
  defaultValue?: number
  /** Floor on the reachable value. Positions stay anchored to `[0, max]` — raising `min` shrinks the draggable range without rescaling where every value sits. @default 0 */
  min?: number
  max?: number
  step?: number
  /** Thumb/fill diameter, in px — dots and the track's own height scale with it. @default 32 */
  height?: number
  /** Dots marking each reachable step along the track. @default true */
  showTicks?: boolean
  onValueChange?: (value: number) => void
  /** Accessible name — the control carries no visible one. */
  label?: string
  disabled?: boolean
  className?: string
  /** Overrides the fill bar's background class — ignored if `fillFrom`/`fillVia`/`fillTo` are set. */
  fillClassName?: string
  /** Gradient start color (any CSS color). Takes over from `fillClassName` once set — Tailwind can't compile a class for a color picked at runtime. */
  fillFrom?: string
  fillVia?: string
  fillTo?: string
  /** Overrides the thumb's background. */
  thumbClassName?: string
  /** Whether to animate value changes with a transition. Set to false when controlled via an animation loop or rapid updates. @default true */
  animated?: boolean
}

export function SmoothSlider({
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  height = DEFAULT_HEIGHT,
  showTicks = true,
  onValueChange,
  label = 'Slider',
  disabled = false,
  className,
  fillClassName,
  fillFrom,
  fillVia,
  fillTo,
  thumbClassName,
  animated = true,
}: SmoothSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [dragging, setDragging] = React.useState(false)
  const resolvedValue = value ?? internalValue
  const displayValue = clamp(resolvedValue, min, max)
  const safeStep = step > 0 ? step : 1
  const safeMax = max > 0 ? max : 1

  const ratio = height / DEFAULT_HEIGHT
  const THUMB = height
  const TICK = DEFAULT_TICK * ratio
  const TRACK_HEIGHT = DEFAULT_TRACK_HEIGHT * ratio

  const toFraction = (v: number) => clamp(v, 0, safeMax) / safeMax
  const toLeft = (fraction: number) => `calc(${THUMB / 2}px + ${fraction} * (100% - ${THUMB}px))`

  const fraction = toFraction(displayValue)

  const commit = React.useCallback(
    (next: number) => {
      const quantized = clamp(min + Math.round((next - min) / safeStep) * safeStep, min, max)
      if (value === undefined) setInternalValue(quantized)
      onValueChange?.(quantized)
    },
    [min, max, safeStep, value, onValueChange],
  )

  const rafId = React.useRef(0)
  const pendingClientX = React.useRef<number | null>(null)

  const commitFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || disabled) return
    const usable = Math.max(1, rect.width - THUMB)
    const raw = clamp(clientX - rect.left - THUMB / 2, 0, usable) / usable
    commit(raw * safeMax)
  }

  const scheduleCommitFromClientX = (clientX: number) => {
    pendingClientX.current = clientX
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0
      if (pendingClientX.current !== null) commitFromClientX(pendingClientX.current)
    })
  }

  React.useEffect(() => () => cancelAnimationFrame(rafId.current), [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    commitFromClientX(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    scheduleCommitFromClientX(e.clientX)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    const page = (max - min) / 10
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') commit(resolvedValue + step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') commit(resolvedValue - step)
    else if (e.key === 'PageUp') commit(resolvedValue + page)
    else if (e.key === 'PageDown') commit(resolvedValue - page)
    else if (e.key === 'Home') commit(min)
    else if (e.key === 'End') commit(max)
    else return
    e.preventDefault()
  }

  const ticks = React.useMemo(() => {
    if (!showTicks) return []
    const rawCount = Math.floor((max - min) / safeStep) + 1
    const thinning = rawCount > MAX_TICKS ? Math.ceil(rawCount / MAX_TICKS) : 1
    const tickStep = safeStep * thinning
    const arr: number[] = []
    for (let v = min; v <= max; v += tickStep) arr.push(v)
    return arr
  }, [min, max, safeStep, showTicks])

  return (
    <div className={cn('relative w-full select-none', className)}>
      <div
        ref={trackRef}
        className={cn(
          'relative touch-none cursor-grab active:cursor-grabbing',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        style={{ height: TRACK_HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="pointer-events-none absolute inset-0">
          {showTicks ? (
            <>
              {ticks
                .filter((tick) => toFraction(tick) > 0)
                .map((tick) => (
                  <span
                    key={tick}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/30"
                    style={{ left: toLeft(toFraction(tick)), width: TICK, height: TICK }}
                  />
                ))}
            </>
          ) : (
            <div
              className={cn('absolute w-full bg-muted top-1/2 left-0 -translate-y-1/2 rounded-full')}
              style={{
                height: THUMB,
              }}
            />
          )}
        </div>

        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full',
            dragging || !animated
              ? 'transition-none'
              : 'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            !(fillFrom || fillVia || fillTo) &&
              cn('bg-linear-to-r from-sky-200 via-indigo-200 to-blue-400', fillClassName),
          )}
          style={{
            left: 0,
            height: THUMB,
            width: `calc(${toLeft(fraction)} - ${THUMB - TICK}px)`,
            backgroundImage:
              fillFrom || fillVia || fillTo
                ? `linear-gradient(to right, ${fillFrom ?? '#bae6fd'}, ${fillVia ?? '#e0e7ff'}, ${fillTo ?? '#60a5fa'})`
                : undefined,
          }}
        />

        <div
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={displayValue}
          aria-label={label}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border border-primary/10 outline-none',
            dragging || !animated
              ? 'transition-none'
              : 'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            dragging && 'scale-110',
            thumbClassName,
          )}
          style={{ left: toLeft(fraction), width: THUMB, height: THUMB }}
        />
      </div>
    </div>
  )
}
