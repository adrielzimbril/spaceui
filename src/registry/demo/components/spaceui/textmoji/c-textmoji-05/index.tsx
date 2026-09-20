'use client'

import * as React from 'react'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { Textmoji, type StaticEmojiSource } from '@/registry/components/spaceui/textmoji'

const PHRASES = [
  'Ship faster 🚀',
  'Design better ✨',
  'Ship with confidence 🎉',
  'Build with care 🛠️',
  'Copy, paste, done ✅',
  '260+ components 📦',
  'New drops every week 🔥',
  'Open-source & MIT 🔓',
  'Built for Next.js ⚛️',
  'Styled with Tailwind 🎨',
  'Animated with Motion 🌀',
  'Dark mode included 🌙',
  'Accessible by default ♿',
  'Made for developers 👩‍💻',
  'Zero config setup ⚡',
  'Loved by the community ❤️',
]

const SOURCES: StaticEmojiSource[] = ['fluent', 'apple', 'twemoji', 'blobmoji', 'noto']

export default function Demo() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), 2200)
    return () => window.clearInterval(id)
  }, [])

  const source = SOURCES[index % SOURCES.length]

  return (
    <div className="flex w-full items-center justify-center px-6 py-8">
      <BlurRevealText
        text={PHRASES[index]}
        replayKey={index}
        splitBy="words"
        inView={false}
        className="text-2xl font-semibold sm:text-3xl"
        renderSegment={(segment) => <Textmoji source={source}>{segment}</Textmoji>}
      />
    </div>
  )
}
