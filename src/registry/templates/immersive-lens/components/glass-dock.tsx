'use client'

import React from 'react'
import NextImage from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ease, glass } from '../lib/data'

export function GlassSheen() {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/[.025] to-black/5" />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_rgba(255,255,255,.36),inset_0_-1px_rgba(0,0,0,.05)]" />
    </>
  )
}

export interface GlassDockProps {
  fixedNavIdle: boolean
  isFixed: boolean
  lightboxIndex: number | null
  hoveredIndex: number | null
  mode: 'vertical' | 'horizontal'
  totalImages: number
  fixedDirection: number
  navImage: string
  navSubLabel: string
  navTitle: string
  onClose: () => void
  onOpenImage: (index: number) => void
  onToggleMode: () => void
  onMoveImage: (direction: number) => void
}

export function GlassDock({
  fixedNavIdle,
  isFixed,
  lightboxIndex,
  hoveredIndex,
  mode,
  totalImages,
  fixedDirection,
  navImage,
  navSubLabel,
  navTitle,
  onClose,
  onOpenImage,
  onToggleMode,
  onMoveImage,
}: GlassDockProps) {
  return (
    <nav
      className={`fixed bottom-[10px] left-1/2 z-[100] flex -translate-x-1/2 items-center gap-[5px] text-white transition-[transform,opacity] duration-500 ease-[cubic-bezier(.25,.46,.45,.94)] md:bottom-[30px] ${
        fixedNavIdle && isFixed
          ? 'pointer-events-none translate-y-[calc(100%+40px)] opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <button
        type="button"
        aria-label="Back"
        onClick={() => {
          if (lightboxIndex !== null) onClose()
          else if (typeof window !== 'undefined' && window.history.length > 1) window.history.back()
          else if (typeof window !== 'undefined') window.location.href = '/'
        }}
        className={`group relative h-[50px] overflow-hidden rounded-full transition-[width,margin,opacity,transform,border-radius] duration-500 ease-[cubic-bezier(.25,.46,.45,.94)] hover:rounded-[8px] md:h-[70px] ${
          isFixed
            ? '-mr-[5px] w-0 scale-50 opacity-0 pointer-events-none'
            : 'w-[50px] scale-100 opacity-100 md:w-[70px]'
        } ${glass}`}
      >
        <GlassSheen />
        <svg
          className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 md:size-6"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M4,12h16v5M10.5,19l-7-7M3.5,12l7-7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <div
        className={`relative flex h-[50px] items-center gap-[10px] overflow-hidden rounded-[8px] p-[10px] transition-[width] duration-500 ease-[cubic-bezier(.25,.46,.45,.94)] md:h-[70px] ${
          isFixed ? 'w-[220px] md:w-[260px]' : 'w-[152px] md:w-[180px]'
        } ${glass}`}
      >
        {hoveredIndex !== null && !isFixed && (
          <button
            type="button"
            aria-label={`Open image ${hoveredIndex + 1}`}
            onClick={() => onOpenImage(hoveredIndex)}
            className="absolute inset-0 z-20"
          />
        )}
        <GlassSheen />
        <span className="relative size-[30px] flex-none overflow-hidden rounded-full bg-black/20 shadow-inner md:size-[50px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={navImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <NextImage src={navImage} alt="" fill sizes="70px" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </span>
        <span className="relative h-[2.4em] min-w-0 flex-1 overflow-hidden text-center uppercase leading-none">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={isFixed ? 'gallery-fixed' : `${navSubLabel}-${navTitle}`}
              initial={{ y: '120%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-120%', opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] normal-case text-white/60">{navSubLabel}</span>
              <span className="mt-[2px] max-w-full truncate text-[14px] font-semibold md:text-[16px]">
                {isFixed ? (
                  <span className="flex items-center justify-center">
                    <span className="relative inline-block h-[1.25em] min-w-[2ch] overflow-hidden text-right">
                      <AnimatePresence initial={false} custom={fixedDirection} mode="popLayout">
                        <motion.span
                          key={lightboxIndex}
                          custom={fixedDirection}
                          initial={{
                            y: fixedDirection > 0 ? '100%' : '-100%',
                            opacity: 0,
                          }}
                          animate={{ y: '0%', opacity: 1 }}
                          exit={{
                            y: fixedDirection > 0 ? '-100%' : '100%',
                            opacity: 0,
                          }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="block"
                        >
                          {(lightboxIndex ?? 0) + 1}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="mx-[5px] h-px w-[15px] bg-white" />
                    <span>{totalImages}</span>
                  </span>
                ) : (
                  navTitle
                )}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>
        <AnimatePresence>
          {isFixed && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="relative z-30 flex flex-none items-center gap-[5px] overflow-hidden"
            >
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => onMoveImage(-1)}
                className="flex h-5 w-7 items-center justify-center rounded-full bg-black/20 shadow-inner md:h-6 md:w-9"
              >
                <svg viewBox="0 0 16 16" className="size-4">
                  <path d="M8,6v1M8,6.5l-3,3M11,9.5l-3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => onMoveImage(1)}
                className="flex h-5 w-7 items-center justify-center rounded-full bg-black/20 shadow-inner md:h-6 md:w-9"
              >
                <svg viewBox="0 0 16 16" className="size-4">
                  <path d="M8,10.5v-1M5,7l3,3M8,10l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label={isFixed ? 'Close gallery' : hoveredIndex !== null ? `Open image ${hoveredIndex + 1}` : 'Layout'}
        onClick={() => {
          if (isFixed) onClose()
          else if (hoveredIndex !== null) onOpenImage(hoveredIndex)
          else onToggleMode()
        }}
        className={`group relative size-[50px] overflow-hidden rounded-full transition-[border-radius] duration-[350ms] hover:rounded-[8px] md:size-[70px] ${glass}`}
      >
        <GlassSheen />
        <AnimatePresence initial={false} mode="wait">
          <motion.svg
            key={isFixed ? 'close' : hoveredIndex !== null ? 'plus' : mode}
            initial={{ opacity: 0, scale: 0.65, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.65, rotate: 45 }}
            transition={{ duration: 0.35, ease }}
            className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 md:size-6"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d={
                isFixed
                  ? 'M5,5L19,19M19,5L5,19'
                  : hoveredIndex !== null
                    ? 'M12,4V20M4,12H20'
                    : mode === 'vertical'
                      ? 'M18,2v3H6v-3M12,15H6V9h12v6h-6M6,22v-3h12v3'
                      : 'M2,6h3v12H2M15,12V6H9v12h6v-6M22,18h-3V6h3'
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </motion.svg>
        </AnimatePresence>
      </button>
    </nav>
  )
}
