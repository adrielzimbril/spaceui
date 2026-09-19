'use client'

import * as React from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import type { SquishBackgroundStyle, SquishExpression } from '@usespaceui/squishmoji'
import { Avatar } from '@usespaceui/avatars/react'
import type { AvatarVariant } from '@usespaceui/avatars'
import { Frame, FrameFooter, FrameTitle } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { dropletSound, tapSound } from '@/components/providers/sound-provider'
import { BENTO_CYCLE_INTERVAL } from '@/config/space-config'
import { useStaggeredInterval } from '@/hooks/use-staggered-interval'
import { cn } from '@/registry/lib/utils'
import { TextMorph } from 'torph/react'

const ALL_AVATAR_VARIANTS: AvatarVariant[] = ['pebble', 'lumina', 'splash', 'critter', 'invader', 'animals']

const ALL_SQUISH_EXPRS: Array<{
  expr: SquishExpression
  label: string
  shape: 'all'
  bg: SquishBackgroundStyle
}> = [
  { expr: 'happy', label: 'Happy', shape: 'all', bg: 'taygeta' },
  { expr: 'excited', label: 'Excited', shape: 'all', bg: 'maia' },
  { expr: 'amazed', label: 'Amazed', shape: 'all', bg: 'merope' },
  { expr: 'laughing', label: 'Laughing', shape: 'all', bg: 'alcyone' },
  { expr: 'loving', label: 'Loving', shape: 'all', bg: 'celaeno' },
  { expr: 'proud', label: 'Proud', shape: 'all', bg: 'solid' },
]

type MixedCharacter =
  | {
      id: string
      type: 'avatar'
      variant: AvatarVariant
      label: string
    }
  | {
      id: string
      type: 'squishmoji'
      expr: SquishExpression
      label: string
      shape: 'all'
      bg: SquishBackgroundStyle
    }

function buildCharacters(count: number): MixedCharacter[] {
  const characters: MixedCharacter[] = []
  let avatarIdx = 0
  let squishIdx = 0

  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      const variant = ALL_AVATAR_VARIANTS[avatarIdx % ALL_AVATAR_VARIANTS.length]
      avatarIdx++
      characters.push({
        id: String(i + 1),
        type: 'avatar',
        variant,
        label: variant.charAt(0).toUpperCase() + variant.slice(1),
      })
    } else {
      const expr = ALL_SQUISH_EXPRS[squishIdx % ALL_SQUISH_EXPRS.length]
      squishIdx++
      characters.push({ id: String(i + 1), type: 'squishmoji', ...expr })
    }
  }

  return characters
}

interface AvatarsSquishmojiCardProps {
  isVisible?: boolean
  className?: string
  count?: number
}

export function AvatarsSquishmojiCard({ isVisible = true, className, count = 6 }: AvatarsSquishmojiCardProps) {
  const [charSeed, setCharSeed] = React.useState('space-packages')
  const [characters, setCharacters] = React.useState<MixedCharacter[]>(() => buildCharacters(count))
  const [hovered, setHovered] = React.useState<number | null>(null)

  const randomizeCharacters = React.useCallback(
    (playSound = false) => {
      if (playSound) {
        dropletSound()
      }
      setCharSeed(Math.random().toString(36).slice(2, 8))
      setCharacters(buildCharacters(count))
    },
    [count],
  )

  useStaggeredInterval(
    () => {
      randomizeCharacters(false)
    },
    BENTO_CYCLE_INTERVAL,
    isVisible,
  )

  return (
    <Frame className={cn('flex flex-col h-full sm:col-span-2 lg:col-span-2', className)}>
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex flex-col justify-center gap-3 p-4 min-h-48 rounded-lg">
          <div
            className={cn(
              'grid gap-2 w-full items-center justify-items-center',
              count <= 6 ? 'grid-cols-6' : 'grid-cols-3',
            )}
          >
            {characters.map((item, idx) => (
              <div
                key={`char-slot-${idx}`}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  tapSound()
                  randomizeCharacters(true)
                }}
                className="flex flex-col items-center gap-1.5 select-none cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:scale-105"
              >
                {item.type === 'avatar' ? (
                  <div className="relative size-11 overflow-hidden rounded-full">
                    <Avatar
                      name={`${charSeed}-${item.variant}`}
                      variant={item.variant}
                      size={44}
                      circle
                      animate={hovered === idx}
                    />
                  </div>
                ) : (
                  <div className="relative size-11 flex items-center justify-center">
                    <Squishmoji
                      seed={`${charSeed}-${item.expr}`}
                      expression={item.expr}
                      shape="all"
                      size={44}
                      backgroundStyle={item.bg}
                      animate={hovered === idx}
                      animWobble={hovered === idx}
                      animOnHover
                      animOnClick
                    />
                  </div>
                )}
                <span className="text-[10px] font-medium text-muted-foreground">
                  <TextMorph>{item.label}</TextMorph>
                </span>
              </div>
            ))}
          </div>
        </CardPanel>
      </Card>
      <FrameFooter className="flex flex-row items-center justify-between p-2">
        <FrameTitle className="text-muted-foreground">Generative Avatars &amp; Squishmoji</FrameTitle>
        <Link
          href="/tools/avatars"
          data-space-hover
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowUpRight className="size-4" />
        </Link>
      </FrameFooter>
    </Frame>
  )
}
