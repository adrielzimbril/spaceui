'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { SILK_FLARE_WGSL } from './silk-flare.wgsl'

export type SilkFlareFrom = 'bottom' | 'top'

export type SilkFlareProps = {
  color1: string
  color1Opacity?: number
  color2: string
  color2Opacity?: number
  color3: string
  color3Opacity?: number
  heatBaseColor?: string
  heatBaseColorOpacity?: number
  hotColor?: string
  heatOpacity?: number
  from?: SilkFlareFrom
  speed?: number
  animate?: boolean
  grain?: boolean
  dpr?: number
  fps?: number
  rootMargin?: string
  className?: string
}

function hexToRgba(hex: string, alpha = 1): [number, number, number, number] {
  const h = hex.replace('#', '')
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : alpha
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255, a]
}

function shaderParams(cur: {
  color1: string
  color1Opacity?: number
  color2: string
  color2Opacity?: number
  color3: string
  color3Opacity?: number
  heatBaseColor?: string
  heatBaseColorOpacity?: number
  hotColor?: string
  heatOpacity?: number
  from?: SilkFlareFrom
  speed: number
  grain: boolean
}) {
  return {
    timeSpeed: cur.speed * 0.25,
    color1: hexToRgba(cur.color1, cur.color1Opacity ?? 0.3),
    color2: hexToRgba(cur.color2, cur.color2Opacity ?? 0.3),
    color3: hexToRgba(cur.color3, cur.color3Opacity ?? 0.3),
    heatBaseColor: hexToRgba(cur.heatBaseColor ?? '#2a7bba', cur.heatBaseColorOpacity ?? 0.5),
    hotColor: hexToRgba(cur.hotColor || cur.color3),
    warp: [1, 5, 2, 50],
    blend: [0, 0.05, 0, 500],
    grain: [cur.grain ? 0.1 : 0, 2, 0, 2],
    look: [1.5, 1, 1, 0.9],
    center: [0, 0],
    fromTop: cur.from === 'top' ? 1 : 0,
    heatOpacity: cur.heatOpacity ?? 0.5,
  }
}

export function SilkFlare({
  color1,
  color1Opacity = 0.3,
  color2,
  color2Opacity = 0.3,
  color3,
  color3Opacity = 0.3,
  heatBaseColor = '#2a7bba',
  heatBaseColorOpacity = 0.5,
  hotColor,
  heatOpacity = 0.5,
  from = 'bottom',
  speed = 0.8,
  animate = true,
  grain = true,
  dpr,
  fps,
  rootMargin = '80px',
  className,
}: SilkFlareProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const propsRef = React.useRef({
    color1,
    color1Opacity,
    color2,
    color2Opacity,
    color3,
    color3Opacity,
    heatBaseColor,
    heatBaseColorOpacity,
    hotColor,
    heatOpacity,
    from,
    speed,
    animate,
    grain,
  })
  propsRef.current = {
    color1,
    color1Opacity,
    color2,
    color2Opacity,
    color3,
    color3Opacity,
    heatBaseColor,
    heatBaseColorOpacity,
    hotColor,
    heatOpacity,
    from,
    speed,
    animate,
    grain,
  }

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
      const pixelRatio = dpr ?? Math.min(window.devicePixelRatio || 1, 2)
      const frameMs = fps ? 1000 / fps : gate.frameMs
      const canvasSurface = surface(gpu, canvasRef.current, {
        dpr: pixelRatio,
        alphaMode: 'premultiplied',
        format: 'bgra8unorm',
      })
      const p = propsRef.current
      const shade = effect(gpu, SILK_FLARE_WGSL, {
        set: {
          params: {
            resolution: [1, 1],
            time: 0,
            ...shaderParams(p),
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
        const moving = cur.animate && !reduced
        const next: Record<string, unknown> = {
          time: moving ? clock(gpu).time : 0,
        }
        const key = `${cur.color1}${cur.color1Opacity}${cur.color2}${cur.color2Opacity}${cur.color3}${cur.color3Opacity}${cur.heatBaseColor}${cur.heatBaseColorOpacity}${cur.hotColor}${cur.heatOpacity}${cur.from}${cur.speed}${cur.animate}${cur.grain}`
        if (key !== lastKey) {
          lastKey = key
          Object.assign(next, shaderParams(cur))
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
      disposeGpu = () => gpu.dispose()
    }

    disposeDefer = deferUntilVisible(
      canvas,
      () => {
        mount().catch((error) => {
          console.error('SilkFlare WebGPU init failed:', error)
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
  }, [dpr, fps, rootMargin])

  return <canvas ref={canvasRef} aria-hidden className={cn('block size-full', className)} />
}
