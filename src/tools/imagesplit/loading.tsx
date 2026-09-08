'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconLoader2,
  IconPhoto,
  IconLayersIntersect,
  IconLayoutColumns,
  IconCut,
  IconSparkles,
} from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'

export interface ImagePreviewLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg'
  label?: string
}

const ICONS = [
  { id: 'loader', component: IconLoader2, spin: true },
  { id: 'photo', component: IconPhoto, spin: false },
  { id: 'layers', component: IconLayersIntersect, spin: false },
  { id: 'columns', component: IconLayoutColumns, spin: false },
  { id: 'cut', component: IconCut, spin: false },
  { id: 'sparkles', component: IconSparkles, spin: false },
]

const sizeMap = {
  sm: 'size-4',
  default: 'size-5',
  lg: 'size-6',
}

export function ImagePreviewLoading({ size = 'default', className, ...props }: ImagePreviewLoadingProps) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ICONS.length)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  const current = ICONS[index]
  const IconComponent = current.component

  return (
    <div
      role="status"
      className={cn(
        'flex size-full min-h-[140px] items-center justify-center text-muted-foreground select-none',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current.id}
              initial={{ scale: 0.4, opacity: 0, filter: 'blur(4px)', rotate: -20 }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0, filter: 'blur(4px)', rotate: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center text-muted-foreground/80"
            >
              <IconComponent className={cn(sizeMap[size], current.spin && 'animate-spin')} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
