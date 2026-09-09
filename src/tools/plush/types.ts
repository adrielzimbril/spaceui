import type * as THREE from 'three'

export interface PlushConfig {
  furSize: number
  furThickness: number
  furHighlight: number
  handSize: number
  pressure: number
  iconOpacity: number
  sideColor: string
  roundness: number
  cornerRadius: number
  puffiness: number
  autoColor: boolean
}

export interface PlushPreset {
  id: string
  label: string
  preview: string
  sideColor: string
  description?: string
  defaultRoundness?: number
  defaultCornerRadius?: number
  defaultPuffiness?: number
  defaultAutoColor?: boolean
}

export interface ArtworkData {
  id: string
  label: string
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  sideColor: string
  preview: string
  apngPlayer?: any
  hasAlpha: boolean
  edgeColor?: string
  palette?: string[]
  isAnimated?: boolean
  animationType?: 'apng' | 'svg'
}
