'use client'

import { useRef, useState } from 'react'
import { bloomSound, confirmSound, nudgeSound, tapSound } from '@/components/providers/sound-provider'
import { captureScreenshot, recordInteraction, saveBlob } from './recorder'
import type { SequenceTiming } from './timing'
import { BASE_CANVAS_SIZE, type AspectRatioValue, type InteractionRecorderItem, type ScaleValue } from './types'

export interface UseInteractionRecorderProps {
  stageRef: React.RefObject<HTMLDivElement | null>
  selected: InteractionRecorderItem | null
  scale: ScaleValue
  aspectRatio: AspectRatioValue
  pan: { x: number; y: number }
  elementZoom?: number
  withSound: boolean
  fps?: number
  sequenceTiming: SequenceTiming
  onResetAnimation?: () => void
}

export function useInteractionRecorder({
  stageRef,
  selected,
  scale,
  aspectRatio,
  pan,
  elementZoom = 1.6,
  withSound,
  fps = 30,
  sequenceTiming,
  onResetAnimation,
}: UseInteractionRecorderProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const cancelRef = useRef(false)
  const sequenceFinishedRef = useRef(false)
  const sequenceCompleteResolverRef = useRef<(() => void) | null>(null)

  const isRecording = Boolean(busy)

  const handleRecord = async () => {
    const stage = stageRef.current
    if (!stage || !selected) return

    bloomSound()
    setBusy('Preparing recorder…')
    setProgress(0)
    cancelRef.current = false
    sequenceFinishedRef.current = false

    sequenceCompleteResolverRef.current = () => {
      sequenceFinishedRef.current = true
    }

    // Force dimensions to be strictly even (divisible by 2) for H.264 compliance
    const outputWidth = Math.max(2, Math.round(BASE_CANVAS_SIZE * aspectRatio * scale) & ~1)
    const outputHeight = Math.max(2, Math.round(BASE_CANVAS_SIZE * scale) & ~1)
    const durationMs = Math.max(1000, Math.round(sequenceTiming.totalDurationSeconds * 1000))
    const maxWatchdogMs = durationMs + 2500

    // Restart animation cleanly from beginning right as recording starts
    onResetAnimation?.()

    try {
      const result = await recordInteraction({
        stage,
        shortName: selected.shortName,
        outputWidth,
        outputHeight,
        scale,
        pan,
        fps,
        durationMs,
        maxWatchdogMs,
        withSound,
        onProgress: setProgress,
        onStatusChange: setBusy,
        checkCancelled: () => cancelRef.current,
        checkSequenceFinished: () => sequenceFinishedRef.current,
      })

      saveBlob(result.blob, result.fileName)
      setProgress(100)
      confirmSound()
    } catch (err) {
      console.error(err)
      nudgeSound()
      // eslint-disable-next-line no-alert
      alert(`Recording failed: ${(err as Error)?.message || String(err)}`)
    } finally {
      sequenceCompleteResolverRef.current = null
      sequenceFinishedRef.current = false
      setBusy(null)
      setProgress(0)
    }
  }

  const handleStop = () => {
    cancelRef.current = true
  }

  const handleScreenshot = async () => {
    const stage = stageRef.current
    if (!stage || !selected || busy) return

    tapSound()
    setBusy('Capturing screenshot…')
    try {
      const outputWidth = Math.max(2, Math.round(BASE_CANVAS_SIZE * aspectRatio))
      const outputHeight = Math.max(2, Math.round(BASE_CANVAS_SIZE))

      const result = await captureScreenshot({
        stage,
        shortName: selected.shortName,
        outputWidth,
        outputHeight,
        scale,
        pan,
        elementZoom,
      })

      saveBlob(result.blob, result.fileName)
      confirmSound()
    } catch (err) {
      console.error(err)
      nudgeSound()
      // eslint-disable-next-line no-alert
      alert(`Screenshot failed: ${(err as Error)?.message || String(err)}`)
    } finally {
      setBusy(null)
    }
  }

  return {
    busy,
    progress,
    isRecording,
    handleRecord,
    handleStop,
    handleScreenshot,
    sequenceCompleteResolverRef,
  }
}
