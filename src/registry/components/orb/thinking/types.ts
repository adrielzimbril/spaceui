import * as React from 'react'

export type ThinkingOrbVariant =
  'working' | 'searching' | 'solving' | 'listening' | 'connecting' | 'weaving' | 'composing' | 'breathing' | 'shaping'

export type ThinkingOrbMode = 'orbits' | 'globe' | 'rubik' | 'wave' | 'web' | 'braid' | 'ribbon' | 'ring' | 'morph'

export type ThinkingOrbSurface = 'ink' | 'paper' | 'auto'

export interface ThinkingOrbDescriptor {
  id: string
  name: string
  mode: ThinkingOrbMode
  variant: ThinkingOrbVariant
  caption: string
  frame: [number, number]
  summary: string
}

export interface ThinkingOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The thinking orb variant (1 of 9 animated styles)
   * @default 'working'
   */
  variant?: ThinkingOrbVariant | ThinkingOrbMode

  /**
   * Tone / surface of the rendering.
   * 'ink' = light particles on dark background.
   * 'paper' = dark particles on light background.
   * 'auto' = syncs with current document dark/light class or system scheme.
   * @default 'auto'
   */
  surface?: ThinkingOrbSurface

  /**
   * Scaling factor for the orb inside the canvas bounds (0.2 to 1.0)
   * @default 0.72
   */
  scale?: number

  /**
   * Animation speed multiplier (0.1 to 3.0)
   * @default 1
   */
  speed?: number

  /**
   * Target pixel width & height (or specify via className)
   * @default 240
   */
  size?: number

  /**
   * Animation playback state
   * @default 'play'
   */
  playback?: 'play' | 'pause'
}
