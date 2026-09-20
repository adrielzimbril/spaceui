'use client'

import { Textmoji, type StaticEmojiSource } from '@/registry/components/spaceui/textmoji'

export interface TextmojiDemoProps {
  text?: string
  source?: StaticEmojiSource
}

export default function Demo({
  text = 'Ship your ideas faster 🚀 with Space UI 🫧🦄',
  source = 'fluent',
}: TextmojiDemoProps) {
  return (
    <div className="flex w-full flex-col gap-4 px-6 text-center">
      <p className="text-2xl leading-relaxed text-foreground">
        <Textmoji source={source}>{text}</Textmoji>
      </p>
      <span className="text-lg text-muted-foreground">
        <Textmoji source={source}>{'Built with \u{2764}\u{FE0F} love from \u{1F1E8}\u{1F1EE} 👋'}</Textmoji>
      </span>
    </div>
  )
}
