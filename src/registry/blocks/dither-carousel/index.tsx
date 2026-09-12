'use client'

import * as React from 'react'
import { DitherCarousel } from './dither-carousel'
import type { DitherCarouselItem } from './types'

export const WORK_DITHER_ITEMS: DitherCarouselItem[] = [
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-15.png',
    title: 'Twilight Silhouette',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-19.jpg',
    title: 'Floral Veil',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-27.png',
    title: 'Prism Portrait',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-32.png',
    title: 'Sunlit Freckles',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-33.png',
    title: 'Hydrangea Profile',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-34.jpg',
    title: 'Glass Ruffle',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-35.png',
    title: 'Cyber Visor',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-36.jpg',
    title: 'Jellyfish Veil',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-37.jpg',
    title: 'Light Streak',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-38.jpg',
    title: 'Amber Silhouette',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-39.png',
    title: 'Kinetic Sprint',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-40.png',
    title: 'Astronaut Visor',
  },
]

export default function BlockDitherCarousel() {
  return (
    <div className="relative h-dvh w-full overflow-hidden rounded-3xl bg-background">
      <DitherCarousel
        items={WORK_DITHER_ITEMS}
        cell={7.5}
        focusBand={0.32}
        twist={0.8}
        rise={0.79}
        cardHeight={2.2}
        cardRatio={0.82}
      />
    </div>
  )
}
