'use client'

import * as React from 'react'
import { FrostBlurred, type FrostBlurredSide } from '@/registry/components/spaceui/frost-blurred'

export interface FrostBlurredDemoProps {
  layers?: number
  strength?: number
  height?: string
  side?: FrostBlurredSide
  tint?: number
  text?: string
}

export default function Demo({
  layers = 4,
  strength = 1,
  height = '62%',
  side = 'bottom',
  tint = 0.22,
  text = 'Space UI',
}: FrostBlurredDemoProps) {
  return (
    <div className="flex justify-center px-4 sm:px-6">
      <FrostBlurred
        layers={Number(layers)}
        strength={Number(strength)}
        height={height}
        side={side}
        tint={Number(tint)}
        className="w-full"
      >
        <span className="text-foreground block select-none font-open-runde text-center text-[clamp(2.5rem,15vw,12rem)] leading-normal font-medium tracking-[-0.045em]">
          {text}
        </span>
      </FrostBlurred>
    </div>
  )
}
