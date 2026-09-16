'use client'

import React, { useRef, useEffect } from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { getOptimizedImageUrl } from '@/registry/lib/next-image-url'
import type { OrbSmoothProps } from './types'
import { useOrbAudio } from './use-orb-audio'
import {
  CLEAR_WGSL,
  SPLAT_WGSL,
  ADVECTION_WGSL,
  DIVERGENCE_WGSL,
  CURL_WGSL,
  VORTICITY_WGSL,
  PRESSURE_WGSL,
  GRAD_SUB_WGSL,
  BLUR_WGSL,
} from './sim.wgsl'
import { DISPLAY_WGSL } from './display.wgsl'

export function OrbSmooth({
  textureUrl = 'https://avatars.spaceui.one/v1?name=orion&variant=shaula&size=2000&format=png',
  audioMode,
  audioElement,
  audioSrc,
  useMicrophone = false,
  circleSize = 1,
  alpha = 1,
  animated = true,
  sphereScale = 0.9,
  spherePower = 1.1,
  fbmScale = 3.25,
  fbmPower = 2.75,
  fbmAmplitude = 0.65,
  fbmSpeed = 4.5,
  noiseSpeed = 0.25,
  noiseAmplitude = 0.15,
  noiseScale = 0.65,
  exposure = 0.15,
  contrast = 0,
  saturation = 1,
  fadeInDuration = 0,
  ringColorOpacity = 0.25,
  fluidColor = [1, 1, 1],
  fluidColorOpacity = 0.1,
  grainOpacity = 0.67,
  grainAnimated = true,
  watercolorStrength = 0.5,
  timeScale = 1.4,
  overallSoundScale = 1,
  onTextureReady,
  size = 240,
  className = '',
  style,
}: OrbSmoothProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioAnalyzerRef = useOrbAudio(audioMode, audioElement, audioSrc, useMicrophone)
  const onTextureReadyRef = useRef(onTextureReady)
  onTextureReadyRef.current = onTextureReady

  const propsRef = useRef({
    textureUrl,
    animated,
    sphereScale,
    spherePower,
    fbmScale,
    fbmPower,
    fbmAmplitude,
    fbmSpeed,
    noiseSpeed,
    noiseAmplitude,
    noiseScale,
    exposure,
    contrast,
    saturation,
    fadeInDuration,
    ringColorOpacity,
    fluidColor,
    fluidColorOpacity,
    grainOpacity,
    grainAnimated,
    watercolorStrength,
    timeScale,
    overallSoundScale,
    circleSize,
    alpha,
  })
  propsRef.current = {
    textureUrl,
    animated,
    sphereScale,
    spherePower,
    fbmScale,
    fbmPower,
    fbmAmplitude,
    fbmSpeed,
    noiseSpeed,
    noiseAmplitude,
    noiseScale,
    exposure,
    contrast,
    saturation,
    fadeInDuration,
    ringColorOpacity,
    fluidColor,
    fluidColorOpacity,
    grainOpacity,
    grainAnimated,
    watercolorStrength,
    timeScale,
    overallSoundScale,
    circleSize,
    alpha,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let stop: (() => void) | undefined
    let disposeGpu: (() => void) | undefined
    let disposeGate: (() => void) | undefined
    let disposeDefer: (() => void) | undefined

    async function mount() {
      const { init, effect, surface, frame, pingPong, sampler, target } = await import('vgpu')
      if (cancelled || !canvasRef.current) return
      const gpu = await init()
      if (cancelled) {
        gpu.dispose()
        return
      }

      let raf = 0
      let render = () => {}
      const gate = attachGpuGate(canvas, (paused) => {
        if (paused) cancelAnimationFrame(raf)
        else if (!cancelled) raf = requestAnimationFrame(render)
      })
      disposeGate = gate.dispose
      const low = gate.state.lowPower
      const lowPower = low
      if (low) {
        canvas.width = 160
        canvas.height = 160
      }
      const simRes = low ? 32 : 128
      const dyeRes = low ? 64 : 256
      const floatFmt = 'rgba16float' as const
      const lin = sampler(gpu, { minFilter: 'linear', magFilter: 'linear' })
      const near = sampler(gpu, { minFilter: 'nearest', magFilter: 'nearest' })
      const velocity = pingPong(gpu, simRes, simRes, { format: floatFmt, clearColor: [0, 0, 0, 1] })
      const density = pingPong(gpu, dyeRes, dyeRes, { format: floatFmt, clearColor: [0, 0, 0, 1] })
      const pressure = pingPong(gpu, simRes, simRes, { format: floatFmt, clearColor: [0, 0, 0, 1] })
      const divergence = target(gpu, { size: [simRes, simRes], format: floatFmt, clearColor: [0, 0, 0, 1] })
      const curl = target(gpu, { size: [simRes, simRes], format: floatFmt, clearColor: [0, 0, 0, 1] })
      const canvasSurface = surface(gpu, canvasRef.current, { format: 'bgra8unorm', alphaMode: 'premultiplied' })

      const clearFx = effect(gpu, CLEAR_WGSL)
      const splatFx = effect(gpu, SPLAT_WGSL)
      const advectFx = effect(gpu, ADVECTION_WGSL)
      const divFx = effect(gpu, DIVERGENCE_WGSL)
      const curlFx = effect(gpu, CURL_WGSL)
      const vortFx = effect(gpu, VORTICITY_WGSL)
      const pressFx = effect(gpu, PRESSURE_WGSL)
      const gradFx = effect(gpu, GRAD_SUB_WGSL)
      const blurFx = effect(gpu, BLUR_WGSL)
      const displayFx = effect(gpu, DISPLAY_WGSL, { blend: 'premultiplied' })

      let bgTex = gpu.device.createTexture({
        size: [1, 1],
        format: 'rgba8unorm',
        usage: ['texture_binding', 'copy_dst', 'render_attachment'],
      })
      gpu.gpu.queue.writeTexture(
        { texture: bgTex.gpu },
        new Uint8Array([255, 255, 255, 255]),
        { bytesPerRow: 4 },
        [1, 1],
      )
      let texSize: [number, number] = [1, 1]
      let currentUrl = propsRef.current.textureUrl

      const loadImage = (url: string) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const next = gpu.device.createTexture({
            size: [img.width, img.height],
            format: 'rgba8unorm',
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],
          })
          gpu.gpu.queue.copyExternalImageToTexture({ source: img }, { texture: next.gpu }, [img.width, img.height])
          bgTex = next
          texSize = [img.width, img.height]
          onTextureReadyRef.current?.(url)
        }
        img.src = url ? getOptimizedImageUrl(url, { width: 512 }) : url
      }
      loadImage(currentUrl || '')

      const blit = (
        fx: ReturnType<typeof effect>,
        dest: { color?: unknown } & object,
        extra?: Record<string, unknown>,
      ) => {
        if (extra) fx.set(extra)
        frame(gpu, (f) => f.pass({ target: dest as never, clear: false }, fx))
      }

      const audioAverage = [0, 0, 0, 0]
      const audioAverageInput = [0, 0, 0, 0]
      const cumulativeAudio = [0, 0, 0, 0]
      let time = 0
      let last = performance.now()
      const texelSize = 1 / simRes
      const dyeTexel = 1 / dyeRes

      let lastDraw = 0
      render = () => {
        if (cancelled || gate.state.paused) return
        const cur = propsRef.current
        const now = performance.now()
        if (gate.frameMs && now - lastDraw < gate.frameMs) {
          if (cur.animated) raf = requestAnimationFrame(render)
          return
        }
        lastDraw = now
        if (cur.textureUrl !== currentUrl) {
          currentUrl = cur.textureUrl
          loadImage(currentUrl || '')
        }
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now
        time += dt * cur.timeScale

        const analyzer = audioAnalyzerRef.current
        let splats: Array<{ x: number; y: number; dx: number; dy: number }> = []
        if (analyzer) {
          analyzer.update()
          const stepAudio = [
            analyzer.lowAvg / 255,
            analyzer.midAvg / 255,
            analyzer.highAvg / 255,
            analyzer.allAvg / 255,
          ]
          for (let i = 0; i < 4; i++) {
            const val = stepAudio[i] * cur.overallSoundScale
            cumulativeAudio[i] += val * (60 * dt * cur.timeScale) * 0.25
            audioAverage[i] += (val - audioAverage[i]) * 0.55
            audioAverageInput[i] += (val - audioAverageInput[i]) * 0.45
          }
          const splatX = -0.2 * Math.sin(0.5 * cumulativeAudio[1]) + 0.5
          const splatY = 0.15 * Math.cos(0.38 * cumulativeAudio[0]) + 0.5
          if (Math.abs(audioAverage[3]) > 1e-4) {
            splats.push({
              x: 0.5 + 0.1 * splatX,
              y: 0.5 + 0.1 * splatY,
              dx: (splatX - 0.5) * 12,
              dy: (splatY - 0.5) * 12,
            })
          }
        }

        const cum = [cumulativeAudio[0], cumulativeAudio[1], cumulativeAudio[2], cumulativeAudio[3]] as const
        const avg = [audioAverage[0], audioAverage[1], audioAverage[2], audioAverage[3]] as const

        if (!lowPower) {
          for (const s of splats) {
            const splatParams = {
              point: [s.x, s.y],
              color: [s.dx, s.dy, 1, 1],
              cumulativeAudio: cum,
              audioAverage: avg,
              radius: 1.5,
              time,
              aspectRatio: 1,
            }
            splatFx.set({ uTarget: velocity.read.color, samp: lin, params: splatParams })
            blit(splatFx, velocity.write)
            velocity.swap()
            splatFx.set({ uTarget: density.read.color, samp: lin, params: splatParams })
            blit(splatFx, density.write)
            density.swap()
          }

          curlFx.set({ uVelocity: velocity.read.color, samp: near, params: { texelSize: [texelSize, texelSize] } })
          blit(curlFx, curl)

          vortFx.set({
            uVelocity: velocity.read.color,
            uCurl: curl.color,
            samp: lin,
            params: { texelSize: [texelSize, texelSize], curl: 0, dt: 0.016 },
          })
          blit(vortFx, velocity.write)
          velocity.swap()

          divFx.set({ uVelocity: velocity.read.color, samp: near, params: { texelSize: [texelSize, texelSize] } })
          blit(divFx, divergence)

          clearFx.set({ uTexture: pressure.read.color, samp: near, params: { value: 0.97 } })
          blit(clearFx, pressure.write)
          pressure.swap()

          for (let i = 0; i < 3; i++) {
            pressFx.set({
              uPressure: pressure.read.color,
              uDivergence: divergence.color,
              samp: near,
              params: { texelSize: [texelSize, texelSize] },
            })
            blit(pressFx, pressure.write)
            pressure.swap()
          }

          gradFx.set({
            uPressure: pressure.read.color,
            uVelocity: velocity.read.color,
            samp: lin,
            params: { texelSize: [texelSize, texelSize] },
          })
          blit(gradFx, velocity.write)
          velocity.swap()

          advectFx.set({
            uVelocity: velocity.read.color,
            uSource: velocity.read.color,
            samp: lin,
            params: {
              texelSize: [texelSize, texelSize],
              dyeTexelSize: [texelSize, texelSize],
              dt: 0.016,
              dissipation: 0.98,
            },
          })
          blit(advectFx, velocity.write)
          velocity.swap()

          advectFx.set({
            uVelocity: velocity.read.color,
            uSource: density.read.color,
            samp: lin,
            params: {
              texelSize: [texelSize, texelSize],
              dyeTexelSize: [dyeTexel, dyeTexel],
              dt: 0.016,
              dissipation: 0.98,
            },
          })
          blit(advectFx, density.write)
          density.swap()

          for (const dir of [
            [1.2, 0],
            [0, 1.2],
          ]) {
            blurFx.set({
              uTexture: density.read.color,
              samp: lin,
              params: { simRes: [simRes, simRes], direction: dir },
            })
            blit(blurFx, density.write)
            density.swap()
          }
        }

        const w = canvasRef.current?.width || size
        const h = canvasRef.current?.height || size
        displayFx.set({
          uTexture: bgTex,
          uFluidSimTexture: density.read.color,
          samp: lin,
          params: {
            uAudioAverage: avg,
            uAudioAverageInput: audioAverageInput,
            uCumulativeAudio: cum,
            uFluidColor: [cur.fluidColor[0], cur.fluidColor[1], cur.fluidColor[2], 1],
            uResolution: [w, h],
            uTextureResolution: texSize,
            uTime: time,
            uCircleSize: cur.circleSize,
            uAlpha: cur.alpha,
            uExposure: cur.exposure,
            uContrast: cur.contrast,
            uSaturation: cur.saturation,
            uNoiseOpacity: lowPower ? 0 : cur.grainOpacity,
            uAnimatedNoise: lowPower ? 0 : cur.grainAnimated ? 1 : 0,
            uNoiseSpeed: cur.noiseSpeed,
            uNoiseAmplitude: cur.noiseAmplitude,
            uNoiseScale: cur.noiseScale,
            uSphereScale: cur.sphereScale,
            uSpherePower: cur.spherePower,
            uFluidColorOpacity: cur.fluidColorOpacity,
            uRingColorOpacity: cur.ringColorOpacity,
            uFbmScale: cur.fbmScale,
            uFbmPower: cur.fbmPower,
            uFbmAmplitude: cur.fbmAmplitude,
            uFbmSpeed: cur.fbmSpeed,
            uFadeInDuration: cur.fadeInDuration,
            uDpr: 1,
            uWatercolorStrength: lowPower ? 0 : cur.watercolorStrength,
          },
        })
        frame(gpu, (f) => f.pass({ target: canvasSurface, clear: [0, 0, 0, 0] }, displayFx))

        if (cur.animated) raf = requestAnimationFrame(render)
      }

      raf = requestAnimationFrame(render)
      stop = () => cancelAnimationFrame(raf)
      disposeGpu = () => gpu.dispose()
    }

    disposeDefer = deferUntilVisible(canvas, () => {
      mount().catch((error) => console.error('OrbSmooth WebGPU init failed:', error))
    })
    return () => {
      cancelled = true
      disposeDefer?.()
      stop?.()
      disposeGate?.()
      disposeGpu?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      className={cn('aspect-square', className)}
      style={{
        width: size !== undefined ? `${size}px` : '100%',
        height: size !== undefined ? `${size}px` : '100%',
        display: 'block',
        ...style,
      }}
    />
  )
}
