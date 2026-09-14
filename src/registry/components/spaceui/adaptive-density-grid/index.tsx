'use client'

import * as React from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type Transition,
} from 'motion/react'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'
import { cn } from '@/registry/lib/utils'

export type GridDensity = 'compact' | 'normal' | 'relaxed' | 'spacious' | number

export interface DensityOption {
  id: string | number
  label: React.ReactNode
  icon?: React.ReactNode
  columns?: {
    desktop: number
    tablet?: number
    mobile?: number
  }
  gap?: string
}

export interface AdaptiveDensityGridProps<T = any> {
  /** Items to render in the grid */
  items?: T[]
  /** Render function for each item */
  renderItem?: (item: T, index: number, state: { isRearranging: boolean }) => React.ReactNode
  /** Direct children instead of items array */
  children?: React.ReactNode
  /** Available layout options / tabs */
  options?: DensityOption[]
  /** Currently active option id */
  activeId?: string | number
  /** Default active option id */
  defaultActiveId?: string | number
  /** Callback when active option changes */
  onOptionChange?: (id: string | number) => void
  /** Show controls bar */
  showControls?: boolean
  /** Custom controls slot (e.g. right aligned search or filter) */
  controlsExtra?: React.ReactNode
  /** Stagger delay between tiles during layout reflow in seconds (default: 0.012) */
  staggerDelay?: number
  /** Rearrange transition duration in seconds (default: 0.5) */
  duration?: number
  /** Extra class for container */
  className?: string
  /** Extra class for the grid wrapper */
  gridClassName?: string
  /** Extra class for the controls bar */
  controlsClassName?: string
  /** Maximum grid height with scroll */
  gridMaxHeight?: string
  /** Enable memory protection with content-visibility */
  memoryOptimized?: boolean
}

const DEFAULT_OPTIONS: DensityOption[] = [
  {
    id: 'spacious',
    label: 'Spacious',
    columns: { desktop: 2, tablet: 2, mobile: 1 },
    gap: 'clamp(1rem, 2vw, 1.5rem)',
  },
  {
    id: 'normal',
    label: 'Normal',
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
  },
  {
    id: 'compact',
    label: 'Compact',
    columns: { desktop: 4, tablet: 3, mobile: 2 },
    gap: 'clamp(0.5rem, 1vw, 0.875rem)',
  },
]

export function AdaptiveDensityGrid<T = any>({
  items,
  renderItem,
  children,
  options = DEFAULT_OPTIONS,
  activeId: controlledActiveId,
  defaultActiveId,
  onOptionChange,
  showControls = true,
  controlsExtra,
  staggerDelay = 0.012,
  duration = 0.55,
  className,
  gridClassName,
  controlsClassName,
  gridMaxHeight,
  memoryOptimized = true,
}: AdaptiveDensityGridProps<T>) {
  const shouldReduceMotion = useReducedMotion()

  const initialId = controlledActiveId ?? defaultActiveId ?? options[0]?.id ?? 'normal'
  const [internalActiveId, setInternalActiveId] = React.useState<string | number>(initialId)
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId

  const [isRearranging, setIsRearranging] = React.useState(false)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  const activeOption = React.useMemo(() => {
    return options.find((opt) => String(opt.id) === String(activeId)) ?? options[0]
  }, [options, activeId])

  // Responsive column count calculation
  const columnCount = React.useMemo(() => {
    if (!activeOption?.columns) return 3

    const { desktop, tablet, mobile } = activeOption.columns
    if (containerWidth > 0 && containerWidth < 640) {
      return mobile ?? 1
    }
    if (containerWidth > 0 && containerWidth < 1024) {
      return tablet ?? Math.max(1, desktop - 1)
    }
    return desktop
  }, [activeOption, containerWidth])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })

    resizeObserver.observe(root)
    return () => resizeObserver.disconnect()
  }, [])

  // Rearrange animation timer
  React.useEffect(() => {
    if (!isRearranging) return

    const itemCount = items ? items.length : React.Children.count(children)
    const totalStaggerMs = Math.max(0, itemCount - 1) * staggerDelay * 1000

    const timeout = window.setTimeout(
      () => setIsRearranging(false),
      shouldReduceMotion ? 0 : duration * 1000 + totalStaggerMs,
    )

    return () => window.clearTimeout(timeout)
  }, [isRearranging, items, children, staggerDelay, duration, shouldReduceMotion])

  const handleSelectOption = (id: string | number) => {
    if (String(id) === String(activeId)) return

    if (controlledActiveId === undefined) {
      setInternalActiveId(id)
    }
    onOptionChange?.(id)

    if (!shouldReduceMotion) {
      setIsRearranging(true)
    }
  }

  const springTransition: Transition = {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.75,
  }

  // 2D diagonal wave stagger calculation based on current column count
  const getStaggerDelay = (index: number) => {
    const cols = Math.max(1, columnCount)
    const row = Math.floor(index / cols)
    const col = index % cols
    return Math.min(row * 0.022 + col * 0.014, 0.26)
  }

  const renderContent = () => {
    if (items && renderItem) {
      return (
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, index) => {
            const itemKey = ((item as any)?.id ?? (item as any)?.key ?? index) as React.Key
            const delay = getStaggerDelay(index)

            return (
              <motion.div
                key={itemKey}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8, transition: { duration: 0.2 } }}
                className={cn('relative min-w-0 rounded-xl', memoryOptimized && '[content-visibility:auto]')}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        layout: {
                          ...springTransition,
                          delay,
                        },
                        opacity: { duration: 0.24 },
                        scale: { duration: 0.28 },
                      }
                }
              >
                <motion.div
                  animate={{
                    opacity: 1,
                    scale: isRearranging && !shouldReduceMotion ? 0.982 : 1,
                    y: isRearranging && !shouldReduceMotion ? -1 : 0,
                    filter: isRearranging && !shouldReduceMotion ? 'blur(3px)' : 'blur(0px)',
                  }}
                  className="relative min-w-0 origin-center h-full rounded-xl"
                  transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {renderItem(item, index, { isRearranging })}
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      )
    }

    if (children) {
      return (
        <AnimatePresence mode="popLayout" initial={false}>
          {React.Children.map(children, (child, index) => {
            const childKey = (React.isValidElement(child) ? child.key : index) ?? index
            const delay = getStaggerDelay(index)

            return (
              <motion.div
                key={childKey}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8, transition: { duration: 0.2 } }}
                className={cn('relative min-w-0 rounded-xl', memoryOptimized && '[content-visibility:auto]')}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        layout: {
                          ...springTransition,
                          delay,
                        },
                        opacity: { duration: 0.24 },
                        scale: { duration: 0.28 },
                      }
                }
              >
                <motion.div
                  animate={{
                    opacity: 1,
                    scale: isRearranging && !shouldReduceMotion ? 0.982 : 1,
                    y: isRearranging && !shouldReduceMotion ? -1 : 0,
                    filter: isRearranging && !shouldReduceMotion ? 'blur(3px)' : 'blur(0px)',
                  }}
                  className="relative min-w-0 origin-center h-full rounded-xl"
                  transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {child}
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      )
    }

    return null
  }

  return (
    <div ref={rootRef} className={cn('relative w-full min-w-0 space-y-6', className)}>
      {showControls && (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', controlsClassName)}>
          <Tabs value={String(activeId)} onValueChange={(val) => handleSelectOption(val)}>
            <TabsList size="sm">
              {options.map((option) => (
                <TabsTab key={option.id} value={String(option.id)} className="gap-1.5">
                  {option.icon}
                  <span>{option.label}</span>
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>

          {controlsExtra && <div className="flex items-center gap-3">{controlsExtra}</div>}
        </div>
      )}

      <div
        className={cn('min-h-0 min-w-0', gridMaxHeight && 'overflow-y-auto overscroll-contain')}
        style={{ maxHeight: gridMaxHeight }}
      >
        <motion.div
          layout
          className={cn('grid min-w-0 items-start', gridClassName)}
          style={{
            gap: activeOption?.gap ?? 'clamp(1rem, 2vw, 1.5rem)',
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
          transition={shouldReduceMotion ? { duration: 0 } : springTransition}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}
