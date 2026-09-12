'use client'

import * as React from 'react'
import { PrismCarousel } from './prism-carousel'
import type { PrismCarouselItem } from './types'

export const WORK_PRISM: PrismCarouselItem[] = [
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-20.png',
    title: 'Autumn Retreat',
    caption: 'Architecture in foliage',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-21.png',
    title: 'Twilight Manor',
    caption: 'Evening architectural study',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-22.png',
    title: 'Concrete Lounge',
    caption: 'Minimalist interior form',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-23.png',
    title: 'Red Ribbon',
    caption: 'Kinetic typography in motion',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-24.png',
    title: 'Cosmic Ring',
    caption: 'Orbital geometry composition',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-25.png',
    title: 'River Pavilion',
    caption: 'Waterfront timber shelter',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-26.png',
    title: 'Autumn Arch',
    caption: 'Curved stone garden portal',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-27.png',
    title: 'Prism Portrait',
    caption: 'Refracted studio portraiture',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-28.png',
    title: 'Cosmic Wave',
    caption: 'Deep space undulating nebula',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-1.png',
    title: 'Twilight Ring',
    caption: 'Luminous horizon sculpture',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-2.png',
    title: 'Flora Portrait',
    caption: 'Botanical floral composition',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-4.png',
    title: 'Blossom Arch',
    caption: 'Pink floral stone portal',
  },
]

export default function BlockPrismCarousel() {
  return (
    <div className="relative h-dvh w-full overflow-hidden rounded-3xl bg-background">
      <PrismCarousel
        items={WORK_PRISM}
        panelHeight={0.58}
        gap={14}
        radius={8}
        tint="oklch(0.70 0.12 250)"
        focusable={false}
      />
    </div>
  )
}
