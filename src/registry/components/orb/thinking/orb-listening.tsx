import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import type { ThinkingOrbProps } from './types'

export function OrbListening(props: Omit<ThinkingOrbProps, 'variant'>) {
  return (
    <BaseThinkingOrb
      mode="wave"
      caption="Listening"
      summary="Latitude rings breathing in and out on two detuned sine waves."
      {...props}
    />
  )
}

export default OrbListening
