'use client'

import * as React from 'react'
import { ScrollRevealText } from '@/registry/components/spaceui/scroll-reveal-text'

export interface ScrollRevealTextDemoProps {
  scrollLength?: string
  showProgress?: boolean
}

const CUSTOM_LINES = [
  'We believe software should feel weightless.',
  'Every curve, transition, and micro-gesture',
  'Crafted to inspire and elevate human craft.',
] as const

export default function Demo({
  scrollLength = '180svh',
  showProgress = false,
}: ScrollRevealTextDemoProps) {
  return (
    <div className="w-full">
      <ScrollRevealText
        scrollLength={scrollLength}
        showProgress={Boolean(showProgress)}
        lines={CUSTOM_LINES}
      />
    </div>
  )
}
