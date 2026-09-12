import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbComposing(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="ribbon"
      caption="Composing"
      summary="A rippling multi-lane ribbon wrapped over a sphere."
      {...props}
    />
  )
}

export default OrbComposing
