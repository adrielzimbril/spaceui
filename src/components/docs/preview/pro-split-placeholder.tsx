'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconComponents,
  IconLayersIntersect,
  IconAtom,
  IconBox,
  IconTerminal2,
  IconGalaxy,
  IconRocket,
} from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'

const PRO_ICONS = [
  { id: 'components', component: IconComponents },
  { id: 'layers', component: IconLayersIntersect },
  { id: 'atom', component: IconAtom },
  { id: 'box', component: IconBox },
  { id: 'terminal', component: IconTerminal2 },
  { id: 'galaxy', component: IconGalaxy },
  { id: 'rocket', component: IconRocket },
]

export function ProSplitPlaceholder({ className }: { className?: string }) {
  const [iconIndex, setIconIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % PRO_ICONS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const current = PRO_ICONS[iconIndex]
  const CurrentIcon = current.component

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-4 min-h-75 select-none text-center',
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current.id}
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(4px)', rotate: -20 }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)', rotate: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center text-muted-foreground/80"
          >
            <CurrentIcon className="size-9" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
        <span className="relative flex size-2 items-center justify-center shrink-0">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span>Active on Canvas Stage</span>
      </div>
    </div>
  )
}
