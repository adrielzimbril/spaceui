import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbSolving(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="rubik"
      caption="Solving"
      summary="A point-cloud sphere permuted by successive quarter-turn slice rotations."
      {...props}
    />
  )
}

export default OrbSolving
