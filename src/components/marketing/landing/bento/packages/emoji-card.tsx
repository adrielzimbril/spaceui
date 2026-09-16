'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Button } from '@/registry/primitives/button'
import { sparkleSound } from '@/components/providers/sound-provider'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { resolveEmojiUrl, EmojiFormat, EmojiSource, EmojiType } from '@usespaceui/emoji'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'

const EMOJI_ANIM_STYLES = [
  { source: EmojiSource.Fluent, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Fluent' },
  { source: EmojiSource.Noto, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Noto' },
  { source: EmojiSource.Telegram, type: EmojiType.Anim, format: EmojiFormat.Webp, label: 'Telegram' },
] as const

const ALL_ANIMATED_EMOJIS = [
  { char: '🔥', name: 'Fire' },
  { char: '🚀', name: 'Rocket' },
  { char: '✨', name: 'Sparkles' },
  { char: '🎉', name: 'Party' },
  { char: '💎', name: 'Diamond' },
  { char: '❤️', name: 'Heart' },
  { char: '🤩', name: 'Star Struck' },
  { char: '🥳', name: 'Partying' },
  { char: '😎', name: 'Cool' },
  { char: '😂', name: 'Joy' },
  { char: '🤯', name: 'Mind Blown' },
  { char: '⚡', name: 'Zap' },
  { char: '🍕', name: 'Pizza' },
  { char: '🦄', name: 'Unicorn' },
  { char: '👾', name: 'Alien Monster' },
  { char: '🤖', name: 'Robot' },
  { char: '👻', name: 'Ghost' },
  { char: '🐱', name: 'Cat' },
  { char: '🦊', name: 'Fox' },
  { char: '🦁', name: 'Lion' },
  { char: '🐼', name: 'Panda' },
  { char: '🦋', name: 'Butterfly' },
  { char: '🌺', name: 'Flower' },
  { char: '🌈', name: 'Rainbow' },
  { char: '⚽', name: 'Soccer' },
  { char: '☕', name: 'Coffee' },
]

interface EmojiCardProps {
  isVisible?: boolean
}

export function EmojiCard({ isVisible = true }: EmojiCardProps) {
  const [emojiStyleIdx, setEmojiStyleIdx] = React.useState(0)
  const [emojiOffset, setEmojiOffset] = React.useState(0)

  useStaggeredInterval(() => {
    setEmojiStyleIdx((prev) => (prev + 1) % EMOJI_ANIM_STYLES.length)
    setEmojiOffset((prev) => (prev + 6) % ALL_ANIMATED_EMOJIS.length)
  }, BENTO_CYCLE_INTERVAL, isVisible)

  const activeEmojiStyle = EMOJI_ANIM_STYLES[emojiStyleIdx]
  const currentEmojis = React.useMemo(() => {
    const items = []
    for (let i = 0; i < 6; i++) {
      items.push(ALL_ANIMATED_EMOJIS[(emojiOffset + i) % ALL_ANIMATED_EMOJIS.length])
    }
    return items
  }, [emojiOffset])

  return (
    <Frame className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col h-full">
        <CardPanel className="flex-1 flex flex-col justify-center gap-2 p-3.5 min-h-44">
          <div className="grid grid-cols-3 gap-2.5 items-center justify-items-center">
            {currentEmojis.map((em, slotIdx) => {
              const emojiUrl = resolveEmojiUrl(em.char, {
                source: activeEmojiStyle.source,
                type: activeEmojiStyle.type,
                format: activeEmojiStyle.format,
              })

              return (
                <Button
                  key={`emoji-slot-${slotIdx}`}
                  variant="ghost"
                  onClick={() => sparkleSound()}
                  title={em.name}
                  className="group flex h-auto! flex-col items-center gap-1 p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95 select-none"
                >
                  <div className="relative size-9 overflow-hidden rounded-xl p-1 flex items-center justify-center bg-muted/30">
                    <MorphIcon activeKey={`${em.char}-${activeEmojiStyle.source}`} variant="blur-scale" duration={0.28}>
                      {emojiUrl ? (
                        <Image
                          src={emojiUrl}
                          alt={em.name}
                          width={28}
                          height={28}
                          className="size-7 object-contain pointer-events-none"
                        />
                      ) : (
                        <span className="text-lg leading-none">{em.char}</span>
                      )}
                    </MorphIcon>
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[52px] text-center">
                    {em.name}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Emoji Hub</FrameTitle>
        <Link
          href="/tools/emoji"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
