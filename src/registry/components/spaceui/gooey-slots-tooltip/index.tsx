'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { cn } from '@/registry/lib/utils'

export interface GooeySlotsTooltipProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function GooeySlotsTooltip({ trigger, children, className }: GooeySlotsTooltipProps) {
  const filterId = React.useId().replace(/:/g, '')
  const [isHovered, setIsHovered] = React.useState(false)

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 32,
    transition: 'all 0.5s',
    backgroundColor: 'var(--foreground)',
  }

  const growState = {
    height: isHovered ? 257 : '100%',
    width: isHovered ? 288 : '100%',
    translateY: isHovered ? -272 : 0,
    translateX: isHovered ? -5 : 0,
  }

  return (
    <div className={cn('relative', className)} style={{ width: 40, height: 40 }}>
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
          <motion.div
            className="[corner-shape:superellipse(1.25)]"
            style={panelStyle}
            initial={false}
            animate={{
              ...growState,
              transition: {
                height: { type: 'tween', ease: 'easeIn', duration: 0.6, delay: isHovered ? 0.2 : 0 },
                width: { type: 'tween', ease: 'easeIn', duration: 0.6, delay: isHovered ? 0.15 : 0 },
                default: { type: 'tween', ease: 'easeIn', duration: 0.2 },
              },
            }}
          />
          <div className="[corner-shape:superellipse(1.25)] absolute inset-0 bg-foreground" />
        </div>

        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <motion.div
            className="[corner-shape:superellipse(1.25)]"
            style={{ ...panelStyle, borderRadius: 24, overflow: 'hidden', color: 'var(--background)' }}
            initial={false}
            animate={{
              ...growState,
              opacity: isHovered ? 1 : 0,
              transition: {
                height: { type: 'tween', ease: 'easeIn', duration: 0.6, delay: isHovered ? 0.2 : 0 },
                width: { type: 'tween', ease: 'easeIn', duration: 0.6, delay: isHovered ? 0.15 : 0 },
                opacity: { type: 'tween', duration: isHovered ? 0.6 : 0.1, delay: isHovered ? 0.35 : 0 },
                default: { type: 'tween', ease: 'easeIn', duration: 0.2 },
              },
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      <Button
        size="icon-lg"
        aria-haspopup="dialog"
        aria-expanded={isHovered}
        className="relative z-10 rounded-full text-background"
        squircle={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {trigger}
      </Button>

      <svg className="absolute size-0" aria-hidden="true">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
        </filter>
      </svg>
    </div>
  )
}
