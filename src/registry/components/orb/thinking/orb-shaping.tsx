import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbShaping(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="morph"
      caption="Shaping"
      summary="A dotted outline morphing between circle, triangle and square."
      {...props}
    />
  )
}

export default OrbShaping
