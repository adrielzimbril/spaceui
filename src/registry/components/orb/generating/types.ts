import * as React from 'react'

export type GeneratingOrbRenderer = 'css' | 'canvas'

export interface GeneratingOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Rendering engine to use:
   * - 'css': GPU-accelerated CSS keyframes & multi-layer inset box-shadows.
   * - 'canvas': HTML5 Canvas 2D engine with real-time rotational shading.
   * @default 'css'
   */
  renderer?: GeneratingOrbRenderer

  /**
   * Orb diameter in pixels
   * @default 240
   */
  size?: number

  /**
   * Inset depth multiplier (0.4 to 1.8)
   * @default 1.0
   */
  depth?: number

  /**
   * Rotation cycle duration in seconds
   * @default 2.0
   */
  speed?: number

  /**
   * Rotation cycle duration in milliseconds (if provided, overrides speed)
   */
  duration?: number

  /**
   * Stagger delay between characters in milliseconds (or seconds if < 1)
   * @default 100
   */
  stagger?: number

  /**
   * Letter scale pop multiplier (1.0 to 1.6)
   * @default 1.15
   */
  pop?: number

  /**
   * Resting character opacity (0.1 to 1.0)
   * @default 0.4
   */
  restOpacity?: number

  /**
   * Text size multiplier in em
   * @default 1.2
   */
  textSize?: number

  /**
   * Letter tracking / spacing in pixels
   * @default 0
   */
  tracking?: number

  /**
   * Text displayed at the center of the orb
   * @default 'Generating'
   */
  text?: string

  /**
   * Whether to display center animated text
   * @default true
   */
  showText?: boolean

  /**
   * Primary highlight / rim color
   * @default '#ffffff'
   */
  highlightColor?: string

  /**
   * Halo primary glow color (0deg - 360deg phase)
   * @default '#ad5fff'
   */
  haloColor?: string

  /**
   * Core primary glow color (0deg - 360deg phase)
   * @default '#471eec'
   */
  coreColor?: string

  /**
   * Halo alternate glow color (180deg half-phase)
   * @default '#d60a47'
   */
  haloAltColor?: string
  haloColorAlt?: string

  /**
   * Core alternate glow color (180deg half-phase)
   * @default '#311e80'
   */
  coreAltColor?: string
  coreColorAlt?: string

  /**
   * Center text color
   * @default '#ffffff'
   */
  textColor?: string

  /**
   * Playback state: 'play' or 'pause'
   * @default 'play'
   */
  playback?: 'play' | 'pause'

  /**
   * Stage background color
   * @default 'transparent'
   */
  stageColor?: string
}
