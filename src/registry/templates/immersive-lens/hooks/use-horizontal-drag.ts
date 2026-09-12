'use client'

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'

export interface UseHorizontalDragOptions {
  active: boolean
  onOpenImage: (index: number) => void
}

export function useHorizontalDrag({ active, onOpenImage }: UseHorizontalDragOptions) {
  const horizontalRef = useRef<HTMLDivElement>(null)
  const horizontalButtonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const horizontalTarget = useRef(0)
  const horizontalVelocity = useRef(0)
  const horizontalRaf = useRef<number | null>(null)

  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    distance: 0,
    lastX: 0,
    lastTime: 0,
    pressedIndex: null as number | null,
  })

  useEffect(() => {
    if (!active) return
    const element = horizontalRef.current
    if (!element) return
    horizontalTarget.current = element.scrollLeft

    const update = () => {
      if (!dragState.current.active) {
        horizontalTarget.current += horizontalVelocity.current
        horizontalVelocity.current *= 0.92
      }
      const max = Math.max(element.scrollWidth - element.clientWidth, 0)
      horizontalTarget.current = Math.max(0, Math.min(horizontalTarget.current, max))
      element.scrollLeft += (horizontalTarget.current - element.scrollLeft) * 0.105
      horizontalRaf.current = window.requestAnimationFrame(update)
    }

    horizontalRaf.current = window.requestAnimationFrame(update)
    return () => {
      if (horizontalRaf.current !== null) {
        window.cancelAnimationFrame(horizontalRaf.current)
      }
      horizontalRaf.current = null
    }
  }, [active])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (dragState.current.active && horizontalRef.current) {
        const now = performance.now()
        const elapsed = Math.max(now - dragState.current.lastTime, 8)
        const delta = dragState.current.lastX - event.clientX
        dragState.current.distance = Math.abs(event.clientX - dragState.current.startX)
        horizontalTarget.current = dragState.current.scrollLeft - (event.clientX - dragState.current.startX) * 1.05
        horizontalVelocity.current = (delta / elapsed) * 16
        dragState.current.lastX = event.clientX
        dragState.current.lastTime = now
      }
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const onHorizontalWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    horizontalTarget.current += (event.deltaY + event.deltaX) * 1.08
    horizontalVelocity.current +=
      Math.sign(event.deltaY + event.deltaX) * Math.min(Math.abs(event.deltaY + event.deltaX) * 0.02, 0.68) * 18.5
  }

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-horizontal-lens-index]') : null
    const pressedIndex = Number(target?.dataset.horizontalLensIndex)

    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      distance: 0,
      lastX: event.clientX,
      lastTime: performance.now(),
      pressedIndex: Number.isInteger(pressedIndex) ? pressedIndex : null,
    }
    horizontalTarget.current = event.currentTarget.scrollLeft
    horizontalVelocity.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { distance, pressedIndex } = dragState.current
    dragState.current.active = false
    horizontalVelocity.current = Math.max(-68, Math.min(horizontalVelocity.current * 1.85, 68))
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (distance < 6 && pressedIndex !== null) onOpenImage(pressedIndex)
  }

  const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current.active = false
    dragState.current.pressedIndex = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    horizontalRef,
    horizontalButtonRefs,
    horizontalTarget,
    onHorizontalWheel,
    beginDrag,
    endDrag,
    cancelDrag,
  }
}
