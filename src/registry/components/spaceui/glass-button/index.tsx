'use client'

import * as React from 'react'
import { Button, type ButtonProps } from '@/registry/components/spaceui/button-squircle'
import { cn } from '@/registry/lib/utils'

export interface GlassButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Use the squircle corner treatment instead of a full pill. @default false */
  squircle?: boolean
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, squircle = false, children, ...props }, ref) => {
    return (
      <span className={cn('group relative inline-flex', !squircle && 'rounded-full')}>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -inset-1.5 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.06))] opacity-70 blur-[3px] transition-[filter] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:blur-[1.5px]',
            squircle ? 'rounded-[inherit]' : 'rounded-full',
          )}
        />

        <Button
          ref={ref}
          variant="ghost"
          squircle={squircle}
          className={cn(
            'relative isolate overflow-hidden text-foreground',
            !squircle && 'rounded-full',
            'bg-[linear-gradient(-75deg,rgba(255,255,255,0.05),rgba(255,255,255,0.22),rgba(255,255,255,0.05))]',
            'shadow-[inset_0_2px_2px_rgba(0,0,0,0.035),inset_0_-2px_2px_rgba(255,255,255,0.5),0_4px_2px_-2px_rgba(0,0,0,0.1),0_0_2px_4px_rgba(255,255,255,0.2)_inset]',
            'backdrop-blur-[3px] backdrop-saturate-150',
            'transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]',
            'hover:scale-[0.975] hover:shadow-[inset_0_2px_2px_rgba(0,0,0,0.035),inset_0_-2px_2px_rgba(255,255,255,0.5),0_1.2px_0.4px_-1.6px_rgba(0,0,0,0.25),0_0_0.8px_1.6px_rgba(255,255,255,0.5)_inset]',
            'active:scale-[0.94]',
            className,
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 z-1 p-px mask-exclude [-webkit-mask-composite:xor] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]',
              'bg-[conic-gradient(from_-75deg_at_50%_50%,rgba(0,0,0,0.45),rgba(0,0,0,0)_5%_40%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0)_60%_95%,rgba(0,0,0,0.45)),linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5))]',
              squircle ? 'rounded-[inherit]' : 'rounded-full',
            )}
          />

          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 z-2 overflow-hidden mix-blend-screen',
              'bg-[linear-gradient(-45deg,transparent_0%,rgba(255,255,255,0.5)_40%_50%,transparent_55%)] bg-size-[200%_200%] bg-position-[0%_50%]',
              'transition-[background-position] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:bg-position-[25%_50%]',
              squircle ? 'rounded-[inherit]' : 'rounded-full',
            )}
          />

          <span className="relative z-10 inline-flex items-center gap-2 [text-shadow:0_1px_1px_rgba(0,0,0,0.05)]">
            {children}
          </span>
        </Button>
      </span>
    )
  },
)
GlassButton.displayName = 'GlassButton'
