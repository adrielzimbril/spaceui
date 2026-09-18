'use client'

import * as React from 'react'
import { LiquidMetal, type LiquidMetalProps } from '@paper-design/shaders-react'
import { cn } from '@/registry/lib/utils'

export type LiquidPreset = 'chrome' | 'gold' | 'ocean' | 'sunset' | 'emerald' | 'violet'

type ShaderProps = Omit<LiquidMetalProps, 'className' | 'style' | 'shape' | 'children'>

export type LiquidBorderProps = React.ComponentProps<'div'> &
  Partial<ShaderProps> & {
    preset?: LiquidPreset
    innerClassName?: string
    fallbackClassName?: string
  }

export const LIQUID_PRESETS: Record<LiquidPreset, { colorBack: string; colorTint: string; fallback: string }> = {
  chrome: {
    colorBack: '#AAAAAC',
    colorTint: '#ffffff',
    fallback: 'from-slate-300/30 via-slate-100/20 to-transparent',
  },
  gold: {
    colorBack: '#8a6a1f',
    colorTint: '#ffe9a8',
    fallback: 'from-amber-400/30 via-yellow-200/20 to-transparent',
  },
  ocean: {
    colorBack: '#0f3f5c',
    colorTint: '#7fdcff',
    fallback: 'from-cyan-500/30 via-blue-500/20 to-transparent',
  },
  sunset: {
    colorBack: '#7a2a3a',
    colorTint: '#ffb37a',
    fallback: 'from-rose-500/30 via-orange-400/20 to-transparent',
  },
  emerald: {
    colorBack: '#134e3a',
    colorTint: '#6ee7b7',
    fallback: 'from-emerald-500/30 via-emerald-300/20 to-transparent',
  },
  violet: {
    colorBack: '#3b1c6b',
    colorTint: '#c9a6ff',
    fallback: 'from-violet-500/30 via-purple-300/20 to-transparent',
  },
}

export function LiquidBorder({
  children,
  className,
  innerClassName,
  fallbackClassName,
  preset = 'chrome',
  colorBack,
  colorTint,
  speed = 0.6,
  repetition = 4,
  softness = 0.5,
  shiftRed = 0.3,
  shiftBlue = 0.3,
  distortion = 0,
  contour = 0,
  angle = 45,
  scale = 8,
  offsetX = 0.1,
  offsetY = -0.1,
  ...props
}: LiquidBorderProps) {
  const selectedPreset = LIQUID_PRESETS[preset] || LIQUID_PRESETS.chrome
  const activeColorBack = colorBack || selectedPreset.colorBack
  const activeColorTint = colorTint || selectedPreset.colorTint
  const activeFallback = fallbackClassName || selectedPreset.fallback

  return (
    <div
      data-slot="liquid-border"
      className={cn(
        'relative isolate overflow-hidden flex items-center justify-center leading-none',
        '[&_canvas]:rounded-[inherit] [&>div]:rounded-[inherit]',
        className,
      )}
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        ...props.style,
      }}
    >
      {/* CSS gradient fallback */}
      <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b transition-opacity', activeFallback)} />

      <LiquidMetal
        className="pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[inherit] [&_canvas]:rounded-[inherit]"
        shape="none"
        colorBack={activeColorBack}
        colorTint={activeColorTint}
        speed={speed}
        repetition={repetition}
        softness={softness}
        shiftRed={shiftRed}
        shiftBlue={shiftBlue}
        distortion={distortion}
        contour={contour}
        angle={angle}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />

      {children && (
        <div className={cn('relative z-10 flex items-center justify-center leading-none', innerClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
