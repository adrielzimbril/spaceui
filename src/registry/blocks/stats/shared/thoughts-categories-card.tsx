'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { IconPresentationFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { cn } from '@/registry/lib/utils'
import type { CategoryItem } from './types'

export interface ThoughtsCategoriesCardProps {
  data: CategoryItem[]
  title: string
  description: string
  decorationEmoji: string
  className?: string
}

export function ThoughtsCategoriesCard({
  data,
  title,
  description,
  decorationEmoji,
  className,
}: ThoughtsCategoriesCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const maxItems = 2
  const displayData = data.slice(0, maxItems)

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full bg-muted squircle-6xl/100 border-0 overflow-hidden p-4', className)}
    >
      <Card
        className={cn(
          'flex relative flex-col size-full items-center justify-center gap-4 md:gap-8 p-4 squircle-2xl/100 md:squircle-4xl/100 bg-background border-0 overflow-hidden before:hidden shadow-none',
        )}
      >
        <motion.div
          animate={{
            rotate: isHovered ? -20 : -32,
            scale: isHovered ? 1.1 : 1,
            y: isHovered ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="pointer-events-none absolute -bottom-6 -right-6 text-[6rem] leading-none opacity-10 select-none"
        >
          {decorationEmoji}
        </motion.div>

        <div className="relative w-full flex flex-col gap-2">
          <div className={cn('relative flex flex-row items-center gap-2 md:gap-4 mb-4')}>
            <Badge
              className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max"
              size="sm"
              square
              variant="default"
            >
              <IconPresentationFilled size={32} />
            </Badge>
            <div className="flex flex-col items-start gap-2">
              <h6 className="tracking-wide text-foreground">{title}</h6>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-1">
            {displayData.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
                <Badge
                  className="px-1.5 py-0.5 relative font-semibold tabular-nums bg-[#ffd3ad] text-stone-900"
                  size="xs"
                  variant="default"
                >
                  {item.count.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>

          {data.length > maxItems && (
            <div className="relative flex mt-2">
              <Button
                variant="secondary"
                size="xs"
                className="py-1.5 rounded-full cursor-pointer"
                render={<a href="#categories" />}
              >
                <span className="capitalize text-xs font-medium">+{data.length - maxItems} see more</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Frame>
  )
}
