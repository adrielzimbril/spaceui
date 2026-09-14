'use client'

import * as React from 'react'
import { MorphingText } from '@/registry/components/spaceui/morphing-text'

export interface MorphingTextDemoProps {
  interval?: number
  blurAmount?: string
  springBounce?: number
  pauseOnHover?: boolean
}

const DEFAULT_WORDS = [
  'Morphing',
  'Motion',
  'Animation',
  'Dimension',
  'Precision',
  'Creation',
]

export default function Demo({
  interval = 2400,
  blurAmount = '10px',
  springBounce = 0.14,
  pauseOnHover = true,
}: MorphingTextDemoProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-12 flex items-center justify-center min-h-[320px]">
      <MorphingText
        texts={DEFAULT_WORDS}
        interval={Number(interval)}
        blurAmount={blurAmount}
        springBounce={Number(springBounce)}
        pauseOnHover={Boolean(pauseOnHover)}
        textClassName="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground"
      />
    </div>
  )
}
