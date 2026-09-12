import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbConnecting(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="web"
      caption="Connecting"
      summary="A drifting node graph with proximity links and travelling signals."
      {...props}
    />
  )
}

export default OrbConnecting
