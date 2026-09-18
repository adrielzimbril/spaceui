'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'

export type AspectRatioOption = {
  id: 'land' | 'square' | 'tall'
  label: string
  ratio: '4:3' | '1:1' | '3:4'
  widthRem: string
  heightRem: string
  rect: { x: number; y: number; w: number; h: number }
}

export const MORPHING_AREA_OPTIONS: AspectRatioOption[] = [
  {
    id: 'land',
    label: 'Landscape (4:3)',
    ratio: '4:3',
    widthRem: '17.25rem',
    heightRem: '12.9375rem',
    rect: { x: 1.5, y: 3.38, w: 15, h: 11.25 },
  },
  {
    id: 'square',
    label: 'Square (1:1)',
    ratio: '1:1',
    widthRem: '14.9375rem',
    heightRem: '14.9375rem',
    rect: { x: 2.5, y: 2.5, w: 13, h: 13 },
  },
  {
    id: 'tall',
    label: 'Portrait (3:4)',
    ratio: '3:4',
    widthRem: '12.9375rem',
    heightRem: '17.25rem',
    rect: { x: 3.38, y: 1.5, w: 11.25, h: 15 },
  },
]

export type MorphingAreaRatio = '4:3' | '1:1' | '3:4' | '16:9' | 'land' | 'square' | 'tall' | (string & {})

export interface MorphingAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: MorphingAreaRatio
  width?: string | number
  height?: string | number
  rounded?: number
  corner?: number
  squircle?: boolean
  morph?: number
  children?: React.ReactNode
}

const DEFAULT_ROUNDED = 8
const DEFAULT_MORPH = 50
const BASE_MORPH_MS = 520

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export function MorphingArea({
  ratio = '1:1',
  width,
  height,
  rounded = DEFAULT_ROUNDED,
  corner,
  squircle = false,
  morph = DEFAULT_MORPH,
  className,
  style,
  children,
  ...props
}: MorphingAreaProps) {
  const morphNormalized = clamp(morph, 0, 100) / 100
  const durationMs = Math.round(BASE_MORPH_MS * (0.3 + morphNormalized * 0.7))

  const effectiveRounded = corner !== undefined ? corner : rounded
  const clampedRounded = Math.max(0, effectiveRounded)

  const dims = React.useMemo(() => {
    if (width !== undefined || height !== undefined) {
      return {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }
    }
    const matched = MORPHING_AREA_OPTIONS.find((opt) => opt.id === ratio || opt.ratio === ratio)
    if (matched) {
      return { width: matched.widthRem, height: matched.heightRem }
    }
    return { width: '14.9375rem', height: '14.9375rem' }
  }, [ratio, width, height])

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted shrink-0 flex items-center justify-center select-none font-sans',
        squircle && 'squircle',
        className,
      )}
      style={{
        width: dims.width,
        height: dims.height,
        borderRadius: `${clampedRounded}px`,
        transition: `width ${durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1), height ${durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1), border-radius ${durationMs}ms ease-out`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
