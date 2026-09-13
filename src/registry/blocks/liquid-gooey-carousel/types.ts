import type * as React from 'react'

export interface LiquidGooeyItem {
  /** Cover image URL. */
  image: string
  /** Title caption displayed for the active card. */
  title: string
  /** Optional secondary subtitle/discipline meta tag. */
  meta?: string
}

export interface LiquidGooeyCarouselProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'children'> {
  /** Array of items presented in the continuous circular field. */
  items: LiquidGooeyItem[]
  /** Brand watermark displayed in the header area. @default undefined */
  brand?: string
  /** Cylindrical arc curvature radius in stage units. @default 1.0 */
  arc?: number
  /** Card primary edge scale relative to viewport width. @default 0.38 */
  cardSize?: number
  /** Aspect ratio (width / height) for each artwork tile. @default 1.15 */
  cardRatio?: number
  /** Rest metaball fusion distance between adjacent cards. @default 0.095 */
  fuse?: number
  /** Whether organic strand bridges stretch between separated cards. @default true */
  threads?: boolean
  /** Whether optical chromatic boundary refraction is enabled. @default true */
  glass?: boolean
  /** Custom class name on the root section. */
  className?: string
}

export interface GooeyCardTransform {
  x: number
  y: number
  angle: number
  scale: number
}
