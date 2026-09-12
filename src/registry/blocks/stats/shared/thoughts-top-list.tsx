'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import Image from 'next/image'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { resolveEmojiUrl, EmojiSource, EmojiType, EmojiFormat } from '@usespaceui/emoji'
import { cn } from '@/registry/lib/utils'
import type { ThoughtItem } from './types'

export interface ThoughtsTopListProps {
  title: string
  description: string
  thoughts: ThoughtItem[]
  icon: React.ReactNode
  decoration: string
  type?: 'viewed' | 'reacted'
  className?: string
}

export function ThoughtsTopList({
  title,
  description,
  thoughts,
  icon,
  decoration,
  type = 'viewed',
  className,
}: ThoughtsTopListProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const maxItems = 4
  const displayThoughts = thoughts.slice(0, maxItems)
  const isViewed = type === 'viewed'

  const emojiUrl = React.useMemo(() => {
    if (!decoration) return ''
    try {
      return resolveEmojiUrl(decoration, {
        source: EmojiSource.Fluent,
        type: EmojiType.Anim,
        format: EmojiFormat.Webp,
      })
    } catch {
      return ''
    }
  }, [decoration])

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full bg-muted squircle-6xl/100 border-0 overflow-hidden p-4 md:p-6', className)}
    >
      <Card className="relative flex flex-col size-full items-center justify-start gap-4 md:gap-8 p-4 squircle-2xl/100 md:squircle-4xl/100 bg-background border-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: isHovered ? -20 : -32,
            scale: isHovered ? 1.15 : 1,
            y: isHovered ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute -bottom-6 -right-6 select-none opacity-10 pointer-events-none"
        >
          {emojiUrl ? (
            <Image
              src={emojiUrl}
              alt={title}
              width={96}
              height={96}
              className="size-24 object-contain pointer-events-none select-none"
            />
          ) : (
            <span className="text-[6rem] leading-none">{decoration}</span>
          )}
        </motion.div>

        <div className="relative w-full flex flex-col gap-2 z-10">
          <div className={cn('relative flex flex-row items-center gap-2 md:gap-4 mb-4')}>
            <Badge
              className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max"
              size="sm"
              square
              variant="default"
            >
              {icon}
            </Badge>
            <div className="flex flex-col items-start gap-2">
              <h6 className="tracking-wide text-foreground">{title}</h6>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-2">
            {displayThoughts.map((thought, index) => (
              <div key={thought.slug || index} className="group/item">
                <div className="flex items-center gap-3">
                  <Badge className="capitalize text-xs font-medium shrink-0" size="sm" variant="primary">
                    {index + 1}
                  </Badge>
                  <a
                    href={`#${thought.slug}`}
                    className="flex-1 text-sm leading-relaxed text-foreground hover:underline truncate"
                  >
                    {thought.title}
                  </a>
                  <Badge
                    className={cn(
                      'capitalize text-xs font-medium shrink-0',
                      isViewed ? 'bg-[#8e8eff] text-white size-max' : 'bg-[#ffd3ad] text-stone-900 size-max',
                    )}
                    variant="default"
                    size="sm"
                  >
                    {thought.count.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {thoughts.length > maxItems && (
            <div className="relative flex mt-2">
              <Button variant="base" size="xs" className="py-1.5" asPointer render={<a href="#more" />}>
                <span className="capitalize text-xs">+{thoughts.length - maxItems} see more</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Frame>
  )
}
