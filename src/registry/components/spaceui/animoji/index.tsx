'use client'

import * as React from 'react'
import emojiRegex from 'emoji-regex'
import { EmojiSource, EmojiType, resolveEmojiUrl, fromUnicode } from '@usespaceui/emoji'
import { cn } from '@/registry/lib/utils'

type Segment = { kind: 'text'; value: string } | { kind: 'emoji'; value: string }

// A bare hex codepoint word, e.g. "1f496" or the two-part "1f1e8-1f1ee" for a flag.
const CODEPOINT_TOKEN = /^[0-9a-fA-F]{4,6}(?:[-_][0-9a-fA-F]{4,6})*$/

// Codepoint words only count on their own, between whitespace — never mid-word,
// so plain hex-looking text like "decade" or "cafe" is never mistaken for one.
function splitCodepoints(text: string): Segment[] {
  return text.split(/(\s+)/).map((part) => {
    if (CODEPOINT_TOKEN.test(part)) {
      try {
        return { kind: 'emoji', value: fromUnicode(part) }
      } catch {
        return { kind: 'text', value: part }
      }
    }
    return { kind: 'text', value: part }
  })
}

// Same regex @usespaceui/emoji resolves codepoints with, so flags/ZWJ combos stay one match.
function splitEmoji(text: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0
  for (const match of text.matchAll(emojiRegex())) {
    const index = match.index ?? 0
    if (index > lastIndex) segments.push(...splitCodepoints(text.slice(lastIndex, index)))
    segments.push({ kind: 'emoji', value: match[0] })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) segments.push(...splitCodepoints(text.slice(lastIndex)))
  return segments
}

function EmojiGlyph({ emoji, source, className }: { emoji: string; source: EmojiSource; className?: string }) {
  // No format: @usespaceui/emoji already defaults to the right one per source + type.
  const src = React.useMemo(() => {
    try {
      return resolveEmojiUrl(emoji, { source, type: EmojiType.Anim } as never)
    } catch {
      return ''
    }
  }, [emoji, source])
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [src])

  // Raw glyph fallback rather than break the sentence.
  if (!src || failed) return <>{emoji}</>

  return (
    <img
      src={src}
      alt={emoji}
      draggable={false}
      onError={() => setFailed(true)}
      // 1em tracks the inherited font size. -0.1em is Twemoji's own baseline offset.
      className={cn('inline-block h-[1em] w-[1em] align-[-0.1em]', className)}
    />
  )
}

/** Providers with an animated style — Apple, Twemoji and Blobmoji have none. */
export type AnimojiSource = typeof EmojiSource.Fluent | typeof EmojiSource.Telegram | typeof EmojiSource.Noto

export type AnimojiProps = {
  children: string
  /** @default 'fluent' */
  source?: AnimojiSource
  className?: string
  emojiClassName?: string
}

/** Renders every Unicode emoji in `children` as an animated image sized to the surrounding text. */
export function Animoji({ children, source = EmojiSource.Fluent, className, emojiClassName }: AnimojiProps) {
  return (
    <span className={cn('inline', className)}>
      {splitEmoji(children).map((segment, index) =>
        segment.kind === 'text' ? (
          <React.Fragment key={index}>{segment.value}</React.Fragment>
        ) : (
          <EmojiGlyph key={index} emoji={segment.value} source={source} className={emojiClassName} />
        ),
      )}
    </span>
  )
}
