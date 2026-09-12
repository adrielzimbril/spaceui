'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { categories, ease, galleryImages } from '../lib/data'
import { CustomCursor } from './custom-cursor'
import { GlassDock } from './glass-dock'
import { HorizontalGallery } from './horizontal-gallery'
import { LightboxModal } from './lightbox-modal'
import { VerticalGallery } from './vertical-gallery'
import { LensWebGLLayer } from './lens-webgl-layer'
import { useCustomCursor } from '../hooks/use-custom-cursor'
import { useHorizontalDrag } from '../hooks/use-horizontal-drag'
import { useLightbox } from '../hooks/use-lightbox'

export function ClientPage() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'vertical' | 'horizontal'>('vertical')
  const [layoutAnimating, setLayoutAnimating] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const verticalRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  const { cursorActive, setCursorActive, cursorLabel, setCursorLabel, cursorX, cursorY } = useCustomCursor()

  const { horizontalRef, horizontalButtonRefs, horizontalTarget, onHorizontalWheel, beginDrag, endDrag, cancelDrag } =
    useHorizontalDrag({
      active: mode === 'horizontal',
      onOpenImage: (idx) => openImage(idx),
    })

  const {
    lightboxIndex,
    fixedPhase,
    fixedDirection,
    fixedNavIdle,
    fixedBackdropRef,
    fixedFrameRef,
    imageButtonRefs,
    openImage,
    closeImage,
    moveImage,
    scheduleFixedIdle,
  } = useLightbox({
    mode,
    verticalRef,
    horizontalRef,
    horizontalButtonRefs,
    horizontalTarget,
    onCursorStateChange: (active, label) => {
      setCursorActive(active)
      setCursorLabel(label)
    },
  })

  const currentCategory = categories[categoryIndex] ?? categories[0]
  const isFixed = lightboxIndex !== null
  const navPreviewIndex = hoveredIndex ?? lightboxIndex
  const navImage = navPreviewIndex === null ? currentCategory.thumb : galleryImages[navPreviewIndex]
  const navSubLabel = isFixed ? 'Gallery' : hoveredIndex === null ? 'Category' : 'Details'
  const navTitle = isFixed
    ? `${(lightboxIndex ?? 0) + 1} — ${galleryImages.length}`
    : hoveredIndex === null
      ? 'Details'
      : 'Gallery'

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1050)
    return () => window.clearTimeout(timer)
  }, [])

  const toggleMode = () => {
    if (layoutAnimating) return
    setLayoutAnimating(true)
    window.setTimeout(() => {
      setMode((current) => (current === 'vertical' ? 'horizontal' : 'vertical'))
      window.setTimeout(() => setLayoutAnimating(false), 80)
    }, 600)
  }

  const onVerticalScroll = () => {
    const element = verticalRef.current
    if (!element) return
    const current = element.scrollTop
    setHeaderHidden(current > 40 && current > lastScrollTop.current)
    lastScrollTop.current = current
  }

  const handleImageHover = (active: boolean, index: number) => {
    setCursorActive(active)
    setCursorLabel('Zoom')
    if (fixedPhase !== 'closed') return
    if (active) {
      setHoveredIndex(index)
    } else {
      window.setTimeout(() => {
        setHoveredIndex((current) => (current === index ? null : current))
      }, 160)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] isolate overflow-hidden bg-white text-black font-sans ${
        cursorActive || lightboxIndex !== null ? 'cursor-none' : ''
      }`}
    >
      <LensWebGLLayer
        active={mode === 'vertical'}
        hiddenIndex={lightboxIndex}
        images={galleryImages}
        imageRefs={imageButtonRefs}
        scrollRef={verticalRef}
      />

      <div className="relative size-full overflow-hidden">
        {mode === 'vertical' ? (
          <VerticalGallery
            scrollRef={verticalRef}
            images={galleryImages}
            registerRef={(node, idx) => {
              imageButtonRefs.current[idx] = node
            }}
            lightboxIndex={lightboxIndex}
            onScroll={onVerticalScroll}
            onOpenImage={openImage}
            onHover={handleImageHover}
          />
        ) : (
          <HorizontalGallery
            horizontalRef={horizontalRef}
            images={galleryImages}
            registerRef={(node, idx) => {
              horizontalButtonRefs.current[idx] = node
            }}
            lightboxIndex={lightboxIndex}
            onWheel={onHorizontalWheel}
            onPointerDown={beginDrag}
            onPointerUp={endDrag}
            onPointerCancel={cancelDrag}
            onOpenImage={openImage}
            onHover={handleImageHover}
          />
        )}
      </div>

      <LightboxModal
        lightboxIndex={lightboxIndex}
        fixedDirection={fixedDirection}
        fixedBackdropRef={fixedBackdropRef}
        fixedFrameRef={fixedFrameRef}
        images={galleryImages}
        onClose={closeImage}
        onMove={moveImage}
        onHoverControl={(active, label) => {
          setCursorActive(active)
          if (label) setCursorLabel(label)
          scheduleFixedIdle()
        }}
      />

      <CustomCursor cursorX={cursorX} cursorY={cursorY} cursorActive={cursorActive} cursorLabel={cursorLabel} />

      <GlassDock
        fixedNavIdle={fixedNavIdle}
        isFixed={isFixed}
        lightboxIndex={lightboxIndex}
        hoveredIndex={hoveredIndex}
        mode={mode}
        totalImages={galleryImages.length}
        fixedDirection={fixedDirection}
        navImage={navImage}
        navSubLabel={navSubLabel}
        navTitle={navTitle}
        onClose={closeImage}
        onOpenImage={openImage}
        onToggleMode={toggleMode}
        onMoveImage={moveImage}
      />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white text-neutral-900"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-xl font-medium tracking-tight">Immersive Lens</div>
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Loading WebGL Scene</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
