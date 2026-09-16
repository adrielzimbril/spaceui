'use client'

import { useId, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'
import { Button } from '@/registry/primitives/button'
import { useAutoHeight } from '@/registry/hooks/animation/use-auto-height'

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

const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 20 }
const RADIUS = 16

function BouncyAccordionRow({
  item,
  contentId,
  isOpen,
  isTopRounded,
  isBottomRounded,
  reduced,
  onToggle,
}: {
  item: BouncyAccordionItem
  contentId: string
  isOpen: boolean
  isTopRounded: boolean
  isBottomRounded: boolean
  reduced: boolean
  onToggle: () => void
}) {
  const { ref, height } = useAutoHeight<HTMLDivElement>()
  const transition = reduced ? { duration: 0 } : SPRING

  return (
    <motion.li
      initial={false}
      animate={{
        marginBlock: isOpen ? '10px' : '0px',
        borderTopLeftRadius: isTopRounded ? `${RADIUS}px` : '0px',
        borderTopRightRadius: isTopRounded ? `${RADIUS}px` : '0px',
        borderBottomRightRadius: isBottomRounded ? `${RADIUS}px` : '0px',
        borderBottomLeftRadius: isBottomRounded ? `${RADIUS}px` : '0px',
      }}
      transition={transition}
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
        onClick={onToggle}
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
      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={`${contentId}-trigger`}
        initial={false}
        animate={{ height: isOpen ? height : 0 }}
        transition={transition}
        className="overflow-hidden pt-2"
      >
        <motion.div
          ref={ref}
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, filter: isOpen ? 'blur(0px)' : 'blur(2px)' }}
          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
          className="rounded-lg bg-background px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {item.description}
        </motion.div>
      </motion.div>
    </motion.li>
  )
}

export function BouncyAccordion({ items, defaultValue = 0, value, onValueChange, className }: BouncyAccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue)
  const active = value !== undefined ? value : uncontrolled
  const reduced = useReducedMotion() ?? false
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
          const isTopRounded = index === 0 || isOpen || (active !== null && index === active + 1)
          const isBottomRounded = index === items.length - 1 || isOpen || (active !== null && index === active - 1)

          return (
            <BouncyAccordionRow
              key={item.title}
              item={item}
              contentId={`${baseId}-${index}`}
              isOpen={isOpen}
              isTopRounded={isTopRounded}
              isBottomRounded={isBottomRounded}
              reduced={reduced}
              onToggle={() => setActive(isOpen ? null : index)}
            />
          )
        })}
      </ul>
    </div>
  )
}
