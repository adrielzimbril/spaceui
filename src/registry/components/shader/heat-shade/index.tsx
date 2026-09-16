'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { HEAT_SHADE_WGSL } from './heat-shade.wgsl'

export type HeatShadeProps = {
  base?: string
  hot?: string
  speed?: number
  className?: string
}

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255, 1]
}

export function HeatShade({ base = '#304dff', hot = '#8298ff', speed = 1, className }: HeatShadeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const propsRef = React.useRef({ base, hot, speed })
  propsRef.current = { base, hot, speed }

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

      const gate = attachGpuGate(canvas)
      disposeGate = gate.dispose
      const canvasSurface = surface(gpu, canvasRef.current, {
        dpr: gate.state.lowPower ? 0.5 : Math.min(window.devicePixelRatio || 1, 2),
        alphaMode: 'premultiplied',
        format: 'bgra8unorm',
      })
      const p = propsRef.current
      const shade = effect(gpu, HEAT_SHADE_WGSL, {
        set: {
          params: {
            resolution: [1, 1],
            time: 0,
            speed: p.speed,
            baseColor: hexToRgba(p.base),
            hotColor: hexToRgba(p.hot),
          },
        },
      })

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let lastW = 0
      let lastH = 0
      let lastKey = ''
      let lastDraw = 0

      const draw = (passFrame: { pass: (target: unknown, fx: unknown) => void }) => {
        if (gate.state.paused) return
        const now = performance.now()
        if (gate.frameMs && now - lastDraw < gate.frameMs) return
        lastDraw = now
        const width = Math.max(canvas.clientWidth, 1)
        const height = Math.max(canvas.clientHeight, 1)
        const cur = propsRef.current
        const next: Record<string, unknown> = {
          time: reduced ? 0 : clock(gpu).time,
          speed: cur.speed,
        }
        const key = `${cur.base}${cur.hot}${cur.speed}`
        if (key !== lastKey) {
          lastKey = key
          next.baseColor = hexToRgba(cur.base)
          next.hotColor = hexToRgba(cur.hot)
        }
        if (width !== lastW || height !== lastH) {
          lastW = width
          lastH = height
          next.resolution = [width, height]
        }
        shade.set({ params: next })
        passFrame.pass(canvasSurface, shade)
      }

      const loop = frameLoop(gpu, (gpuFrame) => {
        draw(gpuFrame)
      })
      stopLoop = () => loop.stop()

      disposeGpu = () => {
        gpu.dispose()
      }
    }

    disposeDefer = deferUntilVisible(canvas, () => {
      mount().catch((error) => {
        console.error('HeatShade WebGPU init failed:', error)
      })
    })

    return () => {
      cancelled = true
      disposeDefer?.()
      stopLoop?.()
      disposeGate?.()
      disposeGpu?.()
    }
  }, [])

  return <canvas ref={canvasRef} aria-label="Animated heat shade" className={cn('block size-full', className)} />
}
