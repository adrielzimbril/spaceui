'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconSparkles } from '@tabler/icons-react'
import { GlassButton } from '@/registry/components/spaceui/glass-button'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'

export default function Demo() {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div className="relative squircle rounded-2xl bg-muted flex w-full items-center justify-center overflow-hidden rounded-2xl p-16">
      <SilkGradient
        className="absolute inset-0 size-full"
        color1="#f97316"
        color2="#ec4899"
        color3="#8b5cf6"
        animate
        speed={1}
        grain
      />
      <GlassButton
        size="icon-lg"
        className="w-10 justify-start px-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        render={
          <motion.button
            type="button"
            animate={{ width: hovered ? 168 : 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          />
        }
      >
        <span className="flex shrink-0 items-center justify-center pl-2.5">
          <IconSparkles className="size-4.5" />
        </span>
        <AnimatePresence>
          {hovered && (
            <motion.span
              key="label"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 0.35, delay: 0.1 } }}
              exit={{ opacity: 0, filter: 'blur(6px)', transition: { duration: 0.15 } }}
              className="whitespace-nowrap pr-4 text-sm font-medium"
            >
              Try it now
            </motion.span>
          )}
        </AnimatePresence>
      </GlassButton>
    </div>
  )
}
