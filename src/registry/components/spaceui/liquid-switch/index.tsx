'use client'

import * as React from 'react'
import { motion, useMotionValue, useVelocity, useSpring, useTransform, animate } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type LiquidSwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  onCheckedChange?: (checked: boolean) => void
  stretch?: number
  speed?: number
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

const MIN_X = 5
const MAX_X = 51
const THRESHOLD = 28
const THUMB_SIZE = 36

export function LiquidSwitch({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  onCheckedChange,
  stretch = 36,
  speed = 50,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Liquid toggle',
}: LiquidSwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const pointerRef = React.useRef<{
    id: number
    startX: number
    grab: number | null
    moved: boolean
  } | null>(null)

  const isControlled = controlledChecked !== undefined
  const isChecked = isControlled ? controlledChecked : internalChecked

  const u = useMotionValue(isChecked ? MAX_X : MIN_X)
  const vel = useVelocity(u)
  const d = useSpring(vel, { stiffness: 320, damping: 40, mass: 0.6 })
  const clampedStretch = Math.min(100, Math.max(0, stretch)) / 100
  const f = (t: number) => 1 + Math.min(0.4, Math.abs(t) / 600) * clampedStretch
  const p = useSpring(isHovered ? 1.035 : 1, { stiffness: 520, damping: 34, mass: 0.6 })
  const scaleX = useTransform([d, p], ([e, t]: number[]) => f(e) * t)
  const scaleY = useTransform([d, p], ([e, t]: number[]) => t / f(e))

  const springConfig = React.useMemo(
    () => ({
      type: 'spring' as const,
      stiffness: 170 - (50 - speed) * 1.1,
      damping: 21.5,
      mass: 0.9,
    }),
    [speed],
  )

  React.useEffect(() => {
    if (isDragging) return
    const controls = animate(u, isChecked ? MAX_X : MIN_X, springConfig)
    return () => controls.stop()
  }, [isChecked, isDragging, u, springConfig])

  const relCoord = (clientX: number) => {
    const el = buttonRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const scale = rect.width / (el.offsetWidth || rect.width) || 1
    return (clientX - rect.left) / scale
  }

  const toggle = React.useCallback(() => {
    const next = !isChecked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
    onCheckedChange?.(next)
  }, [isChecked, isControlled, onChange, onCheckedChange])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    pointerRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      grab: null,
      moved: false,
    }
    setIsDragging(true)
    try {
      buttonRef.current?.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const ptr = pointerRef.current
    if (!ptr || ptr.id !== e.pointerId) return

    const dist = Math.abs(e.clientX - ptr.startX)
    if (dist > 3) {
      ptr.moved = true
    }
    if (!ptr.moved) return

    const x = relCoord(e.clientX)
    if (ptr.grab === null) ptr.grab = x - u.get()
    const nextX = Math.min(MAX_X, Math.max(MIN_X, x - ptr.grab))
    u.set(nextX)

    const nextChecked = nextX > THRESHOLD
    if (nextChecked !== isChecked) {
      if (!isControlled) setInternalChecked(nextChecked)
      onChange?.(nextChecked)
      onCheckedChange?.(nextChecked)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const ptr = pointerRef.current
    if (ptr) {
      pointerRef.current = null
      try {
        buttonRef.current?.releasePointerCapture(e.pointerId)
      } catch {}

      if (!ptr.moved) {
        // Simple click toggles immediately!
        toggle()
      } else {
        // Drag release snaps to nearest position
        const next = u.get() > THRESHOLD
        if (next !== isChecked) {
          if (!isControlled) setInternalChecked(next)
          onChange?.(next)
          onCheckedChange?.(next)
        }
      }
      setIsDragging(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div
      className={cn(
        'relative inline-grid place-items-center select-none p-4',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      style={{ '--space-liq-thumb': `${THUMB_SIZE}px` } as React.CSSProperties}
    >
      <button
        ref={buttonRef}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={ariaLabel}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-23 h-11.5 p-0 rounded-full cursor-pointer touch-none',
          'transition-colors duration-300 outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isChecked ? 'bg-foreground text-background' : 'bg-muted text-foreground',
        )}
      >
        <span className="absolute inset-0 block pointer-events-none" aria-hidden="true">
          <motion.span
            className={cn(
              'absolute top-1/2 left-0 rounded-full',
              'transition-colors duration-300 pointer-events-none',
              isChecked ? 'bg-background' : 'bg-background',
            )}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              marginTop: -THUMB_SIZE / 2,
              x: u,
              scaleX,
              scaleY,
            }}
          />
        </span>
      </button>
    </div>
  )
}
