'use client'

import * as React from 'react'
import { GeneratingOrbCanvas } from './generating-orb-canvas'
import { GeneratingOrbCss } from './generating-orb-css'
import type { GeneratingOrbProps } from './types'

export * from './types'
export { GeneratingOrbCanvas, GeneratingOrbCss }

export function GeneratingOrb({ renderer = 'css', ...props }: GeneratingOrbProps) {
  if (renderer === 'canvas') {
    return <GeneratingOrbCanvas {...props} />
  }
  return <GeneratingOrbCss {...props} />
}

export default GeneratingOrb
