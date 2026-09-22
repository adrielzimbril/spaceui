'use client'

import * as React from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { logger } from '@/registry/utils/logger'
import { CLOUDS_WGSL } from './clouds.wgsl'

export type CloudProps = {
  bg?: string
  sky?: string
  cloudColor?: string
  shadow?: string
  sun?: string
  glare?: string
  sunlight?: string
  speed?: number
  className?: string
}

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255, 1]
}

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 600
  )
}

export function Cloud({
  bg = '#ffffff',
  sky = '#68b8d7',
  cloudColor = '#adc1de',
  shadow = '#183550',
  sun = '#ff9919',
  glare = '#ff6633',
  sunlight = '#ff9933',
  speed = 1,
  className,
}: CloudProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const propsRef = React.useRef({ bg, sky, cloudColor, shadow, sun, glare, sunlight, speed })
  propsRef.current = { bg, sky, cloudColor, shadow, sun, glare, sunlight, speed }

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
      const gpu = await init()
      if (cancelled) {
        gpu.dispose()
        return
      }

      const gate = attachGpuGate(canvas)
      disposeGate = gate.dispose
      const scale = gate.state.lowPower ? 24 : 3
      const dpr = gate.state.lowPower ? 0.25 : Math.max(window.devicePixelRatio / scale, 0.35)
      const canvasSurface = surface(gpu, canvasRef.current, {
        dpr,
        alphaMode: 'opaque',
        format: 'bgra8unorm',
      })
      const p = propsRef.current
      const clouds = effect(gpu, CLOUDS_WGSL, {
        set: {
          params: {
            iResolution: [1, 1],
            iMouse: [0.5, 0.5],
            iTime: 0,
            speed: p.speed,
            iDpr: window.devicePixelRatio || 1,
            skyColor: hexToRgba(p.sky),
            cloudColor: hexToRgba(p.cloudColor),
            cloudShadowColor: hexToRgba(p.shadow),
            sunColor: hexToRgba(p.sun),
            sunlightColor: hexToRgba(p.sunlight),
            sunGlareColor: hexToRgba(p.glare),
            backgroundColor: hexToRgba(p.bg),
          },
        },
      })

      let mouseX = 0.5
      let mouseY = 0.5
      let easeX = 0.5
      let easeY = 0.5
      const onMove = (event: PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        mouseX = (event.clientX - rect.left) / Math.max(rect.width, 1)
        mouseY = (event.clientY - rect.top) / Math.max(rect.height, 1)
      }
      canvasRef.current.addEventListener('pointermove', onMove)

      let lastW = 0
      let lastH = 0
      let lastKey = ''
      let lastDraw = 0
      const loop = frameLoop(gpu, (frame) => {
        if (gate.state.paused) return
        const now = performance.now()
        if (gate.frameMs && now - lastDraw < gate.frameMs) return
        lastDraw = now
        const width = Math.max(canvas.clientWidth, 200)
        const height = Math.max(canvas.clientHeight, 200)
        const cur = propsRef.current
        easeX += (mouseX - easeX) * 0.05
        easeY += (mouseY - easeY) * 0.05
        const next: Record<string, unknown> = {
          iTime: clock(gpu).time * cur.speed,
          iMouse: [(easeX * width) / scale, (easeY * height) / scale],
        }
        const key = `${cur.bg}${cur.sky}${cur.cloudColor}${cur.shadow}${cur.sun}${cur.glare}${cur.sunlight}${cur.speed}`
        if (key !== lastKey) {
          lastKey = key
          next.speed = cur.speed
          next.skyColor = hexToRgba(cur.sky)
          next.cloudColor = hexToRgba(cur.cloudColor)
          next.cloudShadowColor = hexToRgba(cur.shadow)
          next.sunColor = hexToRgba(cur.sun)
          next.sunlightColor = hexToRgba(cur.sunlight)
          next.sunGlareColor = hexToRgba(cur.glare)
          next.backgroundColor = hexToRgba(cur.bg)
        }
        if (width !== lastW || height !== lastH) {
          lastW = width
          lastH = height
          next.iResolution = [width / scale, height / scale]
        }
        clouds.set({ params: next })
        frame.pass(canvasSurface, clouds)
      })

      stopLoop = () => loop.stop()
      disposeGpu = () => {
        canvasRef.current?.removeEventListener('pointermove', onMove)
        gpu.dispose()
      }
    }

    disposeDefer = deferUntilVisible(canvas, () => {
      mount().catch((error) => {
        logger.error('Cloud WebGPU init failed:', error)
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

  return <canvas ref={canvasRef} className={cn('size-full', className)} />
}
