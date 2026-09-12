'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'

export interface StatCardProps {
  label: string
  value: number | string
  suffix?: string
  icon?: React.ReactNode
  decoration?: string
  decorationPattern?: string
  description?: string
  delay?: number
  className?: string
  decorations?: Array<{ x: string; y: string; rotate: number; delay: number }>
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  decoration,
  decorationPattern,
  description,
  delay = 0,
  className,
  decorations = [
    { x: '10%', y: '20%', rotate: -15, delay: 0 },
    { x: '75%', y: '15%', rotate: 10, delay: 0.1 },
    { x: '85%', y: '60%', rotate: -8, delay: 0.2 },
    { x: '15%', y: '70%', rotate: 12, delay: 0.3 },
  ],
}: StatCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('size-full bg-muted squircle-6xl/100 border-0 overflow-hidden p-4', className)}
    >
      <Card className="relative flex flex-col size-full items-center justify-center gap-4 md:gap-8 p-4 squircle-2xl/100 md:squircle-4xl/100 bg-background border-0 overflow-hidden">
        {decoration && (
          <motion.div
            animate={{
              rotate: isHovered ? -20 : -32,
              scale: isHovered ? 1.1 : 1,
              y: isHovered ? -10 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="pointer-events-none absolute -bottom-6 -right-6 text-[6rem] leading-none opacity-20 select-none"
          >
            {decoration}
          </motion.div>
        )}
        {decorationPattern && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
            {decorations.map((deco, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: deco.rotate - 20 }}
                animate={{
                  opacity: isHovered ? 0.2 : 0.1,
                  scale: isHovered ? 1.2 : 1,
                  rotate: isHovered ? deco.rotate + 10 : deco.rotate,
                  y: isHovered ? -8 : 0,
                }}
                transition={{
                  opacity: { duration: 0.4, delay: delay + deco.delay },
                  scale: { type: 'spring', stiffness: 200, damping: 15 },
                  rotate: { type: 'spring', stiffness: 200, damping: 15 },
                  y: { type: 'spring', stiffness: 200, damping: 15 },
                }}
                className="absolute text-2xl"
                style={{ left: deco.x, top: deco.y }}
              >
                {decorationPattern}
              </motion.span>
            ))}
          </div>
        )}
        <div className="relative w-full flex flex-col gap-2 z-10">
          <div className={cn('relative flex flex-row items-center gap-2 md:gap-4')}>
            {icon && (
              <Badge
                className={cn(
                  'capitalize text-xs font-medium',
                  decorationPattern ? 'bg-[#8e8eff] text-white size-max' : 'bg-[#ffd3ad] text-stone-900 size-max',
                )}
                variant="default"
                size="sm"
                square
              >
                {icon}
              </Badge>
            )}
            <div className="flex flex-col items-start gap-2">
              <h6 className="tracking-wide text-foreground">{label}</h6>
              <p className="text-sm text-muted-foreground leading-[120%]">
                {value} {suffix}
              </p>
            </div>
          </div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </Card>
    </Frame>
  )
}
