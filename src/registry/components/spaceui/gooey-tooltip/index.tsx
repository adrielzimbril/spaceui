'use client'

import * as React from 'react'
import { motion, useMotionValue } from 'motion/react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { cn } from '@/registry/lib/utils'

const bubbleSpring = { type: 'spring' as const, stiffness: 200, damping: 20 }

export interface GooeyTooltipProps {
  label?: string
  tooltipLabel?: string
  className?: string
}

export function GooeyTooltip({ label = 'Hover me', tooltipLabel = 'Gooey tooltip!', className }: GooeyTooltipProps) {
  const filterId = React.useId().replace(/:/g, '')
  const [isHovered, setIsHovered] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      mouseX.set(e.clientX - rect.left - rect.width / 2)
      mouseY.set(e.clientY - rect.top - rect.height / 2)
    }

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove)
    } else {
      mouseX.set(0)
      mouseY.set(-70)
    }

    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isHovered, mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-64 w-64 items-center justify-center', className)}
      style={{ filter: `url(#${filterId})` }}
    >
      <svg className="absolute size-0" aria-hidden="true">
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -8" result="gooey" />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </svg>

      <Button
        render={<motion.button type="button" whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.9 }} />}
        className="relative z-10 rounded-full text-background"
        size="lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
      </Button>

      <motion.div
        className="pointer-events-none absolute z-0 flex items-center justify-center whitespace-nowrap rounded-full bg-foreground px-6 py-3 font-medium text-background shadow-xl"
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.5,
          x: isHovered ? mouseX.get() : 0,
          y: isHovered ? mouseY.get() : 0,
        }}
        transition={bubbleSpring}
      >
        <span className="relative z-20">{tooltipLabel}</span>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute z-0 size-8 rounded-full bg-foreground"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          x: isHovered ? mouseX.get() * 0.5 : 0,
          y: isHovered ? mouseY.get() * 0.5 : 0,
        }}
        transition={bubbleSpring}
      />
    </div>
  )
}
