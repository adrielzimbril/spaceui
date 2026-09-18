'use client'

import * as React from 'react'
import { motion, motionValue, useMotionValue, useTransform, animate, type MotionValue } from 'motion/react'
import { Avatar } from '@usespaceui/avatars/react'
import { cn } from '@/registry/lib/utils'

export type SortableMember = {
  id: string
  name: string
  role?: string
  here?: boolean
  tint?: string
}

export const DEFAULT_SORTABLE_MEMBERS: SortableMember[] = [
  { id: 'guillermo', name: 'Guillermo Rauch', role: 'Frontend Architect', here: true, tint: '#3b82f6' },
  { id: 'marc', name: 'Marc Lou', role: 'Product Builder', here: false, tint: '#8b5cf6' },
  { id: 'pieter', name: 'Pieter Levels', role: 'Autonomous Founder', here: true, tint: '#0ea5e9' },
  { id: 'jony', name: 'Jony Ive', role: 'Design Lead', here: false, tint: '#10b981' },
]

export type LiquidSortableListProps = {
  items?: SortableMember[]
  onOrderChange?: (items: SortableMember[]) => void
  give?: number
  lean?: number
  step?: number
  corner?: number
  className?: string
}

const STEP_HEIGHT = 50
const PILL_WIDTH = 220
const MAX_CORNER = 22

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

const springTransition = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 28,
  mass: 0.8,
}

export function LiquidSortableList({
  items = DEFAULT_SORTABLE_MEMBERS,
  onOrderChange,
  give = 50,
  lean = 18,
  step = STEP_HEIGHT,
  corner = MAX_CORNER,
  className,
}: LiquidSortableListProps) {
  const [currentOrder, setCurrentOrder] = React.useState<number[]>(() => items.map((_, i) => i))
  const [activeDragIndex, setActiveDragIndex] = React.useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const dragPointerRef = React.useRef<{
    id: number
    y: number
    slot: number
    last: number
    at: number
  } | null>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)

  // Motion values for item vertical positions
  const yValues = React.useMemo(() => items.map((_, i) => i * step), [items, step])
  const motionYs = React.useRef<MotionValue<number>[]>([])
  if (motionYs.current.length !== items.length) {
    motionYs.current = items.map((_, i) => motionValue(i * step))
  }

  // S = momentum/velocity
  const momentum = useMotionValue(0)
  const stretch = useTransform(() => 1 + (give / 100) * Math.abs(momentum.get()) * 0.12)
  const squeeze = useTransform(() => 1 / stretch.get())
  const tilt = useTransform(() => (lean / 100) * momentum.get() * 2.6)

  React.useEffect(() => {
    currentOrder.forEach((itemIdx, slotIdx) => {
      if (itemIdx !== activeDragIndex && motionYs.current[itemIdx]) {
        animate(motionYs.current[itemIdx], slotIdx * step, springTransition)
      }
    })
  }, [currentOrder, step, activeDragIndex])

  const handlePointerDown = (itemIdx: number) => (e: React.PointerEvent) => {
    if (!dragPointerRef.current) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      dragPointerRef.current = {
        id: itemIdx,
        y: e.clientY,
        slot: currentOrder.indexOf(itemIdx),
        last: e.clientY,
        at: performance.now(),
      }
      setActiveDragIndex(itemIdx)
      momentum.set(0)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const ptr = dragPointerRef.current
    if (!ptr) return
    const stage = stageRef.current
    const scale = (stage && stage.getBoundingClientRect().width / (stage.offsetWidth || 1)) || 1
    const deltaY = (e.clientY - ptr.y) / scale
    motionYs.current[ptr.id].set(ptr.slot * step + deltaY)

    const now = performance.now()
    const dt = Math.max(8, now - ptr.at)
    momentum.set(clamp(((e.clientY - ptr.last) / scale / dt) * 16, -3, 3))
    ptr.last = e.clientY
    ptr.at = now

    const targetSlot = clamp(Math.round((ptr.slot * step + deltaY) / step), 0, items.length - 1)
    if (targetSlot !== currentOrder.indexOf(ptr.id)) {
      const nextOrder = currentOrder.filter((id) => id !== ptr.id)
      nextOrder.splice(targetSlot, 0, ptr.id)
      setCurrentOrder(nextOrder)
      onOrderChange?.(nextOrder.map((idx) => items[idx]))
    }
  }

  const handlePointerUp = () => {
    if (dragPointerRef.current) {
      dragPointerRef.current = null
      setActiveDragIndex(null)
      momentum.set(0)
    }
  }

  const totalHeight = items.length * step + 12
  const borderRadius = clamp(corner, 0, MAX_CORNER)

  return (
    <div
      ref={stageRef}
      className={cn('relative select-none touch-none inline-block', className)}
      style={
        {
          width: PILL_WIDTH + 24,
          height: totalHeight,
          '--pill': `${PILL_WIDTH}px`,
          '--arr-r': `${borderRadius}px`,
        } as React.CSSProperties
      }
    >
      {/* Embedded SVG filter for gooey liquid melting */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id="arr-goo" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="smear" />
            <feColorMatrix in="smear" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -14" />
          </filter>
        </defs>
      </svg>

      {/* Blobs liquid deformation layer */}
      <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#arr-goo)' }} aria-hidden="true">
        {items.map((item, idx) => {
          const isDragging = activeDragIndex === idx
          const isHovered = !isDragging && hoveredIndex === idx

          return (
            <motion.span
              key={item.id}
              className="absolute left-1/2 top-0 h-11"
              style={{
                width: PILL_WIDTH,
                marginLeft: -PILL_WIDTH / 2,
                y: motionYs.current[idx],
              }}
              animate={{
                width: isDragging ? PILL_WIDTH + 8 : PILL_WIDTH,
                marginLeft: isDragging ? -(PILL_WIDTH + 8) / 2 : -PILL_WIDTH / 2,
              }}
              transition={springTransition}
            >
              <motion.span
                className={cn(
                  'block w-full h-full rounded-2xl transition-colors duration-200',
                  isDragging ? 'bg-accent text-accent-foreground' : isHovered ? 'bg-muted' : 'bg-muted/80',
                )}
                style={
                  isDragging
                    ? ({
                        scaleX: squeeze,
                        scaleY: stretch,
                        skewY: tilt,
                      } as any)
                    : undefined
                }
              />
            </motion.span>
          )
        })}
      </div>

      {/* Foreground interactive rows (text, avatars, indicator) */}
      <div className="absolute inset-0">
        {items.map((item, idx) => {
          const isDragging = activeDragIndex === idx

          return (
            <motion.div
              key={item.id}
              style={{
                y: motionYs.current[idx],
                width: PILL_WIDTH,
                marginLeft: -PILL_WIDTH / 2,
              }}
              className={cn(
                'absolute left-1/2 top-0 h-11 px-3 flex items-center cursor-grab active:cursor-grabbing select-none',
                isDragging ? 'z-20 text-foreground' : 'z-10 text-muted-foreground',
              )}
              onPointerDown={handlePointerDown(idx)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onLostPointerCapture={handlePointerUp}
              onPointerEnter={() => setHoveredIndex(idx)}
              onPointerLeave={() => setHoveredIndex((cur) => (cur === idx ? null : cur))}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0 rounded-full ring-1 ring-border/50 overflow-hidden">
                  <Avatar name={item.name} variant="all" size={30} circle />
                  {item.here && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-foreground truncate leading-tight">{item.name}</span>
                  {item.role && (
                    <span className="text-[10px] text-muted-foreground truncate leading-tight">{item.role}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
