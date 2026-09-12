'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import Image from 'next/image'
import { IconArrowUpRight, IconEyeFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { resolveEmojiUrl, EmojiSource, EmojiType, EmojiFormat } from '@usespaceui/emoji'
import { imagelib } from '@/lib/imagelib'
import { cn } from '@/registry/lib/utils'

export interface ThoughtMostViewedCardProps {
  title: string
  slug: string
  description?: string
  coverImage?: string
  views: number
  delay?: number
  className?: string
}

export function ThoughtMostViewedCard({
  title,
  slug,
  description,
  coverImage,
  views,
  className,
}: ThoughtMostViewedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const effectiveImage = coverImage || imagelib.tools.imagesplit[0]?.url || '/samples/image-1.png'

  const emojiUrl = React.useMemo(() => {
    try {
      return resolveEmojiUrl('📋', {
        source: EmojiSource.Fluent,
        type: EmojiType.Anim,
        format: EmojiFormat.Webp,
      })
    } catch {
      return ''
    }
  }, [])

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full md:col-span-8 bg-muted squircle-6xl/100 border-0 overflow-hidden p-4 md:p-6', className)}
    >
      <Card className="flex relative flex-col size-full items-center justify-start p-4 squircle-2xl/100 md:squircle-4xl/100 bg-background border-0 overflow-hidden before:hidden shadow-none">
        <motion.div
          animate={{
            rotate: isHovered ? -8 : -18,
            scale: isHovered ? 1.15 : 1,
            y: isHovered ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="pointer-events-none absolute -bottom-4 -right-14 select-none opacity-10"
        >
          {emojiUrl ? (
            <Image
              src={emojiUrl}
              alt="Most viewed"
              width={140}
              height={140}
              className="size-36 object-contain pointer-events-none select-none"
            />
          ) : (
            <span className="text-[12rem] leading-none">📋</span>
          )}
        </motion.div>

        {/* Browser Mockup Illustration */}
        <a href={`#${slug}`} className="block w-full">
          <div className="relative h-[280px] w-full shrink-0">
            <motion.div
              animate={{
                rotate: isHovered ? -1 : -5,
                x: isHovered ? -3 : -8,
                y: isHovered ? 3 : 5,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute inset-4 rounded-lg bg-muted"
            />

            <motion.div
              animate={{
                rotate: isHovered ? 0.5 : 1.5,
                y: isHovered ? -4 : 0,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute inset-4 flex flex-col overflow-hidden rounded-lg border-2 border-muted bg-background"
            >
              {/* Browser bar */}
              <div className="flex shrink-0 items-center gap-1.5 border-b border-muted bg-background px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-300" />
                <div className="h-2 w-2 rounded-full bg-yellow-300" />
                <div className="h-2 w-2 rounded-full bg-green-300" />
                <div className="ml-2 h-2 flex-1 rounded bg-muted" />
              </div>

              {/* Cover simulation with real image */}
              <div className="relative h-[100px] w-full shrink-0 overflow-hidden">
                <Image
                  src={effectiveImage}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="line-clamp-2 text-[8px] font-bold leading-tight text-white">{title}</p>
                </div>
              </div>

              {/* Content mock */}
              <div className="flex-1 space-y-2 overflow-hidden bg-background p-2.5">
                <div className="space-y-1">
                  <div className="h-[5px] w-full rounded-sm bg-muted" />
                  <div className="h-[5px] w-full rounded-sm bg-muted" />
                  <div className="h-[5px] w-[92%] rounded-sm bg-muted" />
                  <div className="h-[5px] w-[85%] rounded-sm bg-muted" />
                </div>
                <div className="space-y-1">
                  <div className="h-[5px] w-full rounded-sm bg-muted/90" />
                  <div className="h-[5px] w-full rounded-sm bg-muted/90" />
                  <div className="h-[5px] w-[78%] rounded-sm bg-muted/90" />
                </div>
                <div className="rounded bg-muted p-1.5">
                  <div className="space-y-1">
                    <div className="h-[4px] w-[60%] rounded-sm bg-background" />
                    <div className="h-[4px] w-[75%] rounded-sm bg-background" />
                    <div className="h-[4px] w-[45%] rounded-sm bg-background" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-[5px] w-full rounded-sm bg-muted/90" />
                  <div className="h-[5px] w-[88%] rounded-sm bg-muted/90" />
                </div>
              </div>
            </motion.div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        </a>

        {/* Content info */}
        <div className="relative z-20 flex flex-col items-start justify-between gap-4 md:gap-6 size-full">
          <div className="flex flex-col items-start justify-center gap-3">
            <Badge className="relative font-medium bg-muted text-foreground border-none" size="xl">
              Most viewed article
            </Badge>
            <a href={`#${slug}`} className="flex flex-col items-start justify-center gap-1.5 group/link">
              <p className="w-full relative text-xl line-clamp-2 leading-[120%] font-medium text-foreground group-hover/link:underline">
                {title}
              </p>
              {description && (
                <p className="w-full relative text-sm line-clamp-2 leading-relaxed text-muted-foreground font-normal">
                  {description}
                </p>
              )}
            </a>
          </div>

          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center justify-between gap-3">
              <Badge
                className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max squircle-2xl/80 md:squircle-3xl/80 px-3 py-1.5 border-none"
                variant="default"
                size="md"
              >
                <span className="flex items-center gap-1.5 font-medium tabular-nums tracking-tight">
                  <IconEyeFilled size={16} />
                  <span>{views.toLocaleString()} views</span>
                </span>
              </Badge>
            </div>
            <Button whileTap size="xs" asIcon asPointer render={<a href={`#${slug}`} />}>
              <span className="flex items-center gap-1">
                <span>Read</span>
                <IconArrowUpRight size={16} />
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </Frame>
  )
}
