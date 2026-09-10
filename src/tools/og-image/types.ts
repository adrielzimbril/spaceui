import type React from 'react'
import type { MeshEffect, MeshShader } from './mesh-webgl'

export type BgMode = 'orbs' | 'gradient' | 'blur' | 'solid' | 'image'

export type Layout =
  | 'editorial'
  | 'centered'
  | 'split'
  | 'bottom'
  | 'panel'
  | 'banner'
  | 'poster'
  | 'sidebar'
  | 'quote'
  | 'ticket'
  | 'corners'
  | 'stack'

export type ChipKey = 'brand' | 'tags' | 'title' | 'subtitle' | 'footer' | 'badge'

export type Chip = {
  on: boolean
  bg: string
  border: string
  text: string
  radius: number
  padX: number
  padY: number
  blur: number
}

export type AnimType = 'fade-up' | 'zoom' | 'blur-in' | 'slide' | 'reveal' | 'pop'

export type ShowcaseType = 'flags' | 'avatars' | 'squishmoji' | 'tech'
export type ShowcaseLayout = 'cloud' | 'shelf' | 'grid'
export type ShowcaseShape = 'circle' | 'squircle' | 'rect'

export interface OgState {
  brand: string
  tags: string
  title: string
  subtitle: string
  footer: string
  badge: string

  width: number
  height: number

  bgMode: BgMode
  bgBase: string
  bgFrom: string
  bgVia: string
  bgTo: string
  glow: string
  angle: number

  bgBlur: number
  bgInset: number
  bgScale: number

  orbBlur: number
  orbOpacity: number
  orbSize: number
  grain?: number
  vignette?: number
  bgImage: string
  bgImageDim: number

  meshShader?: MeshShader
  meshEffect?: MeshEffect
  meshWarp?: number
  meshDither?: number
  meshNoise?: number
  meshScan?: number
  meshSteps?: number
  meshGrid?: number
  meshScale?: number
  meshContrast?: number
  meshBlend?: number

  titleColor: string
  titleAccentColor: string
  subtitleColor: string
  mutedColor: string
  titleSize: number
  titleWeight: number
  titleTracking: number
  titleLeading: number
  subtitleSize: number
  brandSize: number
  tagsSize: number
  footerSize: number

  badgeStyle: 'pill' | 'squircle'
  badgeSize: number
  badgeMono: boolean

  showTechBadges: boolean
  techBadges: string[]

  logoSize: number
  logoGap: number
  logoUrl: string
  radius: number
  padding: number

  layout: Layout
  align: 'left' | 'center' | 'right'

  showBrand: boolean
  showTags: boolean
  showSubtitle: boolean
  showFooter: boolean
  showBadge: boolean
  showLogo: boolean

  // Showcase asset gallery
  showcaseOn: boolean
  showcaseType: ShowcaseType
  showcaseLayout: ShowcaseLayout
  showcaseShape: ShowcaseShape
  showcaseCount: number
  showcaseSize: number
  showcaseGap: number
  showcaseWave: boolean

  animOn: boolean
  animType: AnimType
  animDuration: number
  animStagger: number
  animFps: number
  animHold: number
  animBgDrift: number

  chips: Record<ChipKey, Chip>
}

export type Preset = {
  id: string
  name: string
  patch: Partial<OgState>
  chips?: Partial<Record<ChipKey, Partial<Chip>>>
}
