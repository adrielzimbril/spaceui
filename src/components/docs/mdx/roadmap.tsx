'use client'

import React from 'react'
import { cn } from '@/registry/lib/utils'
import {
  IconCheck,
  IconCircleDashed,
  IconLoader2,
  IconFlask,
  IconClipboardList,
  IconCircleFilled,
} from '@tabler/icons-react'

// Container
export function Roadmap({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('py-2', className)} {...props}>
      {children}
    </div>
  )
}

// Category / Group
export function RoadmapGroup({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { title: string }) {
  // We'll add the separator inside this component to mimic the drawer list grouping
  // But usually it's conditional. We can just add it unconditionally except maybe if we manage it externally.
  // Actually, let's just make it a clean separated list.
  return (
    <div className={cn('mb-2', className)} {...props}>
      <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />
      <div className="text-muted-foreground px-4 py-1.5 text-xs font-medium uppercase tracking-wider">{title}</div>
      <div className="px-2">{children}</div>
    </div>
  )
}

export type RoadmapStatusType = 'done' | 'in-progress' | 'planned' | 'experimental' | 'to-define'

export function getStatusConfig(status: RoadmapStatusType) {
  switch (status) {
    case 'done':
      return {
        label: 'Done',
        emoji: '✅',
        icon: <IconCheck className="size-4 shrink-0 text-muted-foreground" />,
      }
    case 'in-progress':
      return {
        label: 'In Progress',
        emoji: '🔄',
        icon: <IconLoader2 className="size-4 shrink-0 text-muted-foreground animate-spin duration-3000" />,
      }
    case 'planned':
      return {
        label: 'Planned',
        emoji: '📌',
        icon: <IconCircleDashed className="size-4 shrink-0 text-muted-foreground" />,
      }
    case 'experimental':
      return {
        label: 'Experimental',
        emoji: '🧪',
        icon: <IconFlask className="size-4 shrink-0 text-muted-foreground" />,
      }
    case 'to-define':
      return {
        label: 'To Define',
        emoji: '📝',
        icon: <IconClipboardList className="size-4 shrink-0 text-muted-foreground" />,
      }
    default:
      return {
        label: 'Unknown',
        emoji: '❓',
        icon: <IconCircleFilled className="size-4 shrink-0 text-muted-foreground" />,
      }
  }
}

// Single item matching the exact DOM structure
export function RoadmapItem({
  title,
  status,
  className,
  ...props
}: React.ComponentProps<'div'> & { title: string; status: RoadmapStatusType }) {
  const config = getStatusConfig(status)

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 transition-colors text-foreground hover:bg-muted',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {config.icon}
        <span className="truncate text-sm">{title}</span>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 shrink-0 ml-2">
        <span className="text-xs leading-none">{config.emoji}</span>
        <span className="hidden sm:inline">{config.label}</span>
      </span>
    </div>
  )
}
