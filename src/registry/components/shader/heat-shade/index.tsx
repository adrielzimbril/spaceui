'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { logger } from '@/registry/utils/logger'
import { HEAT_SHADE_WGSL } from './heat-shade.wgsl'
import { HEAT_LICKS_WGSL } from './heat-licks.wgsl'

export type HeatShadeVariant = 'field' | 'licks'

export type HeatShadeFrom = 'top' | 'bottom'

export type HeatShadeProps = {
  base?: string
  hot?: string
  speed?: number
  variant?: HeatShadeVariant
  from?: HeatShadeFrom
  dpr?: number
  fps?: number
  rootMargin?: string
  className?: string
}

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255, 1]
}

export function HeatShade({
  base = '#2a7bba',
  hot = '#43c8ff',
  speed = 1,
  variant = 'licks',
  from = 'bottom',
  dpr,
  fps,
  rootMargin = '80px',
  className,
}: HeatShadeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const propsRef = React.useRef({ base, hot, speed, from })
  propsRef.current = { base, hot, speed, from }

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let stopLoop: (() => void) | undefined
    let disposeGpu: (() => void) | undefined
    let disposeGate: (() => void) | undefined
    let disposeDefer: (() => void) | undefined

    async function mount() {
      const { init, effect, surface, clock, frameLoop } = await import('vgpu')
      if (cancelled || !canvasRef.current) return
      if (!('gpu' in navigator)) return
      const gpu = await init()
      if (cancelled) {
        gpu.dispose()
        return
      }

      let running: { stop: () => void } | undefined
      let draw = (_passFrame: { pass: (target: unknown, fx: unknown) => void }) => {}

      const gate = attachGpuGate(canvas, (paused) => {
        if (paused) {
          running?.stop()
          running = undefined
        } else if (!running) {
          running = frameLoop(gpu, (frame) => draw(frame))
        }
      })
      disposeGate = gate.dispose
      const pixelRatio = dpr ?? (gate.state.lowPower ? 0.4 : Math.min(window.devicePixelRatio || 1, 1.25))
      const frameMs = fps ? 1000 / fps : gate.frameMs
      const canvasSurface = surface(gpu, canvasRef.current, {
        dpr: pixelRatio,
        alphaMode: 'premultiplied',
        format: 'bgra8unorm',
      })
      const p = propsRef.current
      const shade = effect(gpu, variant === 'licks' ? HEAT_LICKS_WGSL : HEAT_SHADE_WGSL, {
        set: {
          params: {
            resolution: [1, 1],
            time: 0,
            speed: p.speed,
            baseColor: hexToRgba(p.base),
            hotColor: hexToRgba(p.hot),
            fromTop: p.from === 'top' ? 1 : 0,
          },
        },
      })

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let lastW = 0
      let lastH = 0
      let lastKey = ''
      let lastDraw = 0

      draw = (passFrame) => {
        if (gate.state.paused) return
        const now = performance.now()
        if (frameMs && now - lastDraw < frameMs) return
        lastDraw = now
        const width = Math.max(canvas.clientWidth, 1)
        const height = Math.max(canvas.clientHeight, 1)
        const cur = propsRef.current
        const next: Record<string, unknown> = {
          time: reduced ? 0 : clock(gpu).time,
          speed: cur.speed,
        }
        const key = `${cur.base}${cur.hot}${cur.speed}${cur.from}`
        if (key !== lastKey) {
          lastKey = key
          next.baseColor = hexToRgba(cur.base)
          next.hotColor = hexToRgba(cur.hot)
          next.fromTop = cur.from === 'top' ? 1 : 0
        }
        if (width !== lastW || height !== lastH) {
          lastW = width
          lastH = height
          next.resolution = [width, height]
        }
        shade.set({ params: next })
        passFrame.pass(canvasSurface, shade)
      }

      if (!gate.state.paused && !running) {
        running = frameLoop(gpu, (frame) => draw(frame))
      }
      stopLoop = () => {
        running?.stop()
        running = undefined
      }

      disposeGpu = () => {
        gpu.dispose()
      }
    }

    disposeDefer = deferUntilVisible(
      canvas,
      () => {
        mount().catch((error) => {
          logger.error('HeatShade WebGPU init failed:', error)
        })
      },
      rootMargin,
    )

    return () => {
      cancelled = true
      disposeDefer?.()
      stopLoop?.()
      disposeGate?.()
      disposeGpu?.()
    }
  }, [variant, dpr, fps, rootMargin])

  return <canvas ref={canvasRef} aria-label="Animated heat shade" className={cn('block size-full', className)} />
}
