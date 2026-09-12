'use client'

import * as React from 'react'
import { LoadingOrb, LOADING_PATTERNS } from '@/registry/components/orb/loading'

export default function Demo() {
  return (
    <div className="flex size-full min-h-[260px] flex-col items-center justify-center p-6">
      <div className="flex w-full items-center justify-center gap-5 sm:gap-7 flex-wrap">
        {LOADING_PATTERNS.map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-2.5">
            <div className="flex items-center justify-center">
              <LoadingOrb pattern={p.name} size={48} radius={3} gap={3} />
            </div>
            <span className="text-xs font-medium capitalize tracking-wide text-muted-foreground">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
