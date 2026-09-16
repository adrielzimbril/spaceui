'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { galleryImages } from '../lib/data'
import { galleryImageSizes } from '@/registry/blocks/lens-carousel/lens-webgl-layer'

function setFixedBackdropMask(element: HTMLDivElement, progress: number, direction: 1 | -1) {
  const clamped = Math.max(0, Math.min(progress, 1))
  const arcProgress = Math.sin(clamped * Math.PI)
  const aspectScale = Math.max(0.35, Math.min(window.innerWidth / Math.max(window.innerHeight, 1), 1))
  const edgePoints = Array.from({ length: 21 }, (_, index) => {
    const x = index / 20
    const arc = Math.sin(x * Math.PI) * 0.1 * aspectScale * arcProgress
    const edge = Math.max(0, Math.min(clamped + arc, 1))
    return `${x * 100}% ${(1 - edge) * 100}%`
  })
  const polygon =
    direction > 0
      ? `polygon(${edgePoints.join(',')},100% 100%,0% 100%)`
      : `polygon(0% 0%,100% 0%,${edgePoints.reverse().join(',')})`

  element.style.clipPath = polygon
  ;(element.style as any).webkitClipPath = polygon
}

export interface UseLightboxOptions {
  mode: 'vertical' | 'horizontal'
  verticalRef: React.RefObject<HTMLDivElement | null>
  horizontalRef: React.RefObject<HTMLDivElement | null>
  horizontalButtonRefs: React.RefObject<(HTMLButtonElement | null)[]>
  horizontalTarget: React.RefObject<number>
  onCursorStateChange?: (active: boolean, label: string) => void
}

export function useLightbox({
  mode,
  verticalRef,
  horizontalRef,
  horizontalButtonRefs,
  horizontalTarget,
  onCursorStateChange,
}: UseLightboxOptions) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [fixedPhase, setFixedPhase] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [fixedDirection, setFixedDirection] = useState(1)
  const [fixedNavIdle, setFixedNavIdle] = useState(false)

  const fixedBackdropRef = useRef<HTMLDivElement>(null)
  const fixedFrameRef = useRef<HTMLDivElement>(null)
  const imageButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const fixedSourceRect = useRef<DOMRect | null>(null)
  const fixedScrollPosition = useRef(0)
  const fixedIdleTimer = useRef<any>(null)

  const scheduleFixedIdle = useCallback(() => {
    if (fixedIdleTimer.current) window.clearTimeout(fixedIdleTimer.current)
    setFixedNavIdle(false)
    fixedIdleTimer.current = window.setTimeout(() => {
      setFixedNavIdle(true)
      onCursorStateChange?.(false, 'Zoom')
    }, 2000)
  }, [onCursorStateChange])

  const getFixedTargetRect = useCallback((index: number) => {
    const sourceSize = galleryImageSizes[index] ?? [2560, 1707]
    const ratio = sourceSize[0] / sourceSize[1]
    const horizontalPadding = window.innerWidth <= 640 ? 20 : 60
    const verticalPadding = window.innerWidth <= 640 ? 20 : 60
    const maxWidth = Math.min(1080, window.innerWidth - horizontalPadding * 2)
    const maxHeight = window.innerHeight - verticalPadding * 2
    const width = Math.min(maxWidth, maxHeight * ratio)
    const height = width / ratio

    return {
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2,
      width,
      height,
    }
  }, [])

  const openImage = useCallback(
    (index: number) => {
      if (fixedPhase !== 'closed') return
      const sourceButton = mode === 'vertical' ? imageButtonRefs.current[index] : horizontalButtonRefs.current?.[index]
      const source = sourceButton
      fixedScrollPosition.current =
        mode === 'vertical' ? (verticalRef.current?.scrollTop ?? 0) : (horizontalRef.current?.scrollLeft ?? 0)
      fixedSourceRect.current = source?.getBoundingClientRect() ?? null

      setLightboxIndex(index)
      setFixedDirection(1)
      setFixedPhase('opening')
      onCursorStateChange?.(false, 'Close')
    },
    [fixedPhase, horizontalButtonRefs, horizontalRef, mode, onCursorStateChange, verticalRef],
  )

  const closeImage = useCallback(() => {
    if (lightboxIndex === null || fixedPhase === 'closing' || fixedPhase === 'closed') return

    setFixedPhase('closing')
    setFixedNavIdle(false)
    if (fixedIdleTimer.current) window.clearTimeout(fixedIdleTimer.current)

    const sourceButton =
      mode === 'vertical' ? imageButtonRefs.current[lightboxIndex] : horizontalButtonRefs.current?.[lightboxIndex]
    const source = sourceButton
    const scrollContainer = mode === 'vertical' ? verticalRef.current : horizontalRef.current

    if (source && scrollContainer) {
      if (mode === 'vertical') {
        scrollContainer.scrollTop = fixedScrollPosition.current
      } else {
        scrollContainer.scrollLeft = fixedScrollPosition.current
        if (horizontalTarget) horizontalTarget.current = fixedScrollPosition.current
      }
    }

    window.requestAnimationFrame(() => {
      const target = source?.getBoundingClientRect() ?? fixedSourceRect.current
      const frame = fixedFrameRef.current
      const backdrop = fixedBackdropRef.current
      if (!frame || !backdrop || !target) {
        setLightboxIndex(null)
        setFixedPhase('closed')
        onCursorStateChange?.(false, 'Zoom')
        return
      }
      const backdropProgress = { value: 0 }
      setFixedBackdropMask(backdrop, 0, -1)

      gsap
        .timeline({
          defaults: { overwrite: true },
          onComplete: () => {
            setLightboxIndex(null)
            setFixedPhase('closed')
            onCursorStateChange?.(false, 'Zoom')
          },
        })
        .to(
          frame,
          {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            duration: 1,
            ease: 'power3.inOut',
          },
          0,
        )
        .to(
          backdropProgress,
          {
            value: 1,
            duration: 1.05,
            ease: 'power3.inOut',
            onUpdate: () => setFixedBackdropMask(backdrop, backdropProgress.value, -1),
          },
          0,
        )
    })
  }, [
    fixedPhase,
    horizontalButtonRefs,
    horizontalRef,
    horizontalTarget,
    lightboxIndex,
    mode,
    onCursorStateChange,
    verticalRef,
  ])

  const moveImage = useCallback(
    (direction: number) => {
      if (fixedPhase !== 'open') return
      setFixedDirection(direction)
      setLightboxIndex((current) =>
        current === null ? current : (current + direction + galleryImages.length) % galleryImages.length,
      )
      scheduleFixedIdle()
    },
    [fixedPhase, scheduleFixedIdle],
  )

  // GSAP opening animation
  useEffect(() => {
    if (lightboxIndex === null || fixedPhase !== 'opening' || !fixedFrameRef.current || !fixedBackdropRef.current)
      return

    const source = fixedSourceRect.current ?? imageButtonRefs.current[lightboxIndex]?.getBoundingClientRect()
    const target = getFixedTargetRect(lightboxIndex)
    if (!source) return
    const backdropProgress = { value: 0 }

    gsap.killTweensOf([fixedBackdropRef.current, fixedFrameRef.current])
    gsap.set(fixedBackdropRef.current, { opacity: 1 })
    setFixedBackdropMask(fixedBackdropRef.current, 0, 1)
    gsap.set(fixedFrameRef.current, {
      left: source.left,
      top: source.top,
      width: source.width,
      height: source.height,
    })

    gsap
      .timeline({
        defaults: { overwrite: true },
        onComplete: () => {
          setFixedPhase('open')
          scheduleFixedIdle()
        },
      })
      .to(
        backdropProgress,
        {
          value: 1,
          duration: 1.05,
          ease: 'power3.inOut',
          onUpdate: () => {
            if (fixedBackdropRef.current) {
              setFixedBackdropMask(fixedBackdropRef.current, backdropProgress.value, 1)
            }
          },
        },
        0,
      )
      .to(
        fixedFrameRef.current,
        {
          ...target,
          duration: 1,
          ease: 'power3.inOut',
        },
        0,
      )
  }, [fixedPhase, getFixedTargetRect, lightboxIndex, scheduleFixedIdle])

  // Keyboard navigation and pointermove idle reset
  useEffect(() => {
    const onMove = () => {
      if (lightboxIndex !== null) scheduleFixedIdle()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxIndex !== null) closeImage()
      }
      if (lightboxIndex !== null && event.key === 'ArrowLeft') moveImage(-1)
      if (lightboxIndex !== null && event.key === 'ArrowRight') moveImage(1)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      if (fixedIdleTimer.current) window.clearTimeout(fixedIdleTimer.current)
    }
  }, [closeImage, lightboxIndex, moveImage, scheduleFixedIdle])

  return {
    lightboxIndex,
    setLightboxIndex,
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
  }
}
