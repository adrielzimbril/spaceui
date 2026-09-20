'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { cn } from '@/registry/lib/utils'

const popoverSpring = { type: 'spring' as const, stiffness: 300, damping: 30 }
const REST_SIZE = 40

export interface GooeyInfoPopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  panelClassName?: string
  panelWidth?: number
  panelHeight?: number
}

export function GooeyInfoPopover({
  trigger,
  children,
  className,
  panelClassName,
  panelWidth = 220,
  panelHeight = 120,
}: GooeyInfoPopoverProps) {
  const filterId = React.useId().replace(/:/g, '')
  const [hovered, setHovered] = React.useState(false)

  const centerLeft = (size: number) => REST_SIZE / 2 - size / 2

  const shapeAnimate = hovered
    ? {
        left: centerLeft(panelWidth),
        y: -50,
        width: panelWidth,
        height: panelHeight,
        borderRadius: 16,
        transition: { ...popoverSpring, delay: 0.15, y: { ...popoverSpring, delay: 0 } },
      }
    : {
        left: centerLeft(REST_SIZE),
        y: 0,
        width: REST_SIZE,
        height: REST_SIZE,
        borderRadius: 20,
        transition: { ...popoverSpring, y: { ...popoverSpring, delay: 0.15 } },
      }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg className="absolute size-0" aria-hidden="true">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" />
        </filter>
      </svg>

      <div className="pointer-events-none absolute bottom-0 left-0" style={{ filter: `url(#${filterId})` }}>
        <motion.div
          initial={false}
          animate={shapeAnimate}
          className={cn('absolute bottom-0 bg-foreground', panelClassName)}
        />
        <div className="absolute bottom-0 left-0 size-10 rounded-full bg-foreground" />
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -50, scale: 1, transition: { ...popoverSpring, delay: 0.15 } }}
            exit={{ opacity: 0, y: 0, scale: 0.7, transition: { ...popoverSpring, delay: 0 } }}
            style={{ left: centerLeft(panelWidth), width: panelWidth, height: panelHeight }}
            className="pointer-events-none absolute bottom-0 flex flex-col justify-center overflow-hidden rounded-2xl p-4 text-background"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon-lg"
        aria-haspopup="dialog"
        aria-expanded={hovered}
        className="relative z-10 [corner-shape:superellipse(1.25)] rounded-full text-background"
        squircle={false}
      >
        {trigger}
      </Button>
    </div>
  )
}
