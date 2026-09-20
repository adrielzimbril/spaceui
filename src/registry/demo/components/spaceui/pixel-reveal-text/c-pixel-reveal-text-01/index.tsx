'use client'

import * as React from 'react'
import { PixelRevealText } from '@/registry/components/spaceui/pixel-reveal-text'

export interface PixelRevealTextDemoProps {
  text?: string
  edgeColor?: string
  pixelSize?: number
  fontSize?: number
  speed?: number
  trigger?: 'loop' | 'scroll' | 'hover'
}

export default function Demo({
  text = 'Space UI 🤯❣️',
  edgeColor = '#ffe9a8',
  pixelSize = 4,
  fontSize = 54,
  speed = 1,
  trigger = 'loop',
}: PixelRevealTextDemoProps) {
  return (
    <div className="flex min-h-[360px] w-full items-center justify-center p-8 text-foreground">
      <PixelRevealText
        key={`${text}-${edgeColor}-${pixelSize}-${fontSize}-${speed}-${trigger}`}
        text={text}
        fontSize={Number(fontSize)}
        pixelSize={Number(pixelSize)}
        edgeColor={edgeColor}
        speed={Number(speed)}
        trigger={trigger}
      />
    </div>
  )
}
