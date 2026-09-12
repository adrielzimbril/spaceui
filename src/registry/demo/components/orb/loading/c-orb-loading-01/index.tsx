'use client'

import * as React from 'react'
import { LoadingOrb, type LoaderMotion, type LoadingOrbProps } from '@/registry/components/orb/loading'

export interface LoadingOrbLiveDemoProps extends LoadingOrbProps {
  speed?: number
  motionPreset?: LoaderMotion
  radius?: number
  gap?: number
  showGhost?: boolean
  size?: number
  className?: string
}

export default function Demo({
  speed = 750,
  motionPreset = 'morph',
  radius = 3,
  gap = 3,
  showGhost = false,
  size = 64,
  className = 'text-foreground',
}: LoadingOrbLiveDemoProps) {
  return (
    <div className="flex size-full min-h-[300px] items-center justify-center p-6">
      <LoadingOrb
        speed={speed}
        motionPreset={motionPreset}
        radius={radius}
        gap={gap}
        showGhost={showGhost}
        size={size}
        className={className}
      />
    </div>
  )
}
