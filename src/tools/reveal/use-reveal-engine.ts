'use client'

import * as React from 'react'
import { RevealEngine } from './engine'
import { DEFAULT_CONFIG, type RevealConfig, type RevealImages } from './state'

export interface UseRevealEngine {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  config: RevealConfig
  setConfig: (patch: Partial<RevealConfig>) => void
  loadImages: (imgs: RevealImages) => Promise<void>
  hasImages: boolean
  isRecording: boolean
  recordSecondsLeft: number | null
  startRecording: (duration: number) => Promise<void>
  cancelRecording: () => void
}

export function useRevealEngine(): UseRevealEngine {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const engineRef = React.useRef<RevealEngine | null>(null)
  const [config, setConfigState] = React.useState<RevealConfig>({ ...DEFAULT_CONFIG })
  const [hasImages, setHasImages] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordSecondsLeft, setRecordSecondsLeft] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return
    const eng = new RevealEngine(canvasRef.current)
    eng.setConfig(config)
    engineRef.current = eng
    return () => {
      eng.dispose()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setConfig = React.useCallback((patch: Partial<RevealConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...patch }
      engineRef.current?.setConfig(patch)
      return next
    })
  }, [])

  const loadImages = React.useCallback(async (imgs: RevealImages) => {
    if (!engineRef.current) return
    await engineRef.current.setImages(imgs)
    setHasImages(true)
  }, [])

  const startRecording = React.useCallback(async (duration: number) => {
    if (!engineRef.current) return
    setIsRecording(true)
    setRecordSecondsLeft(duration)
    try {
      const blob = await engineRef.current.startRecording(duration, (s) => setRecordSecondsLeft(s))
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `3d-reveal.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 500)
    } finally {
      setIsRecording(false)
      setRecordSecondsLeft(null)
    }
  }, [])

  const cancelRecording = React.useCallback(() => {
    engineRef.current?.cancelRecording()
    setIsRecording(false)
    setRecordSecondsLeft(null)
  }, [])

  return {
    canvasRef,
    config,
    setConfig,
    loadImages,
    hasImages,
    isRecording,
    recordSecondsLeft,
    startRecording,
    cancelRecording,
  }
}
