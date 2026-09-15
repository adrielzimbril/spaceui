'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
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

export function LoadingOrbCard() {
  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex min-h-72 flex-wrap items-center justify-center gap-5 sm:gap-6 p-4 rounded-lg">
          {TAILWIND_COLORS.map(({ label, className }) => (
            <div key={label} className="flex flex-col items-center gap-2 select-none">
              <div className="flex items-center justify-center">
                <LoadingOrb className={className} size={44} speed={750} />
              </div>
              <span className="text-xs font-medium tracking-tight text-muted-foreground">{label}</span>
            </div>
          ))}
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Loading Orb</FrameTitle>
        <Link
          href="/components/loading"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
