'use client'

import * as React from 'react'
import { BlurRevealText, type SplitMode, type RevealDirection } from '@/registry/components/spaceui/blur-reveal-text'

export interface BlurRevealTextDemoProps {
  text?: string
  splitBy?: SplitMode
  direction?: RevealDirection
  blurAmount?: string
  stagger?: number
}

export default function Demo({
  text = 'Great design is not just what looks good. It is how every detail feels alive.',
  splitBy = 'words',
  direction = 'up',
  blurAmount = '12px',
  stagger = 0.05,
}: BlurRevealTextDemoProps) {
  const [replayKey, setReplayKey] = React.useState(0)

  // Automatically restart animation every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setReplayKey((k) => k + 1)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[320px]">
      <div className="w-full text-center">
        <BlurRevealText
          key={replayKey}
          replayKey={replayKey}
          text={text}
          splitBy={splitBy}
          direction={direction}
          blurAmount={blurAmount}
          stagger={Number(stagger)}
          className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight leading-snug justify-center text-foreground"
        />
      </div>
    </div>
  )
}
