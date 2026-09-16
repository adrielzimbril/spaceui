'use client'

import React, { type RefObject } from 'react'
import NextImage from 'next/image'
import { AnimatePresence, motion } from 'motion/react'

export interface LightboxModalProps {
  lightboxIndex: number | null
  fixedDirection: number
  images: readonly string[]
  fixedBackdropRef: RefObject<HTMLDivElement | null>
  fixedFrameRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onMove: (direction: number) => void
  onHoverControl: (active: boolean, label?: string) => void
}

export function LightboxModal({
  lightboxIndex,
  fixedDirection,
  images,
  fixedBackdropRef,
  fixedFrameRef,
  onClose,
  onMove,
  onHoverControl,
}: LightboxModalProps) {
  return (
    <AnimatePresence>
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[80] overflow-hidden">
          <div ref={fixedBackdropRef} className="pointer-events-none absolute inset-0 bg-black opacity-0" />
          <div ref={fixedFrameRef} className="pointer-events-none fixed z-10 overflow-hidden bg-black">
            <AnimatePresence initial={false} mode="sync" custom={fixedDirection}>
              <motion.div
                key={images[lightboxIndex]}
                custom={fixedDirection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.36, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <NextImage src={images[lightboxIndex]} alt="" fill sizes="100vw" className="object-cover" priority />
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            type="button"
            aria-label="Close image"
            onClick={onClose}
            onMouseEnter={() => onHoverControl(true, 'Close')}
            onMouseLeave={() => onHoverControl(false)}
            className="absolute inset-0 z-[11] cursor-zoom-out"
          />
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation()
              onMove(-1)
            }}
            onMouseEnter={() => onHoverControl(true, 'Prev')}
            onMouseLeave={() => onHoverControl(false, 'Close')}
            className="absolute inset-y-0 left-0 z-20 w-[180px] max-w-[18vw] cursor-w-resize"
          />
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation()
              onMove(1)
            }}
            onMouseEnter={() => onHoverControl(true, 'Next')}
            onMouseLeave={() => onHoverControl(false, 'Close')}
            className="absolute inset-y-0 right-0 z-20 w-[180px] max-w-[18vw] cursor-e-resize"
          />
        </div>
      )}
    </AnimatePresence>
  )
}
