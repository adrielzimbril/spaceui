'use client'

import * as React from 'react'
import { MorphingText } from '@/registry/components/spaceui/morphing-text'

export interface MorphingTextPhrasesDemoProps {
  interval?: number
  blurAmount?: string
  pauseOnHover?: boolean
}

const DEFAULT_PHRASES = [
  'Build fluid interfaces',
  'Craft delightful moments',
  'Design with intention',
  'Ship with confidence',
  'Explore creative motion',
]

export default function Demo({
  interval = 2800,
  blurAmount = '10px',
  pauseOnHover = true,
}: MorphingTextPhrasesDemoProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-12 flex items-center justify-center min-h-[320px]">
      <MorphingText
        texts={DEFAULT_PHRASES}
        interval={Number(interval)}
        blurAmount={blurAmount}
        pauseOnHover={Boolean(pauseOnHover)}
        textClassName="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center"
      />
    </div>
  )
}
