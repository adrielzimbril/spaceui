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

const INITIAL_CHARACTERS: MixedCharacter[] = [
  { id: '1', type: 'avatar', variant: 'pebble', label: 'Pebble' },
  { id: '2', type: 'squishmoji', expr: 'happy', label: 'Happy', shape: 'all', bg: 'taygeta' },
  { id: '3', type: 'avatar', variant: 'lumina', label: 'Lumina' },
  { id: '4', type: 'squishmoji', expr: 'excited', label: 'Excited', shape: 'all', bg: 'maia' },
  { id: '5', type: 'avatar', variant: 'critter', label: 'Critter' },
  { id: '6', type: 'squishmoji', expr: 'laughing', label: 'Laughing', shape: 'all', bg: 'alcyone' },
]

interface AvatarsSquishmojiCardProps {
  isVisible?: boolean
}

export function AvatarsSquishmojiCard({ isVisible = true }: AvatarsSquishmojiCardProps) {
  const [charSeed, setCharSeed] = React.useState('space-packages')
  const [characters, setCharacters] = React.useState<MixedCharacter[]>(INITIAL_CHARACTERS)
  const [hovered, setHovered] = React.useState<number | null>(null)

  const randomizeCharacters = React.useCallback((playSound = false) => {
    if (playSound) {
      dropletSound()
    }
    const newSeed = Math.random().toString(36).slice(2, 8)
    setCharSeed(newSeed)

    const shuffledVariants = [...ALL_AVATAR_VARIANTS].sort(() => Math.random() - 0.5)
    const shuffledExprs = [...ALL_SQUISH_EXPRS].sort(() => Math.random() - 0.5)

    setCharacters([
      {
        id: '1',
        type: 'avatar',
        variant: shuffledVariants[0],
        label: shuffledVariants[0].charAt(0).toUpperCase() + shuffledVariants[0].slice(1),
      },
      {
        id: '2',
        type: 'squishmoji',
        ...shuffledExprs[0],
      },
      {
        id: '3',
        type: 'avatar',
        variant: shuffledVariants[1],
        label: shuffledVariants[1].charAt(0).toUpperCase() + shuffledVariants[1].slice(1),
      },
      {
        id: '4',
        type: 'squishmoji',
        ...shuffledExprs[1],
      },
      {
        id: '5',
        type: 'avatar',
        variant: shuffledVariants[2],
        label: shuffledVariants[2].charAt(0).toUpperCase() + shuffledVariants[2].slice(1),
      },
      {
        id: '6',
        type: 'squishmoji',
        ...shuffledExprs[2],
      },
    ])
  }, [])

  useStaggeredInterval(
    () => {
      randomizeCharacters(false)
    },
    BENTO_CYCLE_INTERVAL,
    isVisible,
  )

  return (
    <Frame className="flex flex-col h-full sm:col-span-2 lg:col-span-2">
      <Card className="flex-1 flex flex-col h-full rounded-xl before:rounded-xl overflow-hidden">
        <CardPanel className="flex-1 flex flex-col justify-center gap-3 p-4 min-h-48 rounded-lg">
          <div className="grid grid-cols-6 gap-2 w-full items-center justify-items-center">
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
