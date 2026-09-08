'use client'

import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'
import { Button } from '@/registry/primitives/button'

export type BouncyAccordionItem = {
  icon?: ReactNode
  title: string
  description: ReactNode
}

export type BouncyAccordionProps = {
  items: BouncyAccordionItem[]
  defaultValue?: number | null
  value?: number | null
  onValueChange?: (index: number | null) => void
  className?: string
}

export function BouncyAccordion({ items, defaultValue = 0, value, onValueChange, className }: BouncyAccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue)
  const active = value !== undefined ? value : uncontrolled
  const reduced = useReducedMotion() ?? false
  const radius = 16
  const baseId = useId()

  const setActive = (index: number | null) => {
    onValueChange?.(index)
    if (value === undefined) setUncontrolled(index)
  }

  return (
    <div className={cn('flex w-full select-none flex-col', className)}>
      <ul className="w-full">
        {items.map((item, index) => {
          const isOpen = active === index
          const contentId = `${baseId}-${index}`
          return (
            <motion.li
              key={item.title}
              animate={{
                marginBlock: isOpen ? '10px' : '0px',
                borderTopLeftRadius: index === 0 || isOpen || active === index - 1 ? `${radius}px` : '0px',
                borderTopRightRadius: index === 0 || isOpen || active === index - 1 ? `${radius}px` : '0px',
                borderBottomRightRadius:
                  index === items.length - 1 || isOpen || active === index + 1 ? `${radius}px` : '0px',
                borderBottomLeftRadius:
                  index === items.length - 1 || isOpen || active === index + 1 ? `${radius}px` : '0px',
              }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'relative overflow-hidden border-muted bg-muted p-2 last:border-b-0',
                !isOpen && 'border-b border-b-background',
              )}
            >
              <Button
                id={`${contentId}-trigger`}
                variant="ghost"
                size="xl"
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => setActive(isOpen ? null : index)}
                className="flex w-full items-center justify-start gap-3 bg-background! p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
              >
                {item.icon ? (
                  <span className="shrink-0 rounded-lg aspect-square size-auto bg-muted p-2 text-muted-foreground">
                    {item.icon}
                  </span>
                ) : null}
                <span className="text-sm font-bold tracking-tight text-foreground">{item.title}</span>
                <IconChevronDown
                  className={cn(
                    'ms-auto! size-4 text-muted-foreground transition-transform duration-300 ease-in-out',
                    isOpen && 'rotate-180',
                  )}
                />
              </Button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={contentId}
                    role="region"
                    aria-labelledby={`${contentId}-trigger`}
                    initial={reduced ? false : { opacity: 0, filter: 'blur(2px)', height: 0 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', height: 'auto' }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, filter: 'blur(2px)', height: 0 }}
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
                    className="mt-2 overflow-hidden rounded-lg bg-background px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item.description}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
