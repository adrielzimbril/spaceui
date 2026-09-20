'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/registry/lib/utils'

const dragSpring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export interface GooeyBlobsProps {
  className?: string
  blobClassName?: string
}

export function GooeyBlobs({ className, blobClassName }: GooeyBlobsProps) {
  const filterId = React.useId().replace(/:/g, '')

  return (
    <div className={cn('relative flex h-64 w-full items-center justify-center', className)}>
      <svg className="absolute size-0" aria-hidden="true">
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7" />
        </filter>
      </svg>

      <div className="relative flex flex-col items-center justify-end" style={{ filter: `url(#${filterId})` }}>
        <motion.div
          drag
          dragConstraints={{ top: -100, bottom: 100, left: -100, right: 100 }}
          dragElastic={0.2}
          initial={{ y: 0, width: 50, height: 50, borderRadius: 40 }}
          animate={{
            y: -60,
            width: 200,
            height: 100,
            borderRadius: 10,
            transition: { ...dragSpring, delay: 0.15, y: { ...dragSpring, delay: 0 } },
          }}
          className={cn('absolute z-0 cursor-grab bg-foreground active:cursor-grabbing', blobClassName)}
        />
        <motion.div
          drag
          dragConstraints={{ top: -100, bottom: 100, left: -100, right: 100 }}
          dragElastic={0.2}
          className={cn(
            'relative z-10 size-12 cursor-grab rounded-full bg-foreground active:cursor-grabbing',
            blobClassName,
          )}
        />
      </div>
    </div>
  )
}
