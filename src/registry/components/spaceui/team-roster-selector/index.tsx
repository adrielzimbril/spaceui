'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconCheck, IconUserPlus } from '@tabler/icons-react'
import { Avatar } from '@usespaceui/avatars/react'
import NumberFlow from '@number-flow/react'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { toastManager } from '@/registry/primitives/toast'
import { cn } from '@/registry/lib/utils'

export type TeamMember = {
  id: string
  name: string
  handle: string
  role?: string
}

export const DEFAULT_SPACEUI_MEMBERS: TeamMember[] = [
  { id: 'guillermo', name: 'Guillermo Rauch', handle: '@rauchg', role: 'Frontend Architect' },
  { id: 'marc', name: 'Marc Lou', handle: '@marclou', role: 'Product Builder' },
  { id: 'pieter', name: 'Pieter Levels', handle: '@levelsio', role: 'Autonomous Founder' },
  { id: 'jony', name: 'Jony Ive', handle: '@jony', role: 'Industrial Form' },
]

export type TeamRosterSelectorProps = {
  members?: TeamMember[]
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onAction?: (selectedIds: string[]) => void
  actionLabel?: string
  corner?: number
  maxDisplay?: number
  className?: string
}

const ROW_STEP = 50

export function TeamRosterSelector({
  members = DEFAULT_SPACEUI_MEMBERS,
  selectedIds: controlledSelectedIds,
  defaultSelectedIds = ['guillermo'],
  onSelectionChange,
  onAction = (ids) => {
    toastManager.add({
      type: 'success',
      title: 'Members assigned',
      description: `Successfully assigned ${ids.length} member${ids.length > 1 ? 's' : ''}.`,
    })
  },
  actionLabel = 'Assign members',
  corner = 20,
  maxDisplay,
  className,
}: TeamRosterSelectorProps) {
  const displayedMembers = maxDisplay ? members.slice(0, maxDisplay) : members
  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelectedIds)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isControlled = controlledSelectedIds !== undefined
  const selected = isControlled ? controlledSelectedIds : internalSelected

  const toggleMember = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    if (!isControlled) setInternalSelected(next)
    onSelectionChange?.(next)
  }

  const selectedCount = selected.length

  return (
    <div
      className={cn('w-[16.75rem] select-none font-sans flex flex-col gap-2', className)}
      style={
        {
          '--rst-r': `${corner}px`,
          '--rst-pill-r': `${Math.max(8, corner - 10)}px`,
        } as React.CSSProperties
      }
    >
      {/* Container Card — squircle shape */}
      <div
        onPointerLeave={() => setHoveredIndex(null)}
        className="squircle rounded-2xl relative flex flex-col gap-1 p-[0.625rem] bg-muted"
      >
        {/* Floating smooth highlight pill */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              layoutId="rst-hovpill"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: hoveredIndex * ROW_STEP,
              }}
              exit={{ opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 560,
                damping: 32,
                mass: 0.8,
              }}
              className="absolute top-[0.625rem] left-[0.625rem] right-[0.625rem] h-[2.875rem] rounded-[var(--rst-pill-r)] bg-background pointer-events-none z-0"
            />
          )}
        </AnimatePresence>

        {/* Members list */}
        {displayedMembers.map((member, index) => {
          const isSelected = selected.includes(member.id)

          return (
            <button
              key={member.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onClick={() => toggleMember(member.id)}
              className="relative z-10 w-full h-[2.875rem] px-[0.625rem] rounded-[var(--rst-pill-r)] flex items-center gap-[0.625rem] cursor-pointer text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Avatar */}
              <div className="shrink-0 size-[2rem] rounded-full overflow-hidden">
                <Avatar name={member.name} variant="all" size={32} circle />
              </div>

              {/* Name & handle */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[0.8125rem] font-medium text-foreground truncate leading-tight">
                  {member.name}
                </span>
                <span className="text-[0.6875rem] text-muted-foreground truncate leading-tight">{member.handle}</span>
              </div>

              {/* Checkbox indicator — MorphIcon morphs between empty circle and check */}
              <motion.span
                animate={{
                  scale: isSelected ? 1.08 : 1,
                  backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                  borderColor: isSelected ? 'var(--primary)' : 'color-mix(in srgb, currentColor 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'size-[1.375rem] rounded-full border flex items-center justify-center shrink-0',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                <MorphIcon activeKey={isSelected ? 'checked' : 'empty'} variant="spring" duration={0.18}>
                  {isSelected ? <IconCheck className="size-[0.75rem]" strokeWidth={3} /> : null}
                </MorphIcon>
              </motion.span>
            </button>
          )
        })}
      </div>

      {/* Action Button — ButtonSquircle */}
      <Button
        type="button"
        variant={selectedCount > 0 ? 'default' : 'base'}
        size="default"
        full
        squircle
        pointer
        hover
        whileTap
        disabled={selectedCount === 0}
        onClick={() => onAction?.(selected)}
        className={cn(
          'h-[2.75rem] text-[0.84375rem] font-medium tracking-tight gap-[0.5rem]',
          selectedCount > 0 && 'hover:-translate-y-px',
        )}
      >
        <IconUserPlus className="size-[0.9375rem]" strokeWidth={2.2} />
        <span className="inline-flex items-center gap-[0.375rem]">
          <span>{actionLabel}</span>
          {selectedCount > 0 && (
            <span className="inline-flex items-center">
              (<NumberFlow value={selectedCount} />)
            </span>
          )}
        </span>
      </Button>
    </div>
  )
}
