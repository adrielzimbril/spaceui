'use client'

import { Animoji, type AnimojiSource } from '@/registry/components/spaceui/animoji'

export interface AnimojiDemoProps {
  text?: string
  source?: AnimojiSource
}

export default function Demo({
  text = 'Ship your ideas faster 🚀 with Space UI 🫧🦄',
  source = 'fluent',
}: AnimojiDemoProps) {
  return (
    <div className="flex w-full flex-col gap-4 px-6 text-center">
      <p className="text-2xl leading-relaxed text-foreground">
        <Animoji source={source}>{text}</Animoji>
      </p>
      <span className="text-lg text-muted-foreground">
        <Animoji source={source}>{'Built with \u{2764}\u{FE0F} love from \u{1F1E8}\u{1F1EE} 👋'}</Animoji>
      </span>
    </div>
  )
}
