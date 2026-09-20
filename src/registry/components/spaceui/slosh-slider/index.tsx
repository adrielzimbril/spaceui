'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type SloshSliderProps = {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  height?: number | string
  ring?: boolean
  onValueChange?: (value: number) => void
  corner?: number
  viscosity?: number
  momentum?: number
  tilt?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_CORNER = 13
const MAX_CORNER = 20
const DEFAULT_HEIGHT = 40
const DEFAULT_VISCOSITY = 15
const DEFAULT_MOMENTUM = 55
const DEFAULT_TILT = 45

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export function SloshSlider({
  value,
  defaultValue = 62,
  min = 0,
  max = 100,
  step = 1,
  height,
  ring = true,
  onValueChange,
  corner = DEFAULT_CORNER,
  viscosity = DEFAULT_VISCOSITY,
  momentum = DEFAULT_MOMENTUM,
  tilt = DEFAULT_TILT,
  disabled = false,
  className,
}: SloshSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const fillRef = React.useRef<HTMLDivElement>(null)
  const knobRef = React.useRef<HTMLDivElement>(null)

  // Track prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const span = Math.max(0.001, max - min)
  const toPct = React.useCallback((v: number) => clamp(((v - min) / span) * 100, 0, 100), [min, span])
  const toVal = React.useCallback(
    (pct: number) => {
      const raw = min + (pct / 100) * span
      const quantized = min + Math.round((raw - min) / step) * step
      return clamp(quantized, min, max)
    },
    [min, span, step, max],
  )

  const initialPct = toPct(value ?? defaultValue)
  const targetPct = React.useRef(initialPct)
  const targetVelocity = React.useRef(0)
  const fluidPct = React.useRef(initialPct)
  const fluidVelocity = React.useRef(0)
  const isDragging = React.useRef(false)
  const animFrameId = React.useRef(0)
  const lastSample = React.useRef({ val: initialPct, time: 0 })

  const configRef = React.useRef({
    viscosity,
    momentum,
    tilt,
    reduced: reducedMotion,
  })
  configRef.current = {
    viscosity,
    momentum,
    tilt,
    reduced: reducedMotion,
  }

  const triggerAnimation = React.useRef<() => void>(() => {})

  const syncVisuals = React.useCallback(() => {
    const fill = fillRef.current
    const knob = knobRef.current
    const track = trackRef.current
    if (!fill || !knob || !track) return

    fill.style.width = `${fluidPct.current.toFixed(2)}%`
    knob.style.left = `${targetPct.current.toFixed(2)}%`

    const lean = configRef.current.reduced
      ? 0
      : clamp((configRef.current.tilt / 100) * fluidVelocity.current * 3, -20, 20)

    fill.style.setProperty('--lean', `${lean.toFixed(2)}px`)
    track.setAttribute('aria-valuenow', String(Math.round(toVal(targetPct.current))))
  }, [toVal])

  React.useEffect(() => {
    let lastTime = 0

    const isSettled = () =>
      !isDragging.current &&
      Math.abs(targetVelocity.current) < 0.01 &&
      Math.abs(fluidVelocity.current) < 0.01 &&
      Math.abs(targetPct.current - fluidPct.current) < 0.02

    const physicsStep = (timestamp: number) => {
      const dt = lastTime ? clamp((timestamp - lastTime) / 16.67, 0, 2.5) : 1
      lastTime = timestamp

      const { viscosity: visc, momentum: mom, reduced } = configRef.current

      // Inertia after release
      if (!isDragging.current && targetVelocity.current) {
        targetPct.current += targetVelocity.current * dt
        targetVelocity.current *= Math.pow(0.86 + (mom / 100) * 0.115, dt)
        if (targetPct.current <= 0 || targetPct.current >= 100) {
          targetPct.current = clamp(targetPct.current, 0, 100)
          targetVelocity.current = 0
        }
        if (Math.abs(targetVelocity.current) < 0.01) {
          targetVelocity.current = 0
        }
      }

      // Viscous liquid second-order differential dynamics
      const viscFactor = reduced ? 0 : visc / 100
      if (viscFactor === 0) {
        fluidPct.current = targetPct.current
        fluidVelocity.current = 0
      } else {
        const stiffness = 0.34 - viscFactor * 0.29
        const damping = 0.74 + viscFactor * 0.22

        fluidVelocity.current += (targetPct.current - fluidPct.current) * stiffness * dt
        fluidVelocity.current *= Math.pow(damping, dt)
        fluidPct.current += fluidVelocity.current * dt

        // Fluid boundary splash & bounce reflection
        if (fluidPct.current > 100) {
          fluidPct.current = 100
          fluidVelocity.current = -fluidVelocity.current * 0.42
        } else if (fluidPct.current < 0) {
          fluidPct.current = 0
          fluidVelocity.current = -fluidVelocity.current * 0.42
        }

        if (Math.abs(targetPct.current - fluidPct.current) < 0.02 && Math.abs(fluidVelocity.current) < 0.02) {
          fluidPct.current = targetPct.current
          fluidVelocity.current = 0
        }
      }

      syncVisuals()

      if (isSettled()) {
        animFrameId.current = 0
        lastTime = 0
        onValueChange?.(toVal(targetPct.current))
        return
      }

      animFrameId.current = requestAnimationFrame(physicsStep)
    }

    triggerAnimation.current = () => {
      animFrameId.current ||= requestAnimationFrame(physicsStep)
    }

    syncVisuals()

    return () => {
      cancelAnimationFrame(animFrameId.current)
      animFrameId.current = 0
    }
  }, [syncVisuals, toVal, onValueChange])

  // Sync external controlled value
  React.useEffect(() => {
    if (value === undefined || isDragging.current) return
    const newPct = toPct(value)
    targetPct.current = newPct
    if (configRef.current.viscosity === 0 || configRef.current.reduced) {
      fluidPct.current = newPct
    }
    triggerAnimation.current()
  }, [value, toPct])

  const calcPctFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const scale = rect.width / (el.offsetWidth || rect.width) || 1
    return clamp(((clientX - rect.left) / scale / el.offsetWidth) * 100, 0, 100)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    isDragging.current = true
    targetVelocity.current = 0
    const pct = calcPctFromClientX(e.clientX)
    targetPct.current = pct
    lastSample.current = { val: pct, time: e.timeStamp }

    triggerAnimation.current()
    onValueChange?.(toVal(pct))
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const pct = calcPctFromClientX(e.clientX)
    const dt = Math.max(1, e.timeStamp - lastSample.current.time)

    targetVelocity.current = ((pct - lastSample.current.val) / dt) * 16.67
    lastSample.current = { val: pct, time: e.timeStamp }
    targetPct.current = pct

    triggerAnimation.current()
    onValueChange?.(toVal(pct))
  }

  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    targetVelocity.current = configRef.current.reduced ? 0 : clamp(targetVelocity.current, -6, 6)
    triggerAnimation.current()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    const delta = e.shiftKey ? step * 5 : step
    const currentVal = toVal(targetPct.current)

    let nextVal: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextVal = currentVal + delta
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextVal = currentVal - delta
    } else if (e.key === 'Home') {
      nextVal = min
    } else if (e.key === 'End') {
      nextVal = max
    }

    if (nextVal !== null) {
      e.preventDefault()
      targetVelocity.current = 0
      const nextPct = toPct(clamp(nextVal, min, max))
      targetPct.current = nextPct
      triggerAnimation.current()
      onValueChange?.(toVal(nextPct))
    }
  }

  // Detect height from className if height prop is not explicitly specified
  const heightClassMatch = className?.match(/(?:^|\s)h-(\d+(?:\.\d+)?|\[[^\]]+\])/)
  const classHeightPx = heightClassMatch
    ? heightClassMatch[1].startsWith('[')
      ? parseFloat(heightClassMatch[1].slice(1, -1))
      : Number(heightClassMatch[1]) * 4
    : undefined

  const resolvedHeight = height ?? classHeightPx ?? DEFAULT_HEIGHT
  const numericHeight =
    typeof resolvedHeight === 'number' ? resolvedHeight : parseFloat(String(resolvedHeight)) || DEFAULT_HEIGHT
  const trackHeight = typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight

  const maxCorner = Math.min(MAX_CORNER, numericHeight / 2)
  const clampedCorner = clamp(corner, 0, maxCorner)
  const knobInset = Math.max(2, Math.round(numericHeight * 0.15))
  const knobWidth = numericHeight <= 24 ? 'w-0.75' : 'w-1'

  const trackElement = (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Liquid slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? defaultValue}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative overflow-hidden touch-none outline-none cursor-ew-resize bg-muted',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
      style={{
        borderRadius: clampedCorner,
        height: trackHeight,
      }}
    >
      <div
        ref={fillRef}
        className="absolute inset-y-0 left-0 bg-card"
        style={{
          width: `${initialPct.toFixed(2)}%`,
          clipPath: 'polygon(0 0, calc(100% + var(--lean, 0px)) 0, calc(100% - var(--lean, 0px)) 100%, 0 100%)',
        }}
      />
      <div
        ref={knobRef}
        className={cn('absolute rounded-full z-2 ml-[-0.09375rem] bg-foreground pointer-events-none', knobWidth)}
        style={{
          marginLeft: -1.5,
          top: knobInset,
          bottom: knobInset,
          left: `${initialPct.toFixed(2)}%`,
        }}
      />
    </div>
  )

  if (!ring) {
    return <div className={cn('select-none w-full max-w-85', className)}>{trackElement}</div>
  }

  const ringPad = numericHeight <= 24 ? 'p-[0.09125rem]' : 'p-[0.125rem]'
  const outerRadius = clampedCorner + (numericHeight <= 24 ? 2 : 3)

  return (
    <div className={cn('select-none w-full max-w-85', className)}>
      <div
        className={cn(
          'border-2 border-muted bg-background/50 transition-colors',
          ringPad,
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
        style={{ borderRadius: outerRadius }}
      >
        {trackElement}
      </div>
    </div>
  )
}
