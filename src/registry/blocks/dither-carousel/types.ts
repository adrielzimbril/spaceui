import type * as React from 'react'

export interface DitherCarouselItem {
  /** Cover art. Cross-origin sources must send CORS headers. */
  image: string
  /** Shown while this card is at the front. */
  title: string
}

export interface DitherCarouselProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'children'> {
  items: DitherCarouselItem[]
  /** Wordmark in the top-left. Omit to drop it. @default undefined */
  brand?: string
  /** The lit tone the grain resolves to. Defaults to the theme's foreground. @default undefined */
  accent?: string
  /** Grain lattice pitch, measured in device pixels. Larger prints coarser. @default 7.5 */
  cell?: number
  /** How much of the frame's height stays sharp before the dissolve starts, 0-1. @default 0.25 */
  focusBand?: number
  /** Turn of the helix between one card and the next, in radians. @default 0.8 */
  twist?: number
  /** Rise of the helix between one card and the next, in card heights. @default 0.79 */
  rise?: number
  /** Card height in world units. @default 2.2 */
  cardHeight?: number
  /** Card width / height. Art is cover-fitted into it, so match your own. @default 0.82 */
  cardRatio?: number
  /** Play the arrival - cards materialize out of the grain. @default true */
  entry?: boolean
  /** Extra classes on the root surface. @default undefined */
  className?: string
}
