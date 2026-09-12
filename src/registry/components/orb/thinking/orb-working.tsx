import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbWorking(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="orbits"
      caption="Working"
      summary="Particles tracing tilted orbital rings around a ghosted sphere."
      {...props}
    />
  )
}

export default OrbWorking
