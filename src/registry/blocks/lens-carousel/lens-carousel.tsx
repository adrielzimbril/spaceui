'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { LensWebGLLayer } from './lens-webgl-layer'
import { VerticalGallery } from './vertical-gallery'
import type { LensCarouselProps } from './types'

export function LensCarousel({ items, brand, className, ...props }: LensCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const imageRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const images = React.useMemo(() => items.map((item) => item.image), [items])

  return (
    <section
      aria-roledescription="carousel"
      aria-label={brand ?? 'Lens Gallery'}
      className={cn('relative h-full w-full overflow-hidden bg-white text-black', className)}
      {...props}
    >
      <LensWebGLLayer active hiddenIndex={null} images={images} imageRefs={imageRefs} scrollRef={scrollRef} />
      <VerticalGallery
        scrollRef={scrollRef}
        images={images}
        lightboxIndex={null}
        onScroll={() => {}}
        onOpenImage={() => {}}
        registerRef={(node, index) => {
          imageRefs.current[index] = node
        }}
        onHover={() => {}}
      />
    </section>
  )
}
