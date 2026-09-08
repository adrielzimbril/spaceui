import { cn } from '@/registry/lib/utils'
import type { AvatarEffect, AvatarVariant } from '@usespaceui/avatars'
import type React from 'react'

export interface MockupAvatarOptions {
  animate?: boolean
  circle?: boolean
  colors?: string[]
  effect?: AvatarEffect
  seed?: string
  variant: AvatarVariant
}

export function MockupSurface({
  children,
  className,
  contentClassName,
  meta = 'Preview',
  title,
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  meta?: React.ReactNode
  title: string
}): React.ReactElement {
  return (
    <article className={cn('flex min-h-0 flex-col rounded-3xl bg-muted p-1.5', className)}>
      <header className="flex items-center justify-between gap-3 px-4 py-2">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        <span className="shrink-0 rounded-xl bg-background  px-2.5 py-1.5 text-[0.625rem] font-medium text-muted-foreground">
          {meta}
        </span>
      </header>
      <div className={cn('flex h-full min-h-0 flex-col rounded-[1.125rem] bg-background p-4', contentClassName)}>
        <div className="min-h-0 flex-1 *:h-full">{children}</div>
      </div>
    </article>
  )
}

export function MockupBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-xl bg-background px-2 py-1 text-[0.625rem] font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function MockupMetric({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl bg-muted px-2 py-3 text-center">
      <strong className="text-sm font-semibold tabular-nums text-foreground">{value}</strong>
      <span className="mt-0.5 truncate text-[0.625rem] text-muted-foreground">{label}</span>
    </div>
  )
}
