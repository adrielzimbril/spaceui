'use client'
/* eslint-disable @next/next/no-img-element */

import React, {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { motion } from 'motion/react'
import { ease } from '../lib/data'

export interface HorizontalGalleryProps {
  horizontalRef: RefObject<HTMLDivElement | null>
  images: readonly string[]
  lightboxIndex: number | null
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void
  registerRef: (node: HTMLButtonElement | null, index: number) => void
  onOpenImage: (index: number) => void
  onHover: (active: boolean, index: number) => void
}

export function HorizontalGallery({
  horizontalRef,
  images,
  lightboxIndex,
  onWheel,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  registerRef,
  onOpenImage,
  onHover,
}: HorizontalGalleryProps) {
  return (
    <div
      ref={horizontalRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="relative z-10 flex h-full w-full touch-pan-y select-none items-center overflow-hidden"
    >
      <div className="flex shrink-0 items-center pl-[clamp(24px,5vw,72px)] pr-[clamp(24px,5vw,72px)]">
        {images.map((src, index) => {
          return (
            <motion.button
              key={src}
              ref={(node) => registerRef(node, index)}
              type="button"
              onClick={() => onOpenImage(index)}
              onMouseEnter={() => onHover(true, index)}
              onMouseLeave={() => onHover(false, index)}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: lightboxIndex === index ? 0 : 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="group relative mr-[clamp(24px,4vw,60px)] block shrink-0 cursor-zoom-in bg-transparent"
              data-horizontal-lens-index={index}
              style={{
                width: 'clamp(280px, 38vw, 560px)',
                aspectRatio: '16 / 10',
              }}
            >
              <span className="sr-only">{`Lens ${String(index + 1).padStart(2, '0')}`}</span>
              <span className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[.025]" />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
