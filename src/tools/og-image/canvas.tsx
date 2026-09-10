'use client'

import React, { useEffect, useRef, useState } from 'react'
import { IconUpload } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'
import type { OgState } from './types'
import { OgCard } from './card'

export function OgCanvas({
  s,
  set,
  cardRef,
  editing,
  rev,
  clock,
  expanded = false,
  isDragging = false,
  rootProps,
  inputProps,
}: {
  s: OgState
  set: <K extends keyof OgState>(k: K, v: OgState[K]) => void
  cardRef: React.RefObject<HTMLDivElement | null>
  editing: boolean
  rev: number
  clock: number | null
  expanded?: boolean
  isDragging?: boolean
  rootProps?: React.HTMLAttributes<HTMLDivElement>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.56)

  // Auto-fit calculation based on viewport container with generous margins
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const calcFit = () => {
      const clientW = el.clientWidth || 800
      const clientH = el.clientHeight || 600
      const padX = 72
      const padY = 72
      const availW = Math.max(200, clientW - padX)
      const availH = Math.max(200, clientH - padY)
      const scaleW = availW / s.width
      const scaleH = availH / s.height
      setFit(Math.min(1, Math.min(scaleW, scaleH)))
    }
    const ro = new ResizeObserver(calcFit)
    ro.observe(el)
    window.addEventListener('resize', calcFit)
    calcFit()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calcFit)
    }
  }, [s.width, s.height])

  // Strip onClick from rootProps so clicking canvas does not trigger file picker, but drag & drop works
  const { onClick: _dropClick, ...dragProps } = rootProps || {}

  return (
    <div
      {...dragProps}
      className="relative flex size-full items-center justify-center overflow-hidden bg-background select-none"
    >
      {inputProps && <input {...inputProps} className="sr-only pointer-events-none" />}

      {/* Drag & Drop Feedback Overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-4 z-50 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/90 backdrop-blur-md ring-2 ring-primary ring-offset-2 ring-offset-background animate-in fade-in zoom-in-95 duration-200">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconUpload className="size-6 animate-bounce" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Drop image to use as card background</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WebP, AVIF</p>
          </div>
        </div>
      )}

      {/* Main Canvas Stage (Clean, flat card with no drop shadow) */}
      <div
        ref={wrapRef}
        className={cn(
          'relative flex size-full items-center justify-center overflow-hidden p-6 select-none',
          expanded ? 'py-8' : 'py-10',
        )}
      >
        <div
          style={{
            width: Math.round(s.width * fit),
            height: Math.round(s.height * fit),
            position: 'relative',
            flexShrink: 0,
          }}
          className="transition-all duration-150 ease-out"
        >
          <div
            style={{
              width: s.width,
              height: s.height,
              transform: `scale(${fit})`,
              transformOrigin: 'top left',
            }}
          >
            <OgCard s={s} set={set} cardRef={cardRef} editing={editing} rev={rev} clock={clock} />
          </div>
        </div>
      </div>
    </div>
  )
}
