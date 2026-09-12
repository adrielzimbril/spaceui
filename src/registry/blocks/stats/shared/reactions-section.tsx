'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import Image from 'next/image'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { resolveEmojiUrl, EmojiSource, EmojiType, EmojiFormat } from '@usespaceui/emoji'
import { cn } from '@/registry/lib/utils'

export interface ReactionsSectionProps {
  reactions?: Record<string, number>
  className?: string
}

const REACTION_CONFIG: Record<
  string,
  {
    char: string
    label: string
  }
> = {
  like: { char: '👍', label: 'Like' },
  heart: { char: '❤️', label: 'Love' },
  celebrate: { char: '🎉', label: 'Celebrate' },
  insightful: { char: '💡', label: 'Insightful' },
  sceptic: { char: '🤔', label: 'Skeptical' },
}

export interface ReactionCardProps {
  char?: string
  label: string
  count: number
  className?: string
}

export function ReactionCard({ char = '👍', label, count, className }: ReactionCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const emojiUrl = React.useMemo(() => {
    if (!char) return ''
    try {
      return resolveEmojiUrl(char, {
        source: EmojiSource.Fluent,
        type: EmojiType.Anim,
        format: EmojiFormat.Webp,
      })
    } catch {
      return ''
    }
  }, [char])

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full bg-muted squircle-6xl/100 border-0 overflow-hidden p-4', className)}
    >
      <Card className="relative flex flex-col size-full items-center justify-center gap-4 md:gap-8 p-4 squircle-2xl/100 md:squircle-4xl/100 bg-background border-0 overflow-hidden before:hidden shadow-none">
        {emojiUrl && (
          <motion.div
            animate={{
              rotate: isHovered ? -20 : -32,
              scale: isHovered ? 1.15 : 1,
              y: isHovered ? -10 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="pointer-events-none absolute -bottom-6 -right-6 select-none opacity-15"
          >
            <Image
              src={emojiUrl}
              alt={label}
              width={96}
              height={96}
              className="size-24 object-contain pointer-events-none select-none"
            />
          </motion.div>
        )}

        <div className="relative w-full flex flex-col gap-2 z-10">
          <div className="relative flex flex-row items-center gap-2 md:gap-4">
            <Badge
              className="capitalize text-xs font-medium size-max bg-muted text-foreground p-2 squircle-2xl/80 md:squircle-3xl/80 border-0 flex items-center justify-center"
              size="sm"
              square
            >
              {emojiUrl ? (
                <Image
                  src={emojiUrl}
                  alt={label}
                  width={32}
                  height={32}
                  className="size-8 object-contain pointer-events-none select-none"
                />
              ) : (
                <span className="text-2xl">{char}</span>
              )}
            </Badge>
            <div className="flex flex-col items-start gap-2">
              <h6 className="tracking-wide text-foreground font-medium text-sm md:text-base leading-tight">{label}</h6>
              <p className="text-sm text-muted-foreground leading-[120%] font-medium">{count.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </Frame>
  )
}

export function ReactionsSection({ reactions = {}, className }: ReactionsSectionProps) {
  const items = Object.entries(REACTION_CONFIG).map(([key, config]) => ({
    key,
    char: config.char,
    label: config.label,
    count: reactions[key] || reactions[config.char] || 120,
  }))

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full', className)}>
      {items.map((item) => (
        <ReactionCard key={item.key} char={item.char} label={item.label} count={item.count} />
      ))}
    </div>
  )
}
