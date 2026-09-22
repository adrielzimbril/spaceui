'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/registry/lib/utils'
import { attachGpuGate, deferUntilVisible } from '@/registry/lib/gpu-runtime'
import { logger } from '@/registry/utils/logger'
import { BloopState, type OrbBloopProps } from './types'
import { useOrbAudio } from '@/registry/components/orb/smooth/use-orb-audio'
import { BLOOP_WGSL } from './bloop.wgsl'

export function OrbBloop({
  audioMode = 'ambient',
  demoMode = false,
  audioElement,
  audioSrc,
  state = BloopState.idle,
  bloopColorMain = [0.1, 0.5, 1.0],
  bloopColorLow = [0.1, 0.2, 0.8],
  bloopColorMid = [0.2, 0.4, 0.9],
  bloopColorHigh = [0.5, 0.8, 1.0],
  size = 144,
  watercolorStrength = 0.5,
  watercolorAnimated = false,
  className = '',
  style,
}: OrbBloopProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioAnalyzerRef = useOrbAudio(audioMode, audioElement, audioSrc)
  const startTime = useRef(Date.now())
  const stateTrackingRef = useRef({ current: state, enteredAt: 0 })
  const audioAverageRef = useRef([0, 0, 0, 0])
  const cumulativeAudioRef = useRef([0, 0, 0, 0])
  const lastTimeRef = useRef(Date.now())
  const propsRef = useRef({
    state,
    audioMode,
    demoMode,
    bloopColorMain,
    bloopColorLow,
    bloopColorMid,
    bloopColorHigh,
    watercolorStrength,
    watercolorAnimated,
  })
  propsRef.current = {
    state,
    audioMode,
    demoMode,
    bloopColorMain,
    bloopColorLow,
    bloopColorMid,
    bloopColorHigh,
    watercolorStrength,
    watercolorAnimated,
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
      const currentCanvas = canvasRef.current
      if (cancelled || !currentCanvas) return
      const { init, effect, surface, frameLoop } = await import('vgpu')
      const gpu = await init()
      if (cancelled || !canvasRef.current) {
        gpu.dispose()
        return
      }

      const gate = attachGpuGate(currentCanvas)
      disposeGate = gate.dispose
      if (gate.state.lowPower) {
        currentCanvas.width = 160
        currentCanvas.height = 160
      }
      const canvasSurface = surface(gpu, currentCanvas, {
        format: 'bgra8unorm',
        alphaMode: 'premultiplied',
        ...(gate.state.lowPower ? { dpr: 1 } : {}),
      })
      const fx = effect(gpu, BLOOP_WGSL, { blend: 'premultiplied' })
      let lastDraw = 0
      const loop = frameLoop(gpu, (frame) => {
        if (gate.state.paused) return
        const now = Date.now()
        if (gate.frameMs && now - lastDraw < gate.frameMs) return
        lastDraw = now
        const time = (now - startTime.current) / 1000
        const p = propsRef.current
        const activeState = p.state
        if (stateTrackingRef.current.current !== activeState) {
          stateTrackingRef.current.current = activeState
          stateTrackingRef.current.enteredAt = time
        }
        const enteredAt = stateTrackingRef.current.enteredAt

        let avg = [0, 0, 0, 0]
        let micLevel = 0
        if (audioAnalyzerRef.current) {
          audioAnalyzerRef.current.update()
          const a = audioAnalyzerRef.current
          avg = [a.allAvg / 255, a.lowAvg / 255, a.midAvg / 255, a.highAvg / 255]
          micLevel = avg[0]
        } else if (p.demoMode) {
          const stateTime = time - enteredAt
          if (activeState === BloopState.speak) {
            // Speech prosody simulation: syllabic pulses, vowel formants, consonant bursts
            const wordRhythm = Math.sin(stateTime * 4.2) * 0.5 + 0.5
            const syllable = Math.sin(stateTime * 14.8) * 0.5 + 0.5
            const microJitter = Math.sin(stateTime * 28.0) * 0.5 + 0.5
            const burst = Math.pow(syllable * wordRhythm, 1.4)

            const low = Math.min(1.0, 0.28 + burst * 0.65 + Math.sin(stateTime * 7.0) * 0.12)
            const mid = Math.min(1.0, 0.22 + (Math.sin(stateTime * 11.5) * 0.5 + 0.5) * 0.62)
            const high = Math.min(1.0, 0.16 + microJitter * 0.42)
            micLevel = Math.min(1.0, low * 0.5 + mid * 0.35 + high * 0.15)
            avg = [micLevel, low, mid, high]
          } else if (activeState === BloopState.listen) {
            // Attentive listening wave: smooth undulating swells
            const wave = Math.sin(stateTime * 3.0) * 0.5 + 0.5
            const pulse = Math.sin(stateTime * 8.2) * 0.15 + 0.15
            micLevel = 0.2 + wave * 0.35 + pulse
            avg = [micLevel, micLevel * 0.65, micLevel * 0.85, micLevel * 0.45]
          } else if (activeState === BloopState.think) {
            // Hypnotic processing breathing pulse
            const breath = Math.sin(time * 3.6) * 0.5 + 0.5
            micLevel = 0.16 + breath * 0.26
            avg = [micLevel, micLevel * 0.45, micLevel * 0.85, micLevel * 0.35]
          } else {
            // Idle standby
            micLevel = Math.sin(time * 1.8) * 0.06 + 0.06
            avg = [micLevel, micLevel * 0.5, micLevel * 0.35, micLevel * 0.2]
          }
        } else if (p.audioMode === 'ambient') {
          micLevel = Math.sin(time * 2.0) * 0.1 + 0.1
          avg = [micLevel, micLevel * 0.6, micLevel * 0.4, micLevel]
        }
        const dt = Math.min(now - lastTimeRef.current, 100) / 1000
        lastTimeRef.current = now
        for (let i = 0; i < 4; i++) {
          audioAverageRef.current[i] += (avg[i] - audioAverageRef.current[i]) * 0.55
          cumulativeAudioRef.current[i] += audioAverageRef.current[i] * (60 * dt) * 0.25
        }

        fx.set({
          ubo: {
            time,
            micLevel,
            stateListen: activeState === BloopState.listen ? 1 : 0,
            listenTimestamp: activeState === BloopState.listen ? enteredAt : 0,
            stateThink: activeState === BloopState.think ? 1 : 0,
            thinkTimestamp: activeState === BloopState.think ? enteredAt : 0,
            stateSpeak: activeState === BloopState.speak ? 1 : 0,
            speakTimestamp: activeState === BloopState.speak ? enteredAt : 0,
            avgMag: audioAverageRef.current,
            cumulativeAudio: cumulativeAudioRef.current,
            viewport: [canvasRef.current?.width || size, canvasRef.current?.height || size],
            watercolorStrength: gate.state.lowPower ? 0 : p.watercolorStrength,
            watercolorAnimated: 0,
            bloopColorMain: [...p.bloopColorMain, 1],
            bloopColorLow: [...p.bloopColorLow, 1],
            bloopColorMid: [...p.bloopColorMid, 1],
            bloopColorHigh: [...p.bloopColorHigh, 1],
          },
        })
        frame.pass({ target: canvasSurface, clear: [0, 0, 0, 0] }, fx)
      })
      stop = () => loop.stop()
      disposeGpu = () => gpu.dispose()
    }

    disposeDefer = deferUntilVisible(canvas, () => {
      mount().catch((error) => logger.error('OrbBloop WebGPU init failed:', error))
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
        ...style,
      }}
    />
  )
}
