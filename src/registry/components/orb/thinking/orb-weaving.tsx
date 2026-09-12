import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbWeaving(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="braid"
      caption="Weaving"
      summary="Three helical strands braiding around a ghosted sphere."
      {...props}
    />
  )
}

export default OrbWeaving
