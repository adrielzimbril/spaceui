'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

/** Half the thumb, in px. The rail is inset by this at both ends. */
const THUMB_INSET = 14

/**
 * The gap between two marks, shared by every ruler on the page.
 *
 * Widths used to be picked by eye, while ranges have very different step
 * counts. Deriving the width from the number of steps keeps the pitch
 * identical across rulers instead of drifting with the range, and lets the
 * length say what it should: how much range there is.
 */
const MARK_GAP = 6

/** A mark's own width — `w-0.5`. It counts: see `railWidth`. */
const MARK_WIDTH = 2

export type TickSliderProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  /** Every Nth step gets a taller mark. Ignored once `isMajorMark` is set. @default 4 */
  majorEvery?: number
  /** Custom predicate for which values get a taller mark, overrides `majorEvery`. */
  isMajorMark?: (value: number) => boolean
  /** Accessible name — the control carries no visible one. */
  label: string
  /** Suffix on the value readout. Empty for counts, which have no unit. */
  unit?: string
  /** Hides the numeric readout on the right, for a bare ruler. @default true */
  showValue?: boolean
  disabled?: boolean
  /** Overrides the pitch-derived width — e.g. `flex-1` to fill a container. */
  trackClassName?: string
  className?: string
}

/**
 * A scrubber drawn as a row of marks.
 *
 * Every step gets a mark and the major ones get a taller mark, so the ruler
 * reads as a scale rather than as decoration — you can see where the round
 * values sit without a label under each. A real `<input type="range">` sits
 * over the drawing, invisible but focusable, so keyboard control, screen
 * readers and the browser's own value mapping keep working for free.
 */
export function TickSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  majorEvery = 4,
  isMajorMark,
  label,
  unit = '',
  showValue = true,
  disabled = false,
  trackClassName,
  className,
}: TickSliderProps) {
  const marks = React.useMemo(() => {
    const count = Math.round((max - min) / step) + 1
    return Array.from({ length: count }, (_, i) => min + i * step)
  }, [min, max, step])

  const fraction = (value - min) / (max - min)
  const isMajor = React.useCallback(
    (markValue: number, index: number) => (isMajorMark ? isMajorMark(markValue) : index % majorEvery === 0),
    [isMajorMark, majorEvery],
  )

  /*
   * `justify-between` spreads the free space, not the pitch: the first mark
   * starts at the edge and the last one ends at it, so the distance between
   * their left edges is `(inner - MARK_WIDTH) / (marks - 1)`. Leaving the
   * mark's own width out of this makes the pitch drift with the step count.
   */
  const railWidth = (marks.length - 1) * MARK_GAP + MARK_WIDTH + THUMB_INSET * 2

  return (
    <div
      className={cn(
        // rounded-lg to match inputs and buttons sitting either side of it.
        'relative flex h-9 items-center gap-1 rounded-lg bg-muted px-2.5 transition-opacity',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className={cn('relative h-full', trackClassName)} style={trackClassName ? undefined : { width: railWidth }}>
        <div aria-hidden="true" className="flex h-full items-center justify-between px-3.5">
          {marks.map((mark, index) => (
            <span
              key={mark}
              className={cn(
                'w-0.5 rounded-full transition-colors',
                // Both heights stay under the thumb's, so the thumb always reads
                // as the thing on top of the ruler.
                isMajor(mark, index) ? 'h-3.5' : 'h-2',
                mark <= value ? 'bg-foreground' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-4 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/5 bg-white shadow-sm transition-[left] duration-150 ease-out motion-reduce:transition-none"
          style={{
            left: `calc(${THUMB_INSET}px + ${fraction} * (100% - ${THUMB_INSET * 2}px))`,
          }}
        />

        {/*
         * The real control, invisible over the top. Its thumb is sized to match
         * the drawn one so the browser's own value mapping lands where the
         * drawing is, and arrow keys / screen readers keep working for free.
         */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>

      {showValue && (
        <span className="w-10 text-right text-sm text-muted-foreground tabular-nums">
          {value}
          {unit && <span className="ml-0.5 text-xs text-muted-foreground/70">{unit}</span>}
        </span>
      )}
    </div>
  )
}
