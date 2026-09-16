import type React from 'react'

// Re-exported so the shared use-orb-audio.ts (borrowed from the smooth orb) still
// resolves `./types` correctly once the CLI copies it next to this file.
export type AudioMode = 'ambient' | 'mic' | 'file'

export const BloopState = {
  idle: 'idle',
  listen: 'listen',
  think: 'think',
  speak: 'speak',
} as const

export type BloopState = (typeof BloopState)[keyof typeof BloopState]

export interface OrbBloopProps {
  audioMode?: 'ambient' | 'mic' | 'file'
  audioElement?: React.RefObject<HTMLAudioElement | null>
  audioSrc?: string
  state?: BloopState
  bloopColorMain?: [number, number, number]
  bloopColorLow?: [number, number, number]
  bloopColorMid?: [number, number, number]
  bloopColorHigh?: [number, number, number]
  size?: number
  watercolorStrength?: number
  watercolorAnimated?: boolean
  className?: string
  style?: React.CSSProperties
}
