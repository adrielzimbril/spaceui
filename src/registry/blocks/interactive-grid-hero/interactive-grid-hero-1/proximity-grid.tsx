'use client'

import * as React from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type GridCellRadius = 'square' | 'rounded' | 'full'

export interface ProximityGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of each square cell in pixels. @default 64 */
  cellSize?: number
  /** Gap between cells in pixels. @default 4 */
  gap?: number
  /** Corner radius style for cells upon interaction. @default "rounded" */
  radius?: GridCellRadius
  /** Proximity response radius measured in cell units. @default 4 */
  proximity?: number
  /** Inset percentage applied to active cell. @default 6 */
  inset?: number
  /** Whether the grid responds to cursor interaction. @default true */
  interactive?: boolean
  /** External MotionValue for pointer X coordinate */
  pointerX?: MotionValue<number>
  /** External MotionValue for pointer Y coordinate */
  pointerY?: MotionValue<number>
  /** External MotionValue for active interaction */
  pointerActive?: MotionValue<number>
}

interface GridMetrics {
  columns: number
  rows: number
  cellSize: number
}

interface GridCellProps {
  centerX: number
  centerY: number
  radius: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  pointerActive: MotionValue<number>
  maxCornerRadius: number
  inset: number
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

const GridCell = React.memo(function GridCell({
  centerX,
  centerY,
  radius,
  pointerX,
  pointerY,
  pointerActive,
  maxCornerRadius,
  inset,
}: GridCellProps) {
  const influence = useTransform(() => {
    const px = pointerX.get()
    const py = pointerY.get()
    const active = pointerActive.get()
    if (active <= 0) return 0

    const dist = Math.hypot(px - centerX, py - centerY)
    if (dist >= radius) return 0

    const proximity = 1 - dist / radius
    return smoothstep(proximity) * active
  })

  // Always output valid inset(...) to avoid GPU compositing layer caching bugs
  const clipPath = useTransform(
    influence,
    (val) => `inset(${val * inset}% round ${val * maxCornerRadius}px)`,
  )

  const opacity = useTransform(influence, [0, 1], [0.45, 1])

  return (
    <motion.div
      className="bg-muted transform-gpu will-change-[clip-path,opacity]"
      style={{ clipPath, opacity }}
    />
  )
})

interface GridBoardProps {
  cells: Array<{ id: string; centerX: number; centerY: number }>
  gap: number
  metrics: GridMetrics
  responseRadius: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  activeMotionValue: MotionValue<number>
  maxCornerRadius: number
  inset: number
}

const GridBoard = React.memo(function GridBoard({
  cells,
  gap,
  metrics,
  responseRadius,
  pointerX,
  pointerY,
  activeMotionValue,
  maxCornerRadius,
  inset,
}: GridBoardProps) {
  return (
    <div
      className="absolute inset-0 grid content-start pointer-events-none"
      style={{
        gap: `${gap}px`,
        gridAutoRows: `${metrics.cellSize}px`,
        gridTemplateColumns: `repeat(${metrics.columns}, ${metrics.cellSize}px)`,
      }}
      aria-hidden="true"
    >
      {cells.map((cell) => (
        <GridCell
          key={cell.id}
          centerX={cell.centerX}
          centerY={cell.centerY}
          radius={responseRadius}
          pointerX={pointerX}
          pointerY={pointerY}
          pointerActive={activeMotionValue}
          maxCornerRadius={maxCornerRadius}
          inset={inset}
        />
      ))}
    </div>
  )
})

export const ProximityGrid: React.FC<ProximityGridProps> = ({
  children,
  cellSize: targetCellSize = 64,
  gap = 4,
  radius = 'rounded',
  proximity = 4,
  inset = 6,
  interactive = true,
  pointerX: externalPointerX,
  pointerY: externalPointerY,
  pointerActive: externalPointerActive,
  className,
  ...props
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isReducedMotion = Boolean(useReducedMotion())

  const internalPointerX = useMotionValue(-1000)
  const internalPointerY = useMotionValue(-1000)
  const internalRawActive = useMotionValue(0)

  const internalSmoothActive = useSpring(internalRawActive, {
    stiffness: 480,
    damping: 36,
    mass: 0.8,
  })

  const pointerX = externalPointerX ?? internalPointerX
  const pointerY = externalPointerY ?? internalPointerY
  const activeMotionValue =
    externalPointerActive ?? (isReducedMotion ? internalRawActive : internalSmoothActive)

  const [metrics, setMetrics] = React.useState<GridMetrics>({
    columns: 12,
    rows: 8,
    cellSize: targetCellSize,
  })

  const maxCornerRadius = React.useMemo(() => {
    if (radius === 'square') return 0
    if (radius === 'full') return 9999
    // rounded: proportional to cell size
    return Math.round(targetCellSize * 0.35)
  }, [radius, targetCellSize])

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateGrid = () => {
      const rect = el.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)

      const columns = Math.max(1, Math.ceil((w + gap) / (targetCellSize + gap)))
      const actualCellSize = Math.max(1, (w - gap * (columns - 1)) / columns)
      const rows = Math.max(1, Math.ceil((h + gap) / (actualCellSize + gap)))

      setMetrics({ columns, rows, cellSize: actualCellSize })
    }

    const ro = new ResizeObserver(updateGrid)
    ro.observe(el)
    updateGrid()

    return () => ro.disconnect()
  }, [targetCellSize, gap])

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || isReducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      pointerX.set(e.clientX - rect.left)
      pointerY.set(e.clientY - rect.top)
      if (externalPointerActive) {
        externalPointerActive.set(1)
      } else {
        internalRawActive.set(1)
      }
    },
    [interactive, isReducedMotion, pointerX, pointerY, externalPointerActive, internalRawActive],
  )

  const handlePointerLeave = React.useCallback(() => {
    if (externalPointerActive) {
      externalPointerActive.set(0)
    } else {
      internalRawActive.set(0)
    }
  }, [externalPointerActive, internalRawActive])

  const totalCells = metrics.columns * metrics.rows
  const responseRadius = metrics.cellSize * Math.max(1, proximity)

  const cells = React.useMemo(() => {
    return Array.from({ length: totalCells }, (_, i) => {
      const col = i % metrics.columns
      const row = Math.floor(i / metrics.columns)
      return {
        id: `cell_${row}_${col}`,
        centerX: (col + 0.5) * metrics.cellSize,
        centerY: (row + 0.5) * metrics.cellSize,
      }
    })
  }, [totalCells, metrics.columns, metrics.cellSize])

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn('relative w-full h-full min-h-125 overflow-hidden bg-background select-none', className)}
      {...props}
    >
      <GridBoard
        cells={cells}
        gap={gap}
        metrics={metrics}
        responseRadius={responseRadius}
        pointerX={pointerX}
        pointerY={pointerY}
        activeMotionValue={activeMotionValue}
        maxCornerRadius={maxCornerRadius}
        inset={inset}
      />
      {children}
    </div>
  )
}
