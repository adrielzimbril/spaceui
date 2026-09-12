'use client'

import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export const badgeVariants = cva('rounded-xl flex h-auto md:h-full items-center font-semibold transition-colors', {
  variants: {
    variant: {
      default: 'border-transparent bg-muted text-foreground',
      inverted: 'border-transparent bg-foreground text-background',
      outline: 'border border-border bg-transparent text-foreground',
    },
    size: {
      xs: 'text-[11px] px-2 py-0.5 gap-1.5',
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      default: 'text-xs px-2.5 py-1.5 gap-2',
      md: 'text-sm px-3 py-1.5 gap-2.5',
      lg: 'text-base px-3.5 py-2 gap-3',
    },
    circle: {
      true: 'aspect-square p-1.5',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    circle: false,
  },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  contentClassName?: string
}

export function Badge({ className, variant, size, circle, contentClassName, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, circle }), 'rounded-md', className)} {...props}>
      <span className={cn('font-medium whitespace-pre-line leading-none', contentClassName)}>{props.children}</span>
    </div>
  )
}

export const statusIndicatorVariants = cva('rounded-md', {
  variants: {
    status: {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      busy: 'bg-red-500',
      away: 'bg-yellow-500',
      available: 'bg-green-500',
      error: 'bg-red-600',
      warning: 'bg-orange-500',
      info: 'bg-blue-500',
    },
    size: {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      default: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
    },
    animated: {
      true: 'animate-pulse',
      false: '',
    },
  },
  defaultVariants: {
    status: 'online',
    size: 'default',
    animated: true,
  },
})

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  status?: 'online' | 'offline' | 'busy' | 'away' | 'available' | 'error' | 'warning' | 'info'
  primaryText?: string
  showIndicator?: boolean
  animated?: boolean
  mode?: 'stack' | 'inline'
  indicatorBadge?: boolean
  indicatorClassName?: string
  primaryTextClassName?: string
  secondaryTextClassName?: string
}

export function StatusBadge({
  className,
  variant,
  size,
  mode = 'inline',
  status = 'online',
  primaryText,
  showIndicator = true,
  animated = true,
  indicatorBadge = false,
  indicatorClassName,
  primaryTextClassName,
  secondaryTextClassName,
  ...props
}: StatusBadgeProps) {
  const IndicatorComponent = ({ className }: { className?: string }) =>
    showIndicator && (
      <span className={cn('relative flex justify-center items-center size-fit', className)}>
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            animated && 'animate-ping animation-duration-[2.25s]',
            {
              'bg-green-300': status === 'online' || status === 'available',
              'bg-purple-300': status === 'info',
              'bg-red-300': status === 'busy' || status === 'error',
              'bg-gray-300': status === 'offline',
              'bg-yellow-300': status === 'away',
              'bg-orange-300': status === 'warning',
            },
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full',
            statusIndicatorVariants({ status, size, animated: false }),
            indicatorClassName,
          )}
        />
      </span>
    )

  const innerBadgeStyle =
    variant === 'inverted'
      ? 'bg-background/20 text-background'
      : variant === 'outline'
        ? 'bg-muted text-foreground'
        : 'bg-background text-foreground'

  if (mode === 'stack') {
    return (
      <div
        className={cn(
          'flex items-center rounded-xl transition-colors',
          badgeVariants({ variant, size }),
          indicatorBadge ? 'gap-2.5 py-2 px-3' : 'gap-2',
          className,
        )}
        {...props}
      >
        {indicatorBadge ? (
          <Badge
            size={size}
            circle
            className={cn(
              'shrink-0 flex items-center justify-center rounded-lg',
              size === 'xs' ? 'p-1' : size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-2.5' : 'p-2',
              innerBadgeStyle,
            )}
            contentClassName="flex items-center justify-center"
          >
            <IndicatorComponent />
          </Badge>
        ) : (
          <IndicatorComponent className="items-start" />
        )}
        <div className="flex flex-col items-start gap-0.5">
          {primaryText && <span className={cn('font-semibold leading-none', primaryTextClassName)}>{primaryText}</span>}
          {props.children && (
            <span className={cn('text-[0.75em] opacity-70 leading-none mt-0.5', secondaryTextClassName)}>
              {props.children}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2 rounded-xl transition-colors',
        badgeVariants({ variant, size }),
        className,
      )}
      {...props}
    >
      <Badge size={size} circle={!primaryText} className={innerBadgeStyle}>
        <div className="flex items-center gap-2">
          <IndicatorComponent />
          {primaryText && <span className={cn('font-semibold', primaryTextClassName)}>{primaryText}</span>}
        </div>
      </Badge>
      {props.children && <span className={cn('font-normal opacity-90', secondaryTextClassName)}>{props.children}</span>}
    </div>
  )
}
