'use client'

import * as React from 'react'
import { ProximityGrid, type GridCellRadius } from './proximity-grid'
import { cn } from '@/registry/lib/utils'

export interface InteractiveGridHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  cellSize?: number
  radius?: GridCellRadius
  gap?: number
  proximity?: number
  inset?: number
}

export default function InteractiveGridHero({
  cellSize = 64,
  radius = 'rounded',
  gap = 4,
  proximity = 4,
  inset = 6,
  className,
  ...props
}: InteractiveGridHeroProps) {
  return (
    <div className={cn('relative w-full h-full min-h-130 overflow-hidden', className)} {...props}>
      <ProximityGrid
        cellSize={Number(cellSize)}
        radius={radius}
        gap={Number(gap)}
        proximity={Number(proximity)}
        inset={Number(inset)}
        className="w-full h-dvh min-h-130"
      />
    </div>
  )
}
