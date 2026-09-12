'use client'

import * as React from 'react'
import { IconPin, IconPinFilled } from '@tabler/icons-react'
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react'
import { cn } from '@/registry/lib/utils'

export type PinListItem = {
  id: number | string
  name: string
  info?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  pinned: boolean
}

export type PinListProps = {
  items: PinListItem[]
  labels?: {
    pinned?: string
    unpinned?: string
  }
  transition?: Transition
  labelMotionProps?: HTMLMotionProps<'div'>
  className?: string
  labelClassName?: string
  pinnedSectionClassName?: string
  unpinnedSectionClassName?: string
  zIndexResetDelay?: number
  onPinChange?: (items: PinListItem[]) => void
  onItemClick?: (item: PinListItem) => void
} & Omit<HTMLMotionProps<'div'>, 'children'>

function renderIcon(icon: React.ComponentType<{ className?: string }> | React.ReactNode) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (typeof icon === 'function' || typeof icon === 'object') {
    const IconComponent = icon as React.ComponentType<{ className?: string }>
    return <IconComponent className="size-4.5" />
  }
  return null
}

export function PinList({
  items,
  labels = { pinned: 'Pinned Items', unpinned: 'All Items' },
  transition,
  labelMotionProps,
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  onPinChange,
  onItemClick,
  ...props
}: PinListProps) {
  const [listItems, setListItems] = React.useState<PinListItem[]>(items)
  const [togglingGroup, setTogglingGroup] = React.useState<'pinned' | 'unpinned' | null>(null)
  const reduced = useReducedMotion() ?? false

  // Keep internal state in sync if external items change
  React.useEffect(() => {
    setListItems(items)
  }, [items])

  const defaultTransition: Transition = reduced
    ? { duration: 0 }
    : { type: 'spring', stiffness: 320, damping: 22, mass: 0.8 }

  const springTransition = transition ?? defaultTransition

  const pinned = listItems.filter((u) => u.pinned)
  const unpinned = listItems.filter((u) => !u.pinned)

  const toggleStatus = (id: number | string) => {
    const item = listItems.find((u) => u.id === id)
    if (!item) return

    setTogglingGroup(item.pinned ? 'pinned' : 'unpinned')
    setListItems((prev) => {
      const idx = prev.findIndex((u) => u.id === id)
      if (idx === -1) return prev
      const updated = [...prev]
      const [target] = updated.splice(idx, 1)
      if (!target) return prev
      const toggled = { ...target, pinned: !target.pinned }
      if (toggled.pinned) updated.push(toggled)
      else updated.unshift(toggled)
      onPinChange?.(updated)
      return updated
    })

    setTimeout(() => setTogglingGroup(null), zIndexResetDelay)
  }

  const handleToggle = (id: number | string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    toggleStatus(id)
  }

  return (
    <motion.div className={cn('flex w-full select-none flex-col gap-6', className)} {...props}>
      <LayoutGroup>
        {/* Pinned Section */}
        <AnimatePresence initial={false}>
          {pinned.length > 0 && (
            <motion.div
              key="pinned-section"
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 22 }}
              className="space-y-2"
              {...labelMotionProps}
            >
              <div className={cn('flex items-center justify-between px-2', labelClassName)}>
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground">
                  <span>{labels.pinned}</span>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {pinned.length}
                </span>
              </div>

              <div
                className={cn(
                  'relative flex flex-col gap-1 rounded-2xl bg-muted p-1.5 backdrop-blur-xs',
                  togglingGroup === 'pinned' ? 'z-20' : 'z-10',
                  pinnedSectionClassName,
                )}
              >
                {pinned.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`pin-item-${item.id}`}
                    layout
                    transition={springTransition}
                    whileHover={reduced ? undefined : { scale: 1.01 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    onClick={(e) => {
                      if (onItemClick) onItemClick(item)
                      else handleToggle(item.id, e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (onItemClick) onItemClick(item)
                        else handleToggle(item.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item.name}, pinned`}
                    className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-background p-2.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.icon ? (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                          {renderIcon(item.icon)}
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold tracking-tight text-foreground">{item.name}</div>
                        {item.info ? (
                          <div className="truncate text-xs font-medium text-muted-foreground">{item.info}</div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Unpin ${item.name}`}
                      onClick={(e) => handleToggle(item.id, e)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-110 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground"
                    >
                      <IconPinFilled className="size-3.5 rotate-45" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unpinned Section */}
        <AnimatePresence initial={false}>
          {unpinned.length > 0 && (
            <motion.div
              key="unpinned-section"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0 }}
              className="space-y-2"
              {...labelMotionProps}
            >
              <div className={cn('flex items-center justify-between px-2', labelClassName)}>
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">{labels.unpinned}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {unpinned.length}
                </span>
              </div>

              <div
                className={cn(
                  'relative flex flex-col gap-1 rounded-2xl bg-muted p-1.5 backdrop-blur-xs',
                  togglingGroup === 'unpinned' ? 'z-20' : 'z-10',
                  unpinnedSectionClassName,
                )}
              >
                {unpinned.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`pin-item-${item.id}`}
                    layout
                    transition={springTransition}
                    whileHover={reduced ? undefined : { scale: 1.01 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    onClick={(e) => {
                      if (onItemClick) onItemClick(item)
                      else handleToggle(item.id, e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (onItemClick) onItemClick(item)
                        else handleToggle(item.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${item.name}, unpinned`}
                    className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-background p-2.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.icon ? (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                          {renderIcon(item.icon)}
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold tracking-tight text-foreground">{item.name}</div>
                        {item.info ? (
                          <div className="truncate text-xs font-medium text-muted-foreground">{item.info}</div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Pin ${item.name}`}
                      onClick={(e) => handleToggle(item.id, e)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:scale-110 hover:bg-foreground hover:text-background active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground"
                    >
                      <IconPin className="size-3.5 -rotate-45" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  )
}
