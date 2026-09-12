'use client'

import * as React from 'react'
import {
  LoadingOrb,
  LOADING_PATTERNS,
  type LoaderMotion,
  type LoadingOrbProps,
} from '@/registry/components/orb/loading'

export interface LoadingOrbDemoProps extends LoadingOrbProps {
  motionPreset?: LoaderMotion
  size?: number
  speed?: number
  radius?: number
  gap?: number
  showGhost?: boolean
}

export default function Demo({
  motionPreset = 'morph',
  size = 48,
  speed = 750,
  radius = 3,
  gap = 3,
  showGhost = false,
}: LoadingOrbDemoProps) {
  return (
    <div className="flex size-full min-h-[260px] flex-col items-center justify-center p-6">
      <div className="flex w-full items-center justify-center gap-5 sm:gap-7 flex-wrap">
        {LOADING_PATTERNS.map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-2.5">
            <div className="flex items-center justify-center rounded-xl border border-border/40 bg-card/40 p-3.5 shadow-sm backdrop-blur-sm transition-colors hover:border-border">
              <LoadingOrb
                pattern={p.name}
                motionPreset={motionPreset}
                size={size}
                speed={speed}
                radius={radius}
                gap={gap}
                showGhost={showGhost}
              />
            </div>
            <span className="font-mono text-[11px] font-medium capitalize tracking-wide text-muted-foreground">
              {p.name}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-sm backdrop-blur-sm">
            <LoadingOrb
              motionPreset={motionPreset}
              size={size}
              speed={speed}
              radius={radius}
              gap={gap}
              showGhost={showGhost}
            />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-wide text-primary">
            Live
          </span>
        </div>
      </div>
    </div>
  )
}
