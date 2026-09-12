'use client'

import * as React from 'react'
import { BaseThinkingOrb } from './base-orb'
import { OrbBreathing } from './orb-breathing'
import { OrbComposing } from './orb-composing'
import { OrbConnecting } from './orb-connecting'
import { OrbListening } from './orb-listening'
import { OrbSearching } from './orb-searching'
import { OrbShaping } from './orb-shaping'
import { OrbSolving } from './orb-solving'
import { OrbWeaving } from './orb-weaving'
import { OrbWorking } from './orb-working'
import type {
  ThinkingOrbDescriptor,
  ThinkingOrbMode,
  ThinkingOrbProps,
  ThinkingOrbVariant,
} from './types'

export * from './types'
export {
  BaseThinkingOrb,
  OrbBreathing,
  OrbComposing,
  OrbConnecting,
  OrbListening,
  OrbSearching,
  OrbShaping,
  OrbSolving,
  OrbWeaving,
  OrbWorking,
}

export const THINKING_ORBS: ThinkingOrbDescriptor[] = [
  {
    id: 'orb-working',
    name: 'Working Orb',
    variant: 'working',
    mode: 'orbits',
    caption: 'Working',
    frame: [240, 240],
    summary: 'Particles tracing tilted orbital rings around a ghosted sphere.',
  },
  {
    id: 'orb-searching',
    name: 'Searching Orb',
    variant: 'searching',
    mode: 'globe',
    caption: 'Searching',
    frame: [240, 240],
    summary: 'A dotted globe swept by a rotating scan band.',
  },
  {
    id: 'orb-solving',
    name: 'Solving Orb',
    variant: 'solving',
    mode: 'rubik',
    caption: 'Solving',
    frame: [240, 240],
    summary: 'A point-cloud sphere permuted by successive quarter-turn slice rotations.',
  },
  {
    id: 'orb-listening',
    name: 'Listening Orb',
    variant: 'listening',
    mode: 'wave',
    caption: 'Listening',
    frame: [240, 240],
    summary: 'Latitude rings breathing in and out on two detuned sine waves.',
  },
  {
    id: 'orb-connecting',
    name: 'Connecting Orb',
    variant: 'connecting',
    mode: 'web',
    caption: 'Connecting',
    frame: [240, 240],
    summary: 'A drifting node graph with proximity links and travelling signals.',
  },
  {
    id: 'orb-weaving',
    name: 'Weaving Orb',
    variant: 'weaving',
    mode: 'braid',
    caption: 'Weaving',
    frame: [240, 240],
    summary: 'Three helical strands braiding around a ghosted sphere.',
  },
  {
    id: 'orb-composing',
    name: 'Composing Orb',
    variant: 'composing',
    mode: 'ribbon',
    caption: 'Composing',
    frame: [240, 240],
    summary: 'A rippling multi-lane ribbon wrapped over a sphere.',
  },
  {
    id: 'orb-breathing',
    name: 'Breathing Orb',
    variant: 'breathing',
    mode: 'ring',
    caption: 'Thinking',
    frame: [240, 240],
    summary: 'A face-on ring pulsing with a slow radial ripple.',
  },
  {
    id: 'orb-shaping',
    name: 'Shaping Orb',
    variant: 'shaping',
    mode: 'morph',
    caption: 'Shaping',
    frame: [240, 240],
    summary: 'A dotted outline morphing between circle, triangle and square.',
  },
]

export const VARIANT_TO_MODE_MAP: Record<ThinkingOrbVariant | ThinkingOrbMode, ThinkingOrbMode> = {
  working: 'orbits',
  orbits: 'orbits',
  searching: 'globe',
  globe: 'globe',
  solving: 'rubik',
  rubik: 'rubik',
  listening: 'wave',
  wave: 'wave',
  connecting: 'web',
  web: 'web',
  weaving: 'braid',
  braid: 'braid',
  composing: 'ribbon',
  ribbon: 'ribbon',
  breathing: 'ring',
  ring: 'ring',
  shaping: 'morph',
  morph: 'morph',
}

function getDescriptor(modeOrVariant: ThinkingOrbVariant | ThinkingOrbMode): ThinkingOrbDescriptor {
  const mode = VARIANT_TO_MODE_MAP[modeOrVariant] ?? 'orbits'
  return THINKING_ORBS.find((item) => item.mode === mode) ?? THINKING_ORBS[0]
}

export function ThinkingOrb({
  variant = 'working',
  ...props
}: ThinkingOrbProps) {
  const desc = getDescriptor(variant)
  return (
    <BaseThinkingOrb
      mode={desc.mode}
      caption={desc.caption}
      summary={desc.summary}
      frame={desc.frame}
      {...props}
    />
  )
}

export default ThinkingOrb
