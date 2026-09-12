'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/registry/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90',
        primary: 'border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90',
        base: 'border-0 border-transparent bg-muted/70 text-foreground hover:bg-muted/90',
        secondary: 'border-2 border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90',
        destructive: 'border-2 border-destructive bg-destructive text-white hover:bg-destructive/90',
        outline: 'border-2 border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        colored: 'bg-inherit text-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        icon: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        xs: 'px-3 py-2',
        sm: 'px-3 py-4 h-auto',
        default: 'px-6 py-3',
        lg: 'px-6 py-3 text-lg',
        iconSmall: 'px-1 py-1',
        'icon-xs': 'size-7 p-0',
        'icon-sm': 'size-8 p-0',
        icon: 'size-9 p-0',
        'icon-lg': 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps extends useRender.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  variant?:
    'default' | 'primary' | 'base' | 'secondary' | 'destructive' | 'outline' | 'colored' | 'ghost' | 'icon' | 'link'
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'iconSmall' | 'icon-xs' | 'icon-sm' | 'icon' | 'icon-lg'
  full?: boolean
  asFull?: boolean
  icon?: boolean
  asIcon?: boolean
  pointer?: boolean
  asPointer?: boolean
  hover?: boolean
  whileTap?: boolean
  squircle?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      render,
      full = false,
      asFull,
      icon = false,
      asIcon,
      pointer = false,
      asPointer,
      hover = false,
      whileTap,
      squircle = true,
      ...props
    },
    ref,
  ) => {
    const isFull = full || asFull || false
    const isIcon = icon || asIcon || false
    const isPointer = pointer || asPointer || false
    const isHover = hover || whileTap || false

    const defaultProps = {
      className: cn(
        buttonVariants({ variant, size, className }),
        squircle && 'squircle-7xl/100 hover:squircle-3xl/100',
        isFull && 'w-full flex text-center items-center justify-center',
        isIcon && '[&_svg]:size-auto',
        isPointer && 'cursor-pointer',
        isHover && 'hover:scale-105',
      ),
      'data-space-click': variant === 'destructive' ? 'deny' : 'tap',
      'data-space-hover': 'tick',
      ref,
      children: props.children,
    }

    return useRender({
      defaultTagName: 'button',
      props: mergeProps<'button'>(defaultProps, props),
      render,
    })
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
