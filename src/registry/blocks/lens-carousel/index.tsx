'use client'

import * as React from 'react'
import { LensCarousel } from './lens-carousel'
import type { LensCarouselItem } from './types'

export const WORK_LENS_ITEMS: LensCarouselItem[] = [
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-1.png',
    title: 'Twilight Ring',
    category: 'Sculpture',
    caption: 'Luminous coastal installation at dusk',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-2.png',
    title: 'Flora Portrait',
    category: 'Portrait',
    caption: 'Botanical florals and delicate light',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-3.png',
    title: 'Forest Sanctum',
    category: 'Architecture',
    caption: 'Timber pavilion amidst misty pines',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-4.png',
    title: 'Blossom Arch',
    category: 'Architecture',
    caption: 'Curved stone portal framed by cherry blossoms',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-5.png',
    title: 'Botanical Slumber',
    category: 'Portrait',
    caption: 'Dreamy resting figure in soft green foliage',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-6.png',
    title: 'Oculus Coast',
    category: 'Architecture',
    caption: 'Circular horizon portal facing sunset waters',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-7.png',
    title: 'Sanctuary Cave',
    category: 'Interior',
    caption: 'Subterranean arches and reflecting pool',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-8.png',
    title: 'Seaside Villa',
    category: 'Architecture',
    caption: 'Minimalist glass architecture at twilight',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-9.png',
    title: 'Golden Shimmer',
    category: 'Portrait',
    caption: 'Warm kinetic light refraction study',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-10.png',
    title: 'Glass Pavilion',
    category: 'Architecture',
    caption: 'Luminous residence illuminated against evening skies',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-11.png',
    title: 'Modern Villa',
    category: 'Architecture',
    caption: 'Balanced geometric concrete and glass retreat',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-13.png',
    title: 'Ocean Sanctuary',
    category: 'Architecture',
    caption: 'Minimalist waterfront shelter on coastal rock',
  },
]

export default function BlockLensCarousel() {
  return (
    <div className="relative h-dvh w-full overflow-hidden rounded-3xl bg-background">
      <LensCarousel items={WORK_LENS_ITEMS} />
    </div>
  )
}
