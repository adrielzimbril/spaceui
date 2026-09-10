'use client'

import React from 'react'
import { Button } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'

export interface ToolbarButtonProps {
  label: string
  pressed?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  className?: string
}

export function ToolbarButton({ label, pressed, onClick, children, className }: ToolbarButtonProps) {
  return (
    <div className={cn('flex size-8 items-center justify-center rounded-xl bg-muted', className)}>
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        className={cn(
          'size-full rounded-lg text-muted-foreground transition-all duration-300 hover:bg-background hover:text-foreground cursor-pointer',
          pressed && 'text-foreground font-semibold bg-background',
        )}
      >
        {children}
      </Button>
    </div>
  )
}
