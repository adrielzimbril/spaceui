import type * as React from 'react'

export interface PrismCarouselItem {
  /** Cover art. Cross-origin sources must send CORS headers. */
  image: string
  /** Shown while this panel is centred. */
  title: string
  /** The line under the title. */
  caption?: string
}

export interface PrismCarouselProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'children'> {
  items: PrismCarouselItem[]
  /** Panel height, as a fraction of the stage. @default 0.62 */
  panelHeight?: number
  /** Space between panels, in px. @default 12 */
  gap?: number
  /** Panel corner radius, in px. @default 6 */
  radius?: number
  /** The lens ring and aura colour. @default "oklch(0.76 0.12 62.53)" */
  tint?: string
  /** Gooey fluid refraction and edge blending. @default 0.35 */
  gooey?: boolean | number
  /** Click a panel to centre and enlarge it. @default false */
  focusable?: boolean
  /** Label on the focused panel's dismiss control. @default "Close" */
  closeLabel?: string
  /** Extra classes on the root surface. @default undefined */
  className?: string
}
