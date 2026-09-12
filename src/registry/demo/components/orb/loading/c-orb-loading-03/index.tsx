'use client'

import * as React from 'react'
import { LoadingOrb } from '@/registry/components/orb/loading'

const TAILWIND_COLORS = [
  { label: 'Foreground', className: 'text-foreground' },
  { label: 'Primary', className: 'text-primary' },
  { label: 'Emerald', className: 'text-emerald-500' },
  { label: 'Indigo', className: 'text-indigo-500' },
  { label: 'Amber', className: 'text-amber-500' },
  { label: 'Rose', className: 'text-rose-500' },
  { label: 'Cyan', className: 'text-cyan-500' },
]

export default function Demo() {
  return (
    <div className="flex size-full min-h-[260px] flex-wrap items-center justify-center gap-7 p-6">
      {TAILWIND_COLORS.map(({ label, className }) => (
        <div key={label} className="flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center">
            <LoadingOrb className={className} size={48} speed={750} />
          </div>
          <span className="text-xs font-medium tracking-tight text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}
