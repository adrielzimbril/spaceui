'use client'

import * as React from 'react'
import Link from 'next/link'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { LiquidBorder } from '@/registry/components/spaceui/liquid-metal-border'
import { cn } from '@/registry/lib/utils'

export interface ProBadgeProps {
  size?: '2xs' | 'xs' | 'sm' | 'default'
  className?: string
  badgeClassName?: string
  asLink?: boolean
  href?: string
  text?: string
  liquid?: boolean
}

export function ProBadge({
  size = 'xs',
  className,
  badgeClassName,
  asLink = true,
  href = '/pricing',
  text = 'PRO',
  liquid = true,
}: ProBadgeProps) {
  const badgeSize = size === '2xs' ? 'xs' : size
  const borderPadding = size === '2xs' ? 'p-[0.09125rem]' : size === 'default' ? 'p-1' : 'p-0.75'

  const badgeContent = (
    <Badge
      size={badgeSize}
      variant="primary"
      className={cn(
        'bg-primary! select-none uppercase leading-none font-bold',
        size === '2xs' && 'text-[9px] px-1.5 py-0.5',
        badgeClassName,
      )}
    >
      {text}
    </Badge>
  )

  const renderedBadge = liquid ? (
    <LiquidBorder
      className={cn(
        'inline-flex items-center justify-center squircle rounded-full leading-none shrink-0',
        borderPadding,
        asLink && 'transition-transform duration-200 hover:scale-105 active:scale-95',
        className,
      )}
    >
      {badgeContent}
    </LiquidBorder>
  ) : (
    <span
      className={cn(
        'inline-flex items-center justify-center squircle rounded-full leading-none shrink-0',
        asLink && 'transition-transform duration-200 hover:scale-105 active:scale-95',
        className,
      )}
    >
      {badgeContent}
    </span>
  )

  if (asLink) {
    return (
      <Link
        href={href}
        onClick={(e) => {
          e.stopPropagation()
        }}
        title="Space UI Pro — View plans"
        aria-label="Space UI Pro — View plans"
        className="inline-flex items-center justify-center shrink-0 z-10 cursor-pointer leading-none"
      >
        {renderedBadge}
      </Link>
    )
  }

  return <span className="inline-flex items-center justify-center shrink-0 leading-none">{renderedBadge}</span>
}
