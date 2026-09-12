'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-300 whitespace-nowrap leading-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-muted text-foreground',
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'border-transparent bg-destructive text-white hover:bg-destructive/80',
        inverted: 'border-transparent bg-foreground text-background',
        accent: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/90',
      },
      size: {
        xs: 'text-[11px] px-2.5 py-1 gap-1',
        sm: 'text-xs px-3 py-1.5 gap-1.5',
        default: 'text-xs px-3.5 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2 gap-2',
        lg: 'text-base px-4.5 py-2 gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface BadgeProps extends useRender.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'destructive' | 'inverted' | 'accent'
  size?: 'xs' | 'sm' | 'default' | 'md' | 'lg'
  square?: boolean
  squircle?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, square = false, squircle = true, render, children, ...props }, ref) => {
    const defaultProps = {
      className: cn(
        badgeVariants({ variant, size }),
        squircle && 'squircle-2xl/80 md:squircle-3xl/80 hover:squircle-xl/80',
        square && 'aspect-square',
        className,
      ),
      'data-slot': 'badge',
      ref,
      children,
    }

    return useRender({
      defaultTagName: 'span',
      props: mergeProps<'span'>(defaultProps, props),
      render,
    })
  },
)
Badge.displayName = 'Badge'
