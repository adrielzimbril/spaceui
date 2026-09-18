'use client'

import * as React from 'react'
import { SilkGradient } from '@/registry/components/shader/silk-gradient'
import { cn } from '@/registry/lib/utils'

export type SilkPreset = 'community' | 'pro' | 'lifetime' | 'ocean' | 'sunset' | 'emerald' | 'amber' | 'violet'

export interface SilkBorderProps extends React.ComponentProps<'div'> {
  color1?: string
  color2?: string
  color3?: string
  preset?: SilkPreset
  speed?: number
  animate?: boolean
  grain?: boolean
  fallbackClassName?: string
  innerClassName?: string
  children?: React.ReactNode
}

export const SILK_PRESETS: Record<SilkPreset, { color1: string; color2: string; color3: string; fallback: string }> = {
  community: {
    color1: '#a855f7',
    color2: '#ec4899',
    color3: '#3b82f6',
    fallback: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
  },
  pro: {
    color1: '#fbbf24',
    color2: '#f97316',
    color3: '#e11d48',
    fallback: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
  },
  lifetime: {
    color1: '#6366f1',
    color2: '#8b5cf6',
    color3: '#ec4899',
    fallback: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
  },
  ocean: {
    color1: '#06b6d4',
    color2: '#3b82f6',
    color3: '#1e3a8a',
    fallback: 'from-cyan-500/20 via-blue-500/20 to-indigo-900/20',
  },
  sunset: {
    color1: '#f43f5e',
    color2: '#fb923c',
    color3: '#fde047',
    fallback: 'from-rose-500/20 via-orange-400/20 to-yellow-300/20',
  },
  emerald: {
    color1: '#34d399',
    color2: '#10b981',
    color3: '#064e3b',
    fallback: 'from-emerald-400/20 via-emerald-600/20 to-emerald-950/20',
  },
  amber: {
    color1: '#fef08a',
    color2: '#f59e0b',
    color3: '#78350f',
    fallback: 'from-yellow-200/20 via-amber-500/20 to-amber-900/20',
  },
  violet: {
    color1: '#c084fc',
    color2: '#7c3aed',
    color3: '#2e1065',
    fallback: 'from-purple-400/20 via-violet-600/20 to-violet-950/20',
  },
}

export function SilkBorder({
  children,
  className,
  innerClassName,
  fallbackClassName,
  preset = 'pro',
  color1,
  color2,
  color3,
  speed = 0.65,
  animate = true,
  grain = false,
  ...props
}: SilkBorderProps) {
  const selectedPreset = SILK_PRESETS[preset] || SILK_PRESETS.pro
  const activeColor1 = color1 || selectedPreset.color1
  const activeColor2 = color2 || selectedPreset.color2
  const activeColor3 = color3 || selectedPreset.color3
  const activeFallback = fallbackClassName || selectedPreset.fallback

  return (
    <div
      data-slot="silk-border"
      className={cn('relative isolate overflow-hidden flex items-center justify-center leading-none', className)}
      {...props}
    >
      {/* CSS Gradient fallback */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-linear-to-b opacity-60 transition-opacity',
          activeFallback,
        )}
      />

      {/* WebGPU Silk Shader Canvas */}
      <SilkGradient
        className="pointer-events-none absolute inset-0 size-full"
        color1={activeColor1}
        color2={activeColor2}
        color3={activeColor3}
        speed={speed}
        animate={animate}
        grain={grain}
      />

      {/* Content wrapper */}
      {children && (
        <div className={cn('relative z-10 flex items-center justify-center leading-none', innerClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
