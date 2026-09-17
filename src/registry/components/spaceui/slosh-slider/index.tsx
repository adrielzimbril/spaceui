'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type SloshSliderProps = {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  corner?: number
  viscosity?: number
  momentum?: number
  tilt?: number
  disabled?: boolean
  className?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function snap(n: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((n - min) / step) * step
  return clamp(snapped, min, max)
}

export function SloshSlider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  corner = 13,
  viscosity = 15,
  momentum = 55,
  tilt = 45,
  disabled = false,
  className,
}: SloshSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const display = React.useRef(value ?? defaultValue)
  const velocity = React.useRef(0)
  const lastX = React.useRef(0)
  const lastT = React.useRef(0)
  const [shown, setShown] = React.useState(value ?? defaultValue)
  const shownRef = React.useRef(shown)
  shownRef.current = shown
  const target = value ?? shown

  const range = Math.max(max - min, 0.0001)
  const visc = 1 - clamp(viscosity, 0, 100) / 140
  const coast = clamp(momentum, 0, 100) / 100
  const lean = (clamp(tilt, 0, 100) / 100) * 18

  const valueFromX = React.useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return target
      const rect = el.getBoundingClientRect()
      const t = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1)
      return snap(min + t * range, min, max, step)
    },
    [max, min, range, step, target],
  )

  React.useEffect(() => {
    if (dragging.current) return
    display.current = target
    setShown(target)
  }, [target])

  React.useEffect(() => {
    let frame = 0
    const tick = () => {
      if (!dragging.current && Math.abs(velocity.current) > 0.02) {
        const next = snap(shownRef.current + velocity.current * coast * range * 0.04, min, max, step)
        velocity.current *= visc * 0.92
        if (next !== shownRef.current) {
          shownRef.current = next
          display.current = next
          setShown(next)
          onValueChange?.(next)
        }
      } else if (!dragging.current) {
        velocity.current = 0
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [coast, max, min, onValueChange, range, step, visc])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragging.current = true
    lastX.current = event.clientX
    lastT.current = performance.now()
    const next = valueFromX(event.clientX)
    velocity.current = 0
    display.current = next
    shownRef.current = next
    setShown(next)
    onValueChange?.(next)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const now = performance.now()
    const dt = Math.max(now - lastT.current, 8)
    const next = valueFromX(event.clientX)
    velocity.current = ((next - shownRef.current) / dt) * 16
    lastX.current = event.clientX
    lastT.current = now
    display.current = next
    shownRef.current = next
    setShown(next)
    onValueChange?.(next)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const pct = ((shown - min) / range) * 100
  const skew = clamp(velocity.current * lean, -lean, lean)

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={shown}
      aria-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => {
        if (disabled) return
        const dir =
          event.key === 'ArrowRight' || event.key === 'ArrowUp'
            ? 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
              ? -1
              : 0
        if (!dir) return
        event.preventDefault()
        const next = snap(shown + dir * step, min, max, step)
        setShown(next)
        shownRef.current = next
        onValueChange?.(next)
      }}
      className={cn(
        'relative h-3 w-full cursor-pointer touch-none select-none rounded-full bg-muted',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <div
        className="absolute inset-y-0 inset-s-0 bg-foreground will-change-transform"
        style={{
          width: `${pct}%`,
          borderRadius: corner,
          transform: `skewX(${-skew}deg)`,
          transformOrigin: 'left center',
        }}
      />
    </div>
  )
}
