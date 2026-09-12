'use client'

import * as React from 'react'
import { OrbSearching } from '@/registry/components/orb/thinking'
import type { ThinkingOrbSurface } from '@/registry/components/orb/thinking'

export interface DemoProps {
  surface?: ThinkingOrbSurface
  size?: number
  speed?: number
  scale?: number
  playback?: 'play' | 'pause'
}

export default function Demo({ surface = 'auto', size = 240, speed = 1, scale = 0.72, playback = 'play' }: DemoProps) {
  return (
    <div className="flex size-full min-h-[300px] flex-col items-center justify-center p-6">
      <OrbSearching surface={surface} size={size} speed={speed} scale={scale} playback={playback} />
    </div>
  )
}
