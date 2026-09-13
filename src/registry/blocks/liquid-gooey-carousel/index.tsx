'use client'

import * as React from 'react'
import { LiquidGooeyCarousel } from './liquid-gooey-carousel'
import type { LiquidGooeyItem } from './types'

export const WORK_LIQUID_ITEMS: LiquidGooeyItem[] = [
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-10.png',
    title: 'Glass Pavilion',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-11.png',
    title: 'Modern Villa',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-12.png',
    title: 'Cyber Visor',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-13.png',
    title: 'Ocean Sanctuary',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-14.png',
    title: 'Citrus Glow',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-16.png',
    title: 'Desert Villa',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-17.png',
    title: 'Forest Capsule',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-18.png',
    title: 'Cliff Pavilion',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-20.png',
    title: 'Autumn Retreat',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-21.png',
    title: 'Twilight Manor',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-22.png',
    title: 'Concrete Lounge',
  },
  {
    image: 'https://cdn.spaceui.one/atom/samples/image-24.png',
    title: 'Cosmic Ring',
  },
]

export default function BlockLiquidGooeyCarousel() {
  return (
    <div className="relative h-dvh w-full overflow-hidden rounded-3xl bg-background">
      <LiquidGooeyCarousel items={WORK_LIQUID_ITEMS} arc={1.0} cardSize={0.38} cardRatio={1.15} fuse={0.095} />
    </div>
  )
}
