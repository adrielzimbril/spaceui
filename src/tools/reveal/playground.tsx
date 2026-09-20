'use client'

import { bloomSound, openSound, pageSound, readySound } from '@/components/providers/sound-provider'
import { imagelib } from '@/lib/imagelib'
import { useFileUpload } from '@/registry/hooks/form/use-file-upload'
import { cn } from '@/registry/lib/utils'
import { Badge } from '@/registry/primitives/badge'
import { Button } from '@/registry/primitives/button'
import { Group } from '@/registry/primitives/group'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { ImagePreviewLoading } from '@/tools/imagesplit/loading'
import { IconMaximize, IconMinimize, IconMinus, IconPlus, IconRotateClockwise2, IconUpload } from '@tabler/icons-react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import NextImage from 'next/image'
import * as React from 'react'
import { RevealControlPanel } from './control-panel'
import { imageSize, pseudoDepth } from './depth'
import { useRevealEngine } from './use-reveal-engine'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4

const [
  twilightRing,
  twilightSilhouette,
  blossomArch,
  prismPortrait,
  floraPortrait,
  cobaltGaze,
  cosmicRing,
  cosmicWave,
  astronautVisor,
  cyberVisor,
] = imagelib.tools.reveal

const REVEAL_PRESETS = [
  {
    id: 'ring-silhouette',
    name: 'Twilight Ring → Twilight Silhouette',
    base: twilightRing,
    reveal: twilightSilhouette,
  },
  { id: 'blossom-prism', name: 'Blossom Arch → Prism Portrait', base: blossomArch, reveal: prismPortrait },
  { id: 'flora-cobalt', name: 'Flora Portrait → Cobalt Gaze', base: floraPortrait, reveal: cobaltGaze },
  { id: 'cosmic-ring-wave', name: 'Cosmic Ring → Cosmic Wave', base: cosmicRing, reveal: cosmicWave },
  { id: 'astronaut-cyber', name: 'Astronaut Visor → Cyber Visor', base: astronautVisor, reveal: cyberVisor },
]

function fileToDataURL(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(new Error('read failed'))
    fr.readAsDataURL(f)
  })
}

export function RevealPlayground() {
  const engine = useRevealEngine()
  const { showRight, setShowRight } = useResourceSidebars()

  const [baseSrc, setBaseSrc] = React.useState<string | null>(null)
  const [revealSrc, setRevealSrc] = React.useState<string | null>(null)
  const [baseName, setBaseName] = React.useState<string | null>(null)
  const [revealName, setRevealName] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement | null>(null)

  const tryLoad = React.useCallback(
    async (base: string | null, reveal: string | null) => {
      if (!base || !reveal) return
      setLoading(true)
      try {
        const [{ width, height }, depthBase, depthReveal] = await Promise.all([
          imageSize(base),
          pseudoDepth(base),
          pseudoDepth(reveal),
        ])
        await engine.loadImages({ base, reveal, depthBase, depthReveal, width, height })
        readySound()
      } finally {
        setLoading(false)
      }
    },
    [engine],
  )

  const loadPreset = React.useCallback(
    async (preset: (typeof REVEAL_PRESETS)[number]) => {
      pageSound()
      setBaseSrc(preset.base.url)
      setRevealSrc(preset.reveal.url)
      setBaseName(preset.base.name)
      setRevealName(preset.reveal.name)
      await tryLoad(preset.base.url, preset.reveal.url)
    },
    [tryLoad],
  )

  const baseUpload = useFileUpload({
    accept: 'image',
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        openSound()
        void fileToDataURL(item.file).then((url) => {
          setBaseSrc(url)
          setBaseName(item.file instanceof File ? item.file.name : item.name)
          void tryLoad(url, revealSrc)
        })
      }
    },
  })

  const revealUpload = useFileUpload({
    accept: 'image',
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        openSound()
        void fileToDataURL(item.file).then((url) => {
          setRevealSrc(url)
          setRevealName(item.file instanceof File ? item.file.name : item.name)
          void tryLoad(baseSrc, url)
        })
      }
    },
  })

  const reset = React.useCallback(() => {
    setBaseSrc(null)
    setRevealSrc(null)
    setBaseName(null)
    setRevealName(null)
    setLoading(false)
    setExpanded(false)
    setZoom(1)
    baseUpload.clearFiles()
    revealUpload.clearFiles()
  }, [baseUpload, revealUpload])

  const clampZoom = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v))
  const zoomIn = () => setZoom((z) => clampZoom(+(z + 0.1).toFixed(2)))
  const zoomOut = () => setZoom((z) => clampZoom(+(z - 0.1).toFixed(2)))
  const resetZoom = () => setZoom(1)

  const toggleFullscreen = React.useCallback(async () => {
    const el = wrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    info: false,
    sidebar: true,
    reset: true,
    viewToggle: false,
    onReset: reset,
    onToggleExpand: setExpanded,
    onToggleSidebar: setShowRight,
    sidebarVisible: showRight,
    expanded,
  }

  const reduced = useReducedMotion() ?? false
  const morphTransition = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }
  const hasBothImages = Boolean(baseSrc && revealSrc)

  return (
    <ResourceStudio
      showRight={showRight && !expanded}
      rightWidth="20rem"
      onToggleRight={setShowRight}
      className={expanded ? 'p-0' : undefined}
      canvas={
        <div
          ref={wrapRef}
          className="relative grid h-full w-full place-items-center overflow-hidden p-3 md:p-6 select-none"
        >
          <input {...baseUpload.getInputProps()} className="sr-only pointer-events-none" />
          <input {...revealUpload.getInputProps()} className="sr-only pointer-events-none" />

          <div
            className={cn(
              'relative col-start-1 row-start-1 flex size-full items-center justify-center',
              !hasBothImages && 'hidden',
            )}
          >
            <div
              className="relative flex max-h-full max-w-full items-center justify-center transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
            >
              <canvas ref={engine.canvasRef} className="max-h-[80vh] max-w-full cursor-crosshair rounded-lg" />
            </div>

            {hasBothImages && (
              <Group className="pointer-events-auto absolute bottom-4 right-4 inline-flex shrink-0 items-center gap-1 rounded-xl bg-background p-1 shadow-xs border border-border/40!">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  aria-label="Zoom out"
                >
                  <IconMinus className="size-4" />
                </Button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="min-w-13 rounded-lg px-2 py-1 text-xs font-medium tabular-nums text-foreground hover:bg-muted"
                  aria-label="Reset zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="Zoom in"
                >
                  <IconPlus className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={resetZoom}
                  aria-label="Reset view"
                >
                  <IconRotateClockwise2 className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="rounded-lg"
                  onClick={() => void toggleFullscreen()}
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
                </Button>
              </Group>
            )}
          </div>

          <AnimatePresence initial={false}>
            {loading ? (
              <motion.div
                key="loading-view"
                initial={reduced ? false : { scale: 0.98, opacity: 0, filter: 'blur(3px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={
                  reduced ? { opacity: 0 } : { scale: 0.98, opacity: 0, filter: 'blur(3px)', pointerEvents: 'none' }
                }
                transition={morphTransition}
                className="col-start-1 row-start-1 flex size-full items-center justify-center will-change-[opacity,transform,filter]"
              >
                <ImagePreviewLoading size="lg" />
              </motion.div>
            ) : !hasBothImages ? (
              <motion.div
                key="empty-view"
                initial={reduced ? false : { scale: 0.98, opacity: 0, filter: 'blur(3px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={
                  reduced ? { opacity: 0 } : { scale: 0.98, opacity: 0, filter: 'blur(3px)', pointerEvents: 'none' }
                }
                transition={morphTransition}
                className="col-start-1 row-start-1 flex w-full max-w-xl flex-col items-center gap-3.5 will-change-[opacity,transform,filter]"
              >
                <article className="flex w-full flex-col rounded-3xl bg-muted p-1.5 select-none shadow-none overflow-hidden">
                  <header className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center shadow-none">
                        <Squishmoji
                          seed="reveal"
                          size={24}
                          animate
                          animWobble
                          animOnHover
                          animOnClick
                          backgroundStyle="all"
                          className="size-full"
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">3D Reveal</span>
                    </div>
                    <span className="rounded-xl bg-background px-2.5 py-1 text-[0.625rem] font-medium text-muted-foreground">
                      Brush-reveal WebGL
                    </span>
                  </header>
                  <div className="flex flex-col items-center rounded-[1.125rem] bg-background p-6 text-center sm:p-8">
                    <Badge variant="secondary" className="mb-3 rounded-sm">
                      Space UI
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">
                      Brush away one image to reveal another.
                    </h1>
                    <p className="mt-2 mb-6 max-w-md text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Upload two images — the cursor paints a trail that reveals the second image underneath, with
                      real-time WebGL depth parallax on both.
                    </p>

                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        {...baseUpload.getRootProps()}
                        className={cn(
                          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors',
                          baseUpload.isDragging ? 'border-primary bg-muted' : 'border-border/80 bg-background',
                        )}
                      >
                        <div className="mb-2.5 grid size-11 place-items-center rounded-xl bg-muted text-foreground">
                          <IconUpload className="size-5" />
                        </div>
                        <p className="text-xs font-semibold sm:text-sm">{baseName ?? 'Base image'}</p>
                        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">The starting image</p>
                      </button>

                      <button
                        type="button"
                        {...revealUpload.getRootProps()}
                        className={cn(
                          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors',
                          revealUpload.isDragging ? 'border-primary bg-muted' : 'border-border/80 bg-background',
                        )}
                      >
                        <div className="mb-2.5 grid size-11 place-items-center rounded-xl bg-muted text-foreground">
                          <IconUpload className="size-5" />
                        </div>
                        <p className="text-xs font-semibold sm:text-sm">{revealName ?? 'Reveal image'}</p>
                        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">Shown underneath</p>
                      </button>
                    </div>
                  </div>
                </article>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {REVEAL_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant="ghost"
                      data-space-hover="tick"
                      onClick={() => void loadPreset(preset)}
                      className="group flex h-auto! flex-col items-center gap-1.5 rounded-2xl bg-muted p-1.5 hover:bg-muted/70 cursor-pointer shadow-none"
                    >
                      <div className="flex gap-0.5 overflow-hidden rounded-xl bg-background">
                        <NextImage
                          src={preset.base.url}
                          alt={preset.base.name}
                          width={56}
                          height={64}
                          className="aspect-square w-14 object-cover"
                        />
                        <NextImage
                          src={preset.reveal.url}
                          alt={preset.reveal.name}
                          width={56}
                          height={64}
                          className="aspect-square w-14 object-cover"
                        />
                      </div>
                      <span className="max-w-28 truncate px-1 text-[0.6875rem] font-medium text-muted-foreground group-hover:text-foreground">
                        {preset.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      }
      float={<ResourceToolbar config={toolbarConfig} left={<ResourceNav />} />}
      right={
        <RevealControlPanel
          config={engine.config}
          onChange={engine.setConfig}
          baseSrc={baseSrc}
          revealSrc={revealSrc}
          baseName={baseName}
          revealName={revealName}
          onPickBase={() => {
            bloomSound()
            baseUpload.openFileDialog()
          }}
          onPickReveal={() => {
            bloomSound()
            revealUpload.openFileDialog()
          }}
          hasImages={engine.hasImages}
          loading={loading}
          isRecording={engine.isRecording}
          recordSecondsLeft={engine.recordSecondsLeft}
          onStartRecording={(d) => void engine.startRecording(d)}
          onCancelRecording={engine.cancelRecording}
        />
      }
    />
  )
}
