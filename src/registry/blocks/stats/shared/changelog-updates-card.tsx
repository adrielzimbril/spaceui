'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { IconSparklesFilled, IconStarFilled, IconBugFilled, IconSettingsFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'
import type { ChangelogItem } from './types'

export interface ChangelogUpdatesCardProps {
  count?: number
  changelog: ChangelogItem[]
  className?: string
}

export function ChangelogUpdatesCard({ count, changelog, className }: ChangelogUpdatesCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const typeIcons = {
    milestone: IconSparklesFilled,
    feature: IconStarFilled,
    fix: IconBugFilled,
    improvement: IconSettingsFilled,
  }

  const typeColors = {
    milestone: 'text-green-500',
    feature: 'text-amber-500',
    fix: 'text-red-500',
    improvement: 'text-blue-500',
  }

  const recentItems = [...changelog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

  const getTopPosition = (index: number) => {
    const basePosition = -5
    const spacing = 42
    return `${basePosition + index * spacing}px`
  }

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full min-h-54 bg-muted squircle-6xl/100 border-0 overflow-hidden p-4', className)}
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
          className="pointer-events-none absolute -bottom-6 -right-6 text-[6rem] leading-none opacity-20 select-none"
        >
          ✨
        </motion.div>

        <div className="border-px absolute z-20 left-1/2 top-0 h-full w-2 -translate-x-1/2 transform border-x border-border/10 bg-border/35" />

        <div className="relative flex-1 items-start w-full">
          <motion.div
            animate={{
              y: isHovered ? -120 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 18,
            }}
            className="absolute left-0 right-0 top-0"
          >
            {recentItems.map((item, index) => {
              const itemType = (item.type || 'feature') as keyof typeof typeIcons
              const Icon = typeIcons[itemType] || IconSparklesFilled

              return (
                <motion.div
                  key={item.id || item.version || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="absolute"
                  style={{
                    top: getTopPosition(index),
                    ...(index % 2 === 1 ? { left: 'calc(50% + 6px)' } : { right: 'calc(50% + 6px)' }),
                  }}
                >
                  <span
                    className={cn(
                      'absolute top-[14px] h-px w-[8px] bg-border',
                      index % 2 === 1 ? 'left-[-6px]' : 'right-[-6px]',
                    )}
                  />
                  <div className="z-20 inline-block w-[100px] space-y-px squircle-2xl/100 bg-background border-2 border-muted px-2 py-1.5 text-xs overflow-hidden">
                    <div className="flex items-center gap-1">
                      <Badge className="p-[0.075rem] relative" size="sm" square>
                        <Icon className={cn(typeColors[itemType])} size={12} />
                      </Badge>
                      <div className="flex flex-col items-start">
                        <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-foreground leading-none">
                          {item.version}
                        </p>
                        <time dateTime={item.date} className="text-[0.5rem] text-muted-foreground leading-none">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-muted/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-38 bg-gradient-to-t from-muted via-background to-transparent" />

        <div className="relative flex flex-col items-start w-full z-30 mt-auto pointer-events-none">
          <div className="relative flex flex-row items-center gap-2">
            <Badge
              className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max"
              size="sm"
              square
              variant="default"
            >
              <IconSparklesFilled size={32} />
            </Badge>
            <div className="flex flex-col items-start gap-1">
              <h6 className="tracking-wide text-foreground font-medium">Changelog</h6>
              <p className="flex gap-1 text-xs text-muted-foreground">
                <span className="text-xs text-muted-foreground">{count || changelog.length} updates</span>
              </p>
            </div>
          </div>
        </div>

        <a href="#changelog" className="absolute size-full top-0 left-0 z-30" />
      </Card>
    </Frame>
  )
}
