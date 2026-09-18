'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconPlus } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'

export type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', text: 'Book the design studio', done: false },
  { id: '2', text: 'Review component specs', done: false },
  { id: '3', text: 'Select typography scale', done: false },
]

export type InteractiveChecklistProps = {
  items?: ChecklistItem[]
  defaultItems?: ChecklistItem[]
  onChange?: (items: ChecklistItem[]) => void
  bounce?: number
  corner?: number
  boxSize?: number
  className?: string
}

const ROW_HEIGHT = 40
const PADDING_X = 14
const CARD_WIDTH = 300
const MAX_ITEMS = 5
const RESET_DELAY = 3000

export function InteractiveChecklist({
  items: controlledItems,
  defaultItems = DEFAULT_CHECKLIST_ITEMS,
  onChange,
  bounce = 50,
  corner = 18,
  boxSize = 18,
  className,
}: InteractiveChecklistProps) {
  const [internalItems, setInternalItems] = React.useState<ChecklistItem[]>(defaultItems)
  const [isAdding, setIsAdding] = React.useState(false)
  const [newText, setNewText] = React.useState('')

  const isControlled = controlledItems !== undefined
  const items = isControlled ? controlledItems : internalItems

  const allDone = items.length > 0 && items.every((item) => item.done)
  const canAddMore = items.length < MAX_ITEMS

  React.useEffect(() => {
    if (!allDone) return
    const timer = window.setTimeout(() => {
      const reset = items.map((item) => ({ ...item, done: false }))
      if (!isControlled) setInternalItems(reset)
      onChange?.(reset)
    }, RESET_DELAY)
    return () => window.clearTimeout(timer)
  }, [allDone, items, isControlled, onChange])

  const toggleItem = (id: string) => {
    const next = items.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    if (!isControlled) setInternalItems(next)
    onChange?.(next)
  }

  const handleAddTask = () => {
    const trimmed = newText.trim()
    setIsAdding(false)
    setNewText('')
    if (trimmed && canAddMore) {
      const next = [...items, { id: String(Date.now()), text: trimmed, done: false }]
      if (!isControlled) setInternalItems(next)
      onChange?.(next)
    }
  }

  const verticalPadding = 12
  const totalHeight = verticalPadding * 2 + ROW_HEIGHT * (items.length + (canAddMore ? 1 : 0))

  return (
    <div
      className={cn(
        'w-60 select-none font-sans rounded-[var(--chk-r,18px)] p-3.5',
        'bg-muted text-foreground transition-[height] duration-300',
        className,
      )}
      style={
        {
          '--chk-r': `${corner}px`,
          minHeight: totalHeight,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col gap-1">
        {items.map((item, idx) => {
          return (
            <motion.button
              key={item.id}
              type="button"
              role="checkbox"
              aria-checked={item.done}
              onClick={() => toggleItem(item.id)}
              animate={
                allDone
                  ? {
                      y: 12 * (items.length - idx),
                      rotate: idx % 2 === 0 ? -4 : 4,
                      opacity: 0.85,
                    }
                  : {
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                    }
              }
              transition={{
                type: 'spring',
                stiffness: 400 + bounce * 2,
                damping: 26,
              }}
              className="w-full h-10 px-2 rounded-xl flex items-center gap-3 cursor-pointer text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              {/* Checkbox Frame */}
              <div
                style={{ width: boxSize, height: boxSize, borderRadius: boxSize * 0.32 }}
                className={cn(
                  'shrink-0 border flex items-center justify-center transition-colors relative overflow-hidden',
                  item.done ? 'bg-foreground border-foreground text-background' : 'border-muted-foreground/30 bg-card',
                )}
              >
                <motion.span
                  initial={false}
                  animate={{
                    scale: item.done ? 1 : 0,
                    opacity: item.done ? 1 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 28,
                  }}
                  className="flex items-center justify-center"
                >
                  <svg className="w-3 h-3 stroke-current stroke-[2.8] fill-none" viewBox="0 0 16 16">
                    <path d="M3 8.5L6.5 12L13 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              </div>

              {/* Text with animated line-through */}
              <div className="relative min-w-0">
                <span
                  className={cn(
                    'text-[13.5px] font-medium tracking-tight truncate block transition-colors duration-200',
                    item.done ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {item.text}
                </span>
                {/* Strike-through line */}
                <motion.span
                  initial={false}
                  animate={{
                    scaleX: item.done ? 1 : 0,
                    opacity: item.done ? 1 : 0,
                  }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-muted-foreground origin-left pointer-events-none"
                />
              </div>
            </motion.button>
          )
        })}

        {/* Add task row */}
        {canAddMore && !allDone && (
          <div className="h-10 px-2 flex items-center gap-3 mt-1">
            <span
              style={{ width: boxSize, height: boxSize, borderRadius: boxSize * 0.32 }}
              className="shrink-0 border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/60"
            >
              <IconPlus size={13} strokeWidth={2.2} />
            </span>

            {isAdding ? (
              <input
                autoFocus
                value={newText}
                placeholder="New task..."
                maxLength={40}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask()
                  if (e.key === 'Escape') {
                    setIsAdding(false)
                    setNewText('')
                  }
                }}
                onBlur={handleAddTask}
                className="flex-1 bg-transparent border-0 outline-none text-[13.5px] text-foreground placeholder:text-muted-foreground/60"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-[13px] text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
              >
                Add new task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
