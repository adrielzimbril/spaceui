'use client'

import * as React from 'react'
import { PixelRevealText } from '@/registry/components/spaceui/pixel-reveal-text'

const CYCLE_INTERVAL = 3300

const PHRASES = [
  'Ship your ideas faster 🚀',
  'Mind-blowing UI Library 🤯',
  'You will love Space UI 🫧🦄',
  'So satisfying to use 😋',
  'Design better ✨',
  'Ship with confidence 🎉',
  '260+ components 📦',
  'Open-source & MIT 🔓',
  'Animated with Motion 🌀',
  'Loved by the community ❤️',
]

export default function Demo() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length)
    }, CYCLE_INTERVAL)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-90 w-full items-center justify-center p-8 text-foreground">
      <PixelRevealText text={PHRASES[index]} fontSize={40} pixelSize={4} trigger="loop" />
    </div>
  )
}
