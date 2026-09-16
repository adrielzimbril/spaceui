'use client'

import * as React from 'react'
import { LiquidMetal, type LiquidMetalProps } from '@paper-design/shaders-react'
import { cn } from '@/registry/lib/utils'

type ShaderProps = Omit<LiquidMetalProps, 'className' | 'style' | 'shape' | 'children'>

export type LiquidBorderProps = React.ComponentProps<'div'> & Partial<ShaderProps>

export function LiquidBorder({
  children,
  className,
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
  return (
    <div data-slot="liquid-border" className={cn('relative isolate overflow-hidden', className)} {...props}>
      <LiquidMetal
        className="pointer-events-none absolute inset-0 size-full"
        shape="none"
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
      <div className="relative z-10 size-full">{children}</div>
    </div>
  )
}
