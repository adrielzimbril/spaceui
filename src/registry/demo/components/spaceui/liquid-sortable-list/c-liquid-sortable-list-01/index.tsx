'use client'

import * as React from 'react'
import { LiquidSortableList } from '@/registry/components/spaceui/liquid-sortable-list'

export interface LiquidSortableDemoProps {
  corner?: number
}

export default function Demo({ corner = 20 }: LiquidSortableDemoProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
      <LiquidSortableList corner={Number(corner)} />
    </div>
  )
}
