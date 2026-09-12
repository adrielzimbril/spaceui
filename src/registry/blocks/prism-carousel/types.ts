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
  /** Wordmark in the top-left. Omit to drop it. @default undefined */
  brand?: string
  /** Panel height, as a fraction of the stage. @default 0.62 */
  panelHeight?: number
  /** Space between panels, in px. @default 12 */
  gap?: number
  /** Panel corner radius, in px. @default 6 */
  radius?: number
  /** The lens ring and aura colour. @default "oklch(0.70 0.12 250)" */
  tint?: string
  /** Click a panel to centre and enlarge it. @default false */
  focusable?: boolean
  /** Label on the focused panel's dismiss control. @default "Close" */
  closeLabel?: string
  /** Extra classes on the root surface. @default undefined */
  className?: string
}
