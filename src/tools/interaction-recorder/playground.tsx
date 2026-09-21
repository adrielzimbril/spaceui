'use client'

import * as React from 'react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { IconCrop, IconAdjustments } from '@tabler/icons-react'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { bloomSound, confirmSound, nudgeSound, tapSound } from '@/components/providers/sound-provider'
import { useFloatNav } from '@/components/providers/float-nav-provider'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { index as registryIndex } from '@/__registry__/index'
import { Tweakpane, type Binds } from '@/components/docs/preview/tweakpane'
import { InteractionCanvas } from './canvas'
import { InteractionControlPanel } from './control-panel'
import { computeSequenceTiming } from './timing'
import {
  BASE_CANVAS_SIZE,
  type AspectRatioValue,
  type InteractionGroup,
  type InteractionRecorderItem,
  type ScaleValue,
} from './types'

const FPS = 30
const DEFAULT_CYCLE_SECONDS = 10

function groupByCategory(items: InteractionRecorderItem[]): InteractionGroup[] {
  const groups: Record<string, InteractionRecorderItem[]> = {}
  for (const item of items) {
    const raw = item.categories?.[1] ?? 'general'
    const label = raw.charAt(0).toUpperCase() + raw.slice(1)
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, groupItems]) => ({ value, items: groupItems }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    for (const key in obj) {
      const value = obj[key]
      result[key] = value && typeof value === 'object' && 'value' in value ? value.value : value
    }
    return result
  }
  return {}
}

function timestamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  // Must be attached to the document for the download attribute to be honored
  // reliably — a detached anchor's click() can just navigate instead.
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

export function InteractionRecorderPlayground({ items }: { items: InteractionRecorderItem[] }) {
  // /tools/* is excluded from the global FloatNav by default — this tool opts back in.
  useFloatNav()
  const groups = useMemo(() => groupByCategory(items), [items])
  const [selected, setSelected] = useState<InteractionRecorderItem | null>(items[0] ?? null)
  const [scale, setScale] = useState<ScaleValue>(1)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>(1)
  const [elementZoom, setElementZoom] = useState(1.5)
  const [loops, setLoops] = useState(1)
  const [withSound, setWithSound] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [showTweakpane, setShowTweakpane] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const { showRight, setShowRight } = useResourceSidebars()
  const stageRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef(false)
  const sequenceCompleteResolverRef = useRef<(() => void) | null>(null)

  const entry = selected ? registryIndex[selected.name] : undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = entry?.component as React.ComponentType<any> | undefined

  const initialBinds = useMemo<Binds | null>(() => {
    if (!Component && !entry) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dp = (Component as any)?.demoProps ?? (entry as any)?.meta?.demoProps ?? (entry as any)?.demoProps
    if (dp && typeof dp === 'object' && Object.keys(dp).length > 0) {
      return JSON.parse(JSON.stringify(dp)) as Binds
    }
    return null
  }, [Component, entry])

  const [binds, setBinds] = useState<Binds | null>(null)
  const [interactionProps, setInteractionProps] = useState<Record<string, any>>({})

  useEffect(() => {
    if (initialBinds) {
      setBinds(initialBinds)
      setInteractionProps(unwrapValues(initialBinds))
    } else {
      setBinds(null)
      setInteractionProps({})
    }
  }, [initialBinds])

  const handleBindsChange = (newBinds: Binds) => {
    setBinds(newBinds)
    const unwrapped = unwrapValues(newBinds)
    setInteractionProps(unwrapped)
  }

  const hasBinds = Boolean(binds && Object.keys(binds).length > 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cycleDurationMs = (Component as any)?.cycleDurationMs as number | null | undefined
  const baseCycleSeconds = typeof cycleDurationMs === 'number' ? cycleDurationMs / 1000 : null
  const currentSpeed =
    typeof interactionProps.speed === 'number' && interactionProps.speed > 0 ? interactionProps.speed : 1
  const cycleSeconds = baseCycleSeconds ? baseCycleSeconds / currentSpeed : null

  const sequenceTiming = useMemo(() => {
    return computeSequenceTiming(selected?.name, interactionProps, loops, cycleSeconds)
  }, [selected?.name, interactionProps, loops, cycleSeconds])

  const handleStop = () => {
    cancelRef.current = true
  }

  const handleReset = () => {
    bloomSound()
    setScale(1)
    setAspectRatio(1)
    setElementZoom(1.5)
    setLoops(1)
    setWithSound(false)
    setShowGuide(true)
    if (initialBinds) {
      setBinds(JSON.parse(JSON.stringify(initialBinds)))
      setInteractionProps(unwrapValues(initialBinds))
    }
    // Remounts the interaction component so its internal animation state
    // (timers, step index, etc.) restarts from scratch instead of just
    // continuing wherever it was.
    setResetKey((k) => k + 1)
  }

  const handleRecord = async () => {
    const stage = stageRef.current
    if (!stage || !selected) return

    bloomSound()
    setBusy('Preparing recorder…')
    setProgress(0)
    cancelRef.current = false

    const outputWidth = Math.round(BASE_CANVAS_SIZE * aspectRatio * scale)
    const outputHeight = Math.round(BASE_CANVAS_SIZE * scale)
    const durationMs = Math.max(1000, Math.round(sequenceTiming.totalDurationSeconds * 1000))
    const maxWatchdogMs = durationMs + 2500

    let sequenceFinished = false
    sequenceCompleteResolverRef.current = () => {
      sequenceFinished = true
    }

    let displayStream: MediaStream | null = null
    let recordCanvas: HTMLCanvasElement | null = null
    let sourceVideo: HTMLVideoElement | null = null
    let rafId: number | null = null

    try {
      setBusy(withSound ? 'Pick this tab and enable "Share tab audio"…' : 'Pick this tab to share…')
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: FPS },
        audio: withSound,
        // Chrome-only hint that pre-selects "this tab" in the picker. Ignored elsewhere —
        // the picker still opens, the user still has to confirm sharing.
        preferCurrentTab: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      const videoTrack = displayStream.getVideoTracks()[0]
      if (!videoTrack) throw new Error('No video was shared.')
      if (withSound && displayStream.getAudioTracks().length === 0) {
        throw new Error('No audio track was shared — retry and enable "Share tab audio".')
      }

      // Real-time tab capture instead of re-rasterizing the DOM every frame: the
      // previous approach (html-to-image per frame) took 1.5-3s per snapshot on
      // anything non-trivial, so a 12s recording only ever contained 5-9 real
      // frames. This draws the live captured video onto the output canvas every
      // animation frame instead, which is effectively free.
      sourceVideo = document.createElement('video')
      sourceVideo.srcObject = displayStream
      sourceVideo.muted = true
      sourceVideo.playsInline = true
      await sourceVideo.play()
      await Promise.race([
        new Promise<void>((resolve) => {
          if (sourceVideo!.readyState >= 2) resolve()
          else sourceVideo!.onloadeddata = () => resolve()
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('The shared tab never started streaming video.')), 5000),
        ),
      ])

      // Output canvas is BASE_CANVAS_SIZE × aspectRatio × scale — the element is cropped
      // from the captured tab at its own on-screen size × scale (sharp, never stretched)
      // and centered into it.
      //
      // The canvas must be attached to the document for captureStream() to reliably
      // emit frames — an off-document canvas is not guaranteed to be composited.
      // Kept out of the layout via fixed positioning + zero opacity rather than
      // display:none, which would stop it from rendering at all.
      const canvas = document.createElement('canvas')
      recordCanvas = canvas
      canvas.width = outputWidth
      canvas.height = outputHeight
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '1px'
      canvas.style.height = '1px'
      canvas.style.opacity = '0'
      canvas.style.pointerEvents = 'none'
      document.body.appendChild(canvas)
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) throw new Error('Canvas 2D context unavailable')
      const backgroundColor = getComputedStyle(document.body).backgroundColor || '#000000'

      const videoOutStream = canvas.captureStream(FPS)
      const tracks: MediaStreamTrack[] = [...videoOutStream.getVideoTracks()]
      const audioTrack = displayStream.getAudioTracks()[0]
      if (audioTrack) tracks.push(audioTrack)
      const combined = new MediaStream(tracks)

      const mimeCandidates = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm',
      ]
      const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m))
      if (!mime) throw new Error('Video recording is not supported in this browser')
      const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm'

      const chunks: BlobPart[] = []
      const recorder = new MediaRecorder(combined, {
        mimeType: mime,
        videoBitsPerSecond: Math.min(48_000_000, Math.round(outputWidth * outputHeight * FPS * 0.12)),
      })
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
      })

      // Restart animation cleanly from beginning right as recording starts
      setResetKey((k) => k + 1)
      setBusy('Recording…')
      recorder.start()

      const startedAt = performance.now()
      await new Promise<void>((resolve) => {
        const drawFrame = () => {
          const elapsed = performance.now() - startedAt
          if (cancelRef.current || sequenceFinished || elapsed >= maxWatchdogMs) {
            resolve()
            return
          }

          // Map the stage element's on-screen CSS-pixel rect onto the captured
          // video's native pixel space (which is generally viewport size × DPR).
          const rect = stage.getBoundingClientRect()
          const videoScaleX = sourceVideo!.videoWidth / window.innerWidth
          const videoScaleY = sourceVideo!.videoHeight / window.innerHeight
          const sx = rect.left * videoScaleX
          const sy = rect.top * videoScaleY
          const sw = rect.width * videoScaleX
          const sh = rect.height * videoScaleY

          const elementWidth = Math.round(rect.width * scale)
          const elementHeight = Math.round(rect.height * scale)

          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, outputWidth, outputHeight)
          if (sw > 0 && sh > 0) {
            ctx.drawImage(
              sourceVideo!,
              sx,
              sy,
              sw,
              sh,
              Math.round((outputWidth - elementWidth) / 2),
              Math.round((outputHeight - elementHeight) / 2),
              elementWidth,
              elementHeight,
            )
          }

          setProgress(Math.min(99, Math.round((elapsed / durationMs) * 100)))
          rafId = requestAnimationFrame(drawFrame)
        }
        rafId = requestAnimationFrame(drawFrame)
      })

      setBusy('Finalizing…')
      recorder.stop()
      await stopped

      const blob = new Blob(chunks, { type: recorder.mimeType || mime })
      saveBlob(blob, `record-${selected.shortName}-${timestamp()}.${ext}`)
      setProgress(100)
      confirmSound()
    } catch (err) {
      console.error(err)
      nudgeSound()
      // eslint-disable-next-line no-alert
      alert(`Recording failed: ${(err as Error)?.message || String(err)}`)
    } finally {
      sequenceCompleteResolverRef.current = null
      if (rafId !== null) cancelAnimationFrame(rafId)
      displayStream?.getTracks().forEach((t) => t.stop())
      sourceVideo?.remove()
      recordCanvas?.remove()
      setBusy(null)
      setProgress(0)
    }
  }

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: false,
    info: false,
    sidebar: true,
    reset: true,
    onReset: handleReset,
    viewToggle: false,
    onToggleSidebar: () => setShowRight(!showRight),
    sidebarVisible: showRight,
  }

  return (
    <ResourceStudio
      showRight={showRight}
      rightWidth="20rem"
      onToggleRight={setShowRight}
      canvas={
        <>
          <InteractionCanvas
            item={selected}
            Component={Component}
            demoProps={interactionProps}
            stageRef={stageRef}
            showGuide={showGuide}
            scale={scale}
            aspectRatio={aspectRatio}
            elementZoom={elementZoom}
            isRecording={Boolean(busy)}
            resetKey={resetKey}
            targetLoops={busy ? loops : undefined}
            onSequenceComplete={() => sequenceCompleteResolverRef.current?.()}
          />
          {hasBinds && binds && (
            <Tweakpane
              key={`${selected?.name ?? ''}-${resetKey}`}
              binds={binds}
              onBindsChange={handleBindsChange}
              show={showTweakpane && !busy}
              onClose={() => setShowTweakpane(false)}
              portal={false}
            />
          )}
        </>
      }
      float={
        <ResourceToolbar
          config={toolbarConfig}
          left={<ResourceNav />}
          right={
            <>
              {hasBinds && (
                <ToolbarButton
                  label={showTweakpane ? 'Hide interaction controls' : 'Configure interaction'}
                  pressed={showTweakpane}
                  onClick={() => {
                    tapSound()
                    setShowTweakpane((v) => !v)
                  }}
                >
                  <IconAdjustments className="size-4" />
                </ToolbarButton>
              )}
              <ToolbarButton
                label={showGuide ? 'Hide recording bounds' : 'Show recording bounds'}
                pressed={showGuide}
                onClick={() => {
                  tapSound()
                  setShowGuide((v) => !v)
                }}
              >
                <IconCrop className="size-4" />
              </ToolbarButton>
            </>
          }
        />
      }
      right={
        <InteractionControlPanel
          groups={groups}
          selected={selected}
          onSelect={setSelected}
          scale={scale}
          onScaleChange={setScale}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          elementZoom={elementZoom}
          onElementZoomChange={setElementZoom}
          loops={loops}
          onLoopsChange={setLoops}
          cycleSeconds={cycleSeconds}
          withSound={withSound}
          onWithSoundChange={setWithSound}
          busy={busy}
          progress={progress}
          onRecord={handleRecord}
          onStop={handleStop}
          hasBinds={hasBinds}
          showTweakpane={showTweakpane}
          onToggleTweakpane={() => setShowTweakpane((v) => !v)}
          timing={sequenceTiming}
        />
      }
    />
  )
}
