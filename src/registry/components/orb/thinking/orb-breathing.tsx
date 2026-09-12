import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbBreathing(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="ring"
      caption="Thinking"
      summary="A face-on ring pulsing with a slow radial ripple."
      {...props}
    />
  )
}

export default OrbBreathing
