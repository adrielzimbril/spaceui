'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type FrostBlurredSide = 'top' | 'bottom' | 'left' | 'right'

export interface FrostBlurredProps extends React.HTMLAttributes<HTMLDivElement> {
  layers?: number
  strength?: number
  height?: string | number
  side?: FrostBlurredSide
  tint?: number
  opacity?: number
}

const DEFAULT_BLUR_STEPS = [0.084, 0.125, 0.214, 0.386, 0.664, 0.986, 1.15]

function getGradualMask(index: number, count: number, side: FrostBlurredSide) {
  const step = 100 / count
  const start = (index * step).toFixed(2)
  const peak1 = ((index + 1) * step).toFixed(2)
  const peak2 = ((index + 2) * step).toFixed(2)
  const end = ((index + 3) * step).toFixed(2)

  const dir = side === 'top' ? 'to top' : side === 'bottom' ? 'to bottom' : side === 'left' ? 'to left' : 'to right'

  if (index === count - 1) {
    return `linear-gradient(${dir}, transparent ${start}%, black 100%, black 100%)`
  }
  if (index === count - 2) {
    return `linear-gradient(${dir}, transparent ${start}%, black ${peak1}%, black 100%, transparent 100%)`
  }
  return `linear-gradient(${dir}, transparent ${start}%, black ${peak1}%, black ${peak2}%, transparent ${end}%)`
}

export function FrostBlurred({
  layers = 7,
  strength = 1,
  height = '62%',
  side = 'bottom',
  tint = 0,
  opacity = 0.9,
  className,
  children,
  style,
  ...props
}: FrostBlurredProps) {
  const count = Math.max(1, Math.round(layers))
  const overlayDim = typeof height === 'number' ? `${height}px` : height
  const isHorizontal = side === 'left' || side === 'right'

  const blurs = React.useMemo(() => {
    if (count === DEFAULT_BLUR_STEPS.length) {
      return DEFAULT_BLUR_STEPS.map((v) => v * strength)
    }
    const minBlur = 0.084
    const maxBlur = 1.15
    return Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 1 : i / (count - 1)
      const val = minBlur * Math.pow(maxBlur / minBlur, t)
      return val * strength
    })
  }, [count, strength])

  const sideStyles: React.CSSProperties = isHorizontal
    ? {
        width: overlayDim,
        top: 0,
        bottom: 0,
        left: side === 'left' ? 0 : undefined,
        right: side === 'right' ? 0 : undefined,
      }
    : {
        height: overlayDim,
        left: 0,
        right: 0,
        top: side === 'top' ? 0 : undefined,
        bottom: side === 'bottom' ? 0 : undefined,
      }

  const overlay = (
    <div
      aria-hidden="true"
      className={cn(
        'gradual-blur pointer-events-none absolute z-10 select-none overflow-hidden',
        children ? null : className,
      )}
      style={{
        ...sideStyles,
        ...(children ? undefined : style),
      }}
      {...(children ? undefined : props)}
    >
      <div className="relative size-full">
        {blurs.map((blurVal, index) => {
          const mask = getGradualMask(index, count, side)
          return (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                zIndex: index + 1,
                backdropFilter: `blur(${blurVal.toFixed(3)}rem)`,
                WebkitBackdropFilter: `blur(${blurVal.toFixed(3)}rem)`,
                maskImage: mask,
                WebkitMaskImage: mask,
                opacity,
              }}
            />
          )
        })}
        {tint > 0 && (
          <div
            className="absolute inset-0"
            style={{
              zIndex: count + 1,
              background: `linear-gradient(${side === 'top' ? 'to top' : side === 'bottom' ? 'to bottom' : side === 'left' ? 'to left' : 'to right'}, transparent 0%, color-mix(in oklab, var(--background) ${Math.round(tint * 100)}%, transparent) 100%)`,
            }}
          />
        )}
      </div>
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
