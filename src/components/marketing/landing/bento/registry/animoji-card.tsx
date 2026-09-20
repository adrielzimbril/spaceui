'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { Animoji, type AnimojiSource } from '@/registry/components/spaceui/animoji'

const CYCLE_INTERVAL = 2800

const SOURCES: AnimojiSource[] = ['fluent', 'telegram', 'noto']

const PHRASES = [
  'Ship your ideas faster 🚀',
  'Mind-blowing UI Library 🤯',
  'You will love Space UI 🫧🦄',
  'Built with ❤️ love from 🇨🇮 👋',
  'So satisfying to use 😋',
  'Ship faster 🚀',
  'Design better ✨',
  'You know you want it 😉',
  'Ship with confidence 🎉',
  'Build with care 🛠️',
  "We know, it's good 😏",
  'Copy, paste, done ✅',
  '260+ components 📦',
  'Drooling over these components 🤤',
  'New drops every week 🔥',
  'Open-source & MIT 🔓',
  'A little unhinged, in a good way 🤪',
  'Built for Next.js ⚛️',
  'Styled with Tailwind 🎨',
  'Ship it and celebrate 🥳',
  'Animated with Motion 🌀',
  'Dark mode included 🌙',
  'Smooth in every direction 🙂‍↔️',
  'Accessible by default 🥺',
  'Made for developers 👩‍💻',
  'Nodding along with every update 🙂‍↕️',
  'Zero config setup ⚡',
  "Can't unsee this UI 🙈",
  'Loved by the community ❤️',
]

export function AnimojiCard({ isVisible = true }: { isVisible?: boolean }) {
  const [index, setIndex] = React.useState(0)
  const [source, setSource] = React.useState<AnimojiSource>(SOURCES[0])

  React.useEffect(() => {
    if (!isVisible) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length)
      // Independent random pick each tick — index%SOURCES.length would
      // deterministically pair the same phrase with the same source forever.
      setSource(SOURCES[Math.floor(Math.random() * SOURCES.length)])
    }, CYCLE_INTERVAL)
    return () => window.clearInterval(id)
  }, [isVisible])

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex text-center min-h-44 flex-col items-center justify-center p-3.5 rounded-lg">
          <BlurRevealText
            text={PHRASES[index]}
            replayKey={index}
            splitBy="words"
            inView={false}
            className="text-lg text-center font-medium sm:text-xl"
            renderSegment={(segment) => <Animoji source={source}>{segment}</Animoji>}
          />
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Textmoji Animated</FrameTitle>
        <Link
          href="/components/animoji"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
