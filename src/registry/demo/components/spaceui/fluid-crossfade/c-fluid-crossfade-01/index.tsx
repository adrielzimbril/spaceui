'use client'

import * as React from 'react'
import { FluidCrossfade } from '@/registry/components/spaceui/fluid-crossfade'

export interface FluidCrossfadeDemoProps {
  imageSource?: 'url' | 'upload'
  imageA?: string
  imageFront?: string
  imageB?: string
  imageBack?: string
  ditherGrid?: number
  pixelGridSize?: number
  refractionStrength?: number
}

export default function Demo({
  imageSource = 'url',
  imageA = 'https://cdn.spaceui.one/atom/samples/image-1.png',
  imageFront,
  imageB = 'https://cdn.spaceui.one/atom/samples/image-2.png',
  imageBack,
  ditherGrid = 3.0,
  pixelGridSize = 240,
  refractionStrength = 0.85,
}: FluidCrossfadeDemoProps) {
  const effectiveA = imageSource === 'upload' && imageFront ? imageFront : imageA
  const effectiveB = imageSource === 'upload' && imageBack ? imageBack : imageB

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-none border-0 sm:h-[800px]">
      <FluidCrossfade
        key={`${effectiveA}-${effectiveB}-${ditherGrid}-${pixelGridSize}-${refractionStrength}`}
        imageA={effectiveA}
        imageB={effectiveB}
        ditherGrid={Number(ditherGrid)}
        pixelGridSize={Number(pixelGridSize)}
        refractionStrength={Number(refractionStrength)}
        className="h-full w-full rounded-none border-0"
      />
    </div>
  )
}
