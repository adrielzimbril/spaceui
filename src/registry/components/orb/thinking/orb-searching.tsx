import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbSearching(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="globe"
      caption="Searching"
      summary="A dotted globe swept by a rotating scan band."
      {...props}
    />
  )
}

export default OrbSearching
