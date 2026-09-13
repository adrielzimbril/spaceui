import type * as React from 'react'

export interface LensCarouselItem {
  image: string
  title: string
  category?: string
  caption?: string
}

export interface LensCarouselProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'children'> {
  items: LensCarouselItem[]
  brand?: string
  onSelect?: (index: number) => void
  cardWidth?: string
  cardAspectRatio?: string
  className?: string
}
