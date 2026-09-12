'use client'

import React, { useRef, type RefObject } from 'react'
import { motion } from 'motion/react'
import { galleryImageSizes } from './lens-webgl-layer'
import { ease } from '../lib/data'

export interface GalleryImageProps {
  index: number
  scrollRef: RefObject<HTMLDivElement | null>
  onOpen: () => void
  onHover: (active: boolean, index: number) => void
  registerRef: (node: HTMLButtonElement | null, index: number) => void
  isFixed: boolean
}

export function GalleryImage({ index, scrollRef, onOpen, onHover, registerRef, isFixed }: GalleryImageProps) {
  const targetRef = useRef<HTMLButtonElement>(null)
  const sourceSize = galleryImageSizes[index] ?? [2560, 1707]

  return (
    <motion.button
      ref={(node) => {
        targetRef.current = node
        registerRef(node, index)
      }}
      type="button"
      onClick={onOpen}
      onMouseEnter={() => onHover(true, index)}
      onMouseLeave={() => onHover(false, index)}
      initial={{ opacity: 0, y: 72, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ root: scrollRef, once: true, amount: 0.08 }}
      transition={{ duration: 1.05, ease }}
      animate={{ opacity: isFixed ? 0 : 1 }}
      style={{ aspectRatio: `${sourceSize[0]} / ${sourceSize[1]}` }}
      className="group relative block w-full cursor-zoom-in bg-transparent"
    >
      <span className="sr-only">{`Lens ${String(index + 1).padStart(2, '0')}`}</span>
      <span className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[.025]" />
    </motion.button>
  )
}

export interface VerticalGalleryProps {
  scrollRef: RefObject<HTMLDivElement | null>
  onScroll: () => void
  images: readonly string[]
  lightboxIndex: number | null
  onOpenImage: (index: number) => void
  registerRef: (node: HTMLButtonElement | null, index: number) => void
  onHover: (active: boolean, index: number) => void
}

export function VerticalGallery({
  scrollRef,
  onScroll,
  images,
  lightboxIndex,
  onOpenImage,
  registerRef,
  onHover,
}: VerticalGalleryProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <main className="px-5 pb-40 pt-[clamp(60px,10svh,120px)] md:px-[60px]">
        <div
          aria-hidden="true"
          className="my-[100px] text-center font-serif text-[clamp(64px,13.1184vw,190px)] opacity-0"
        >
          Category
        </div>
        <div className="mx-auto grid w-full max-w-[720px] gap-y-5 md:gap-y-[30px]">
          {images.map((src, index) => (
            <GalleryImage
              key={src}
              index={index}
              scrollRef={scrollRef}
              onOpen={() => onOpenImage(index)}
              registerRef={registerRef}
              isFixed={lightboxIndex === index}
              onHover={onHover}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
