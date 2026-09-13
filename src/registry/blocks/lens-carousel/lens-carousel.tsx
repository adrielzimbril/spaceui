'use client'

import * as React from 'react'
import NextImage from 'next/image'
import { cn } from '@/registry/lib/utils'
import type { LensCarouselItem, LensCarouselProps } from './types'

const ATMOSPHERIC_PALETTES: [string, string, string, string][] = [
  ['#F0E6EB', '#B05A49', '#E9C88F', '#30334A'],
  ['#8FAAD7', '#B0CDF2', '#D4ECFC', '#7089B6'],
  ['#D0AE93', '#FAEDCE', '#D5CDCA', '#8C7874'],
  ['#EDF5F8', '#C8D5DA', '#2A2728', '#B6AAB0'],
  ['#EDEDEE', '#332D2D', '#CDB7AC', '#534B4B'],
  ['#FAF7EE', '#EBCA94', '#D5D0CF', '#CFAA78'],
  ['#524F4A', '#75706A', '#979287', '#B6B3A8'],
  ['#4D4C48', '#757167', '#959288', '#B7B3A7'],
  ['#4D4B46', '#D8D3C8', '#777066', '#B9B2A7'],
  ['#8999A7', '#F3EACF', '#4F4C34', '#D0C9B2'],
  ['#F3FBFE', '#B7C6D3', '#59564D', '#ECD8B5'],
  ['#D3E5F0', '#AFC8DC', '#7193B0', '#B4CFE6'],
]

function getGradientStyle(index: number) {
  const p = ATMOSPHERIC_PALETTES[index % ATMOSPHERIC_PALETTES.length]
  return {
    background: `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.45) 100%), linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 35%, ${p[2]} 70%, ${p[3]} 100%)`,
  }
}

export function LensCarousel({
  items,
  brand,
  onSelect,
  cardWidth = 'clamp(320px, 44vw, 680px)',
  cardAspectRatio = '16 / 10',
  className,
  ...props
}: LensCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({})

  const dragTarget = React.useRef(0)
  const dragVelocity = React.useRef(0)
  const rafId = React.useRef<number | null>(null)

  const dragState = React.useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    distance: 0,
    lastX: 0,
    lastTime: 0,
  })

  // Physics animation loop
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    dragTarget.current = el.scrollLeft

    const update = () => {
      if (!dragState.current.active) {
        dragTarget.current += dragVelocity.current
        dragVelocity.current *= 0.92
      }
      const max = Math.max(el.scrollWidth - el.clientWidth, 0)
      dragTarget.current = Math.max(0, Math.min(dragTarget.current, max))
      el.scrollLeft += (dragTarget.current - el.scrollLeft) * 0.12

      // Detect active card near center
      const center = el.scrollLeft + el.clientWidth * 0.5
      let closestDist = Infinity
      let closestIdx = 0
      for (let i = 0; i < items.length; i++) {
        const card = cardRefs.current[i]
        if (!card) continue
        const cardCenter = card.offsetLeft + card.offsetWidth * 0.5
        const dist = Math.abs(center - cardCenter)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = i
        }
      }
      setActive((prev) => (prev === closestIdx ? prev : closestIdx))

      rafId.current = window.requestAnimationFrame(update)
    }

    rafId.current = window.requestAnimationFrame(update)
    return () => {
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current)
      }
      rafId.current = null
    }
  }, [items.length])

  // Global pointer move listener during drag
  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragState.current.active || !containerRef.current) return
      const now = performance.now()
      const elapsed = Math.max(now - dragState.current.lastTime, 8)
      const delta = dragState.current.lastX - e.clientX
      dragState.current.distance = Math.abs(e.clientX - dragState.current.startX)
      dragTarget.current = dragState.current.scrollLeft - (e.clientX - dragState.current.startX) * 1.05
      dragVelocity.current = (delta / elapsed) * 16
      dragState.current.lastX = e.clientX
      dragState.current.lastTime = now
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    dragTarget.current += (e.deltaY + e.deltaX) * 1.05
    dragVelocity.current += Math.sign(e.deltaY + e.deltaX) * Math.min(Math.abs(e.deltaY + e.deltaX) * 0.02, 0.65) * 18
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    setIsDragging(true)
    dragState.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: containerRef.current.scrollLeft,
      distance: 0,
      lastX: e.clientX,
      lastTime: performance.now(),
    }
    dragTarget.current = containerRef.current.scrollLeft
    dragVelocity.current = 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    dragState.current.active = false
    dragVelocity.current = Math.max(-60, Math.min(dragVelocity.current * 1.8, 60))
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const scrollToCard = (index: number) => {
    const card = cardRefs.current[index]
    const container = containerRef.current
    if (!card || !container) return
    const target = card.offsetLeft - (container.clientWidth - card.offsetWidth) * 0.5
    dragTarget.current = Math.max(0, Math.min(target, container.scrollWidth - container.clientWidth))
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={brand ?? 'Lens Gallery'}
      className={cn(
        'relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-background py-8 text-foreground',
        className,
      )}
      {...props}
    >
      {/* Optional Top Bar */}
      {brand && (
        <header className="relative z-20 flex shrink-0 items-center justify-between px-8">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">{brand}</span>
        </header>
      )}

      {/* Main Drag Surface */}
      <div
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          'relative z-10 flex h-full w-full touch-pan-y items-center overflow-x-hidden',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        <div className="flex shrink-0 items-center gap-[clamp(20px,3.5vw,48px)] pl-[clamp(24px,6vw,96px)] pr-[clamp(24px,6vw,96px)]">
          {items.map((item, index) => {
            const isCurrent = active === index
            const isImageFailed = failedImages[index]

            return (
              <div
                key={`${item.image}-${index}`}
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
                onClick={() => {
                  if (dragState.current.distance < 6) {
                    scrollToCard(index)
                    onSelect?.(index)
                  }
                }}
                className={cn(
                  'group relative block shrink-0 overflow-hidden rounded-3xl transition-all duration-500 ease-out',
                  'border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)]',
                  isCurrent ? 'scale-100 opacity-100 ring-1 ring-white/20' : 'scale-[0.96] opacity-80 hover:opacity-95',
                )}
                style={{
                  width: cardWidth,
                  aspectRatio: cardAspectRatio,
                  ...getGradientStyle(index),
                }}
              >
                {/* Next.js Image layer */}
                {!isImageFailed && (
                  <NextImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 44vw"
                    priority={index === 0}
                    onError={() => setFailedImages((prev) => ({ ...prev, [index]: true }))}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}

                {/* Atmospheric Lens Glare & Sheen */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 65%)',
                  }}
                  aria-hidden="true"
                />

                {/* Card Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-6 sm:p-8">
                  {item.category && (
                    <span className="text-[11px] font-medium tracking-widest uppercase text-white/70">
                      {item.category}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="mt-1 text-xs text-white/60 drop-shadow line-clamp-1">{item.caption}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Bottom Nav Pill (NO font-mono!) */}
      <footer className="relative z-20 flex shrink-0 items-center justify-center pb-2">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => scrollToCard(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Previous card"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="px-2 text-xs font-semibold tracking-wider text-white tabular-nums">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={() => scrollToCard(Math.min(items.length - 1, active + 1))}
            disabled={active === items.length - 1}
            aria-label="Next card"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </section>
  )
}
