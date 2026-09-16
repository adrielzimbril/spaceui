'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type FrostBlurredSide = 'top' | 'bottom'

export interface FrostBlurredProps extends React.HTMLAttributes<HTMLDivElement> {
  layers?: number
  strength?: number
  height?: string | number
  side?: FrostBlurredSide
  tint?: number
}

function layerMask(index: number, count: number, side: FrostBlurredSide) {
  const band = 100 / count
  const start = index * band
  const a = start + band
  const b = start + band * 2
  const end = start + band * 3
  const dir = side === 'top' ? 'to top' : 'to bottom'
  const peak = index === count - 1 ? 0.55 : 0.72
  const stops =
    index === count - 1
      ? `rgba(255,255,255,0) ${start}%, rgba(255,255,255,${peak}) ${Math.min(a, 100)}%`
      : `rgba(255,255,255,0) ${start}%, rgba(255,255,255,${peak}) ${a}%, rgba(255,255,255,${peak}) ${Math.min(b, 100)}%, rgba(255,255,255,0) ${Math.min(end, 112.5)}%`
  return `linear-gradient(${dir}, ${stops})`
}

export function FrostBlurred({
  layers = 8,
  strength = 1,
  height = '62%',
  side = 'bottom',
  tint = 0.22,
  className,
  children,
  style,
  ...props
}: FrostBlurredProps) {
  const count = Math.max(1, Math.round(layers))
  const overlayHeight = typeof height === 'number' ? `${height}px` : height
  const dir = side === 'top' ? 'to top' : 'to bottom'
  const wash = Math.min(1, Math.max(0, tint))

  const overlay = (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 z-10 isolate', children ? null : className)}
      style={{
        height: overlayHeight,
        top: side === 'top' ? 0 : undefined,
        bottom: side === 'bottom' ? 0 : undefined,
        ...(children ? undefined : style),
      }}
      {...(children ? undefined : props)}
    >
      {Array.from({ length: count }, (_, index) => {
        const blur = 0.5 * 2 ** index * strength
        const mask = layerMask(index, count, side)
        return (
          <div
            key={index}
            className="absolute inset-0 bg-transparent"
            style={{
              zIndex: index + 1,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
              maskMode: 'alpha',
            }}
          />
        )
      })}
      {wash > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            zIndex: count + 2,
            background: `linear-gradient(${dir}, transparent 0%, color-mix(in oklab, var(--background) ${Math.round(wash * 100)}%, transparent) 100%)`,
          }}
        />
      ) : null}
    </div>
  )

  if (!children) {
    return overlay
  }

  return (
    <div className={cn('relative', className)} style={style} {...props}>
      {children}
      {overlay}
    </div>
  )
}
