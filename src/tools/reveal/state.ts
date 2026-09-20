export interface RevealConfig {
  depthIntensity: number
  modelScale: number
  rotX: number
  rotY: number
  thickness: number
  pointCount: number
  lerpFactor: number
  fadeSpeed: number
  idleDelay: number
  autoSpeed: number
  bgBase: [number, number, number]
  bgReveal: [number, number, number]
  trajectory: number
  autoMask: boolean
  edgeSoftness: number
  gooey: boolean
  displaceAmount: number
  chromaticAmount: number
  topoEnabled: boolean
  topoScale: number
  topoSpeed: number
  topoThickness: number
  topoDistortion: number
  lineBase: [number, number, number]
  lineReveal: [number, number, number]
}

export const DEFAULT_CONFIG: RevealConfig = {
  depthIntensity: 0.1,
  modelScale: 1.2,
  rotX: -4,
  rotY: 4,
  thickness: 350,
  pointCount: 300,
  lerpFactor: 0.82,
  fadeSpeed: 0.025,
  idleDelay: 2000,
  autoSpeed: 1,
  bgBase: [1, 1, 1],
  bgReveal: [0.702, 0.816, 0.635],
  trajectory: 0,
  autoMask: true,
  edgeSoftness: 0,
  gooey: false,
  displaceAmount: 0,
  chromaticAmount: 0,
  topoEnabled: false,
  topoScale: 6,
  topoSpeed: 0.07,
  topoThickness: 0.11,
  topoDistortion: 0.02,
  lineBase: [0.941, 0.941, 0.941],
  lineReveal: [0.624, 0.765, 0.573],
}

export interface RevealImages {
  base: string
  reveal: string
  depthBase: string
  depthReveal: string
  width: number
  height: number
}
