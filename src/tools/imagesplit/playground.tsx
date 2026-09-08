'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { IconCut, IconDownload, IconPhoto } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import { bloomSound } from '@/components/providers/sound-provider'
import { cn } from '@/registry/lib/utils'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { ImageSplitControlPanel } from './control-panel'
import NextImage from 'next/image'
import { imagelib } from '@/lib/imagelib'
import { ImagePreviewLoading } from './loading'
import { useFileUpload } from '@/registry/hooks/form/use-file-upload'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import {
  createZipArchive,
  extFor,
  frameAspect,
  getColFlex,
  prepareSource,
  renderStage,
  sliceStage,
  toBlob,
  MAX_STAGE,
  type Ratio,
  type SplitConfig,
  type Tile,
} from './split'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'

const DEFAULTS: SplitConfig = {
  cols: 3,
  colFlex: [1, 2, 1],
  ratio: 'original',
  fit: 'cover',
  zoom: 1,
  panX: 0.5,
  panY: 0.5,
  gap: 0,
  bg: 'transparent',
  padding: 0,
  radius: 0,
  scale: 1,
  format: 'image/png',
  quality: 0.92,
  prefix: 'slice',
  reverse: false,
}

export function ImageSplitPlayground() {
  const [cfg, setCfg] = useState<SplitConfig>(DEFAULTS)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [loadingImage, setLoadingImage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { isDesktop, showRight, setShowRight } = useResourceSidebars()

  const previewRef = useRef<HTMLDivElement>(null)

  const colFlex = getColFlex(cfg)

  const toggleColFlex = useCallback((colIndex: number) => {
    bloomSound()
    setCfg((prev) => {
      const current = getColFlex(prev).slice()
      current[colIndex] = current[colIndex] === 1 ? 2 : 1
      return { ...prev, colFlex: current }
    })
  }, [])

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setLoadingImage(f.name)
    const url = URL.createObjectURL(f)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setFile({ name: f.name, size: f.size })
      setLoadingImage(null)
      bloomSound()
    }
    image.onerror = () => {
      setLoadingImage(null)
    }
    image.src = url
  }, [])

  const { isDragging, getRootProps, getInputProps, openFileDialog, clearFiles } = useFileUpload({
    accept: 'image',
    multiple: false,
    onFilesAdded: (added) => {
      const item = added[0]
      if (item && item.file instanceof File) {
        loadFile(item.file)
      }
    },
  })

  const loadFromUrl = useCallback((url: string, name: string) => {
    setLoadingImage(name)
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setImg(image)
      setFile({ name, size: 450000 })
      setLoadingImage(null)
      bloomSound()
    }
    image.onerror = () => {
      setLoadingImage(null)
    }
    image.src = url
  }, [])

  const prepared = useMemo(() => {
    if (!img) return null
    return prepareSource(img)
  }, [img])

  const dims = useMemo(() => {
    if (!prepared) return null
    const aspect = frameAspect(prepared, cfg)
    const baseW = Math.min(prepared.width, prepared.height * aspect)
    let stageW = Math.max(cfg.cols * 8, Math.round(baseW * cfg.scale))
    let stageH = Math.max(8, Math.round(stageW / aspect))
    const over = Math.max(stageW, stageH) / MAX_STAGE
    if (over > 1) {
      stageW = Math.round(stageW / over)
      stageH = Math.round(stageH / over)
    }
    const flexes = getColFlex(cfg)
    const totalFlex = flexes.reduce((a, b) => a + b, 0)
    const availW = Math.max(1, stageW - cfg.gap * (cfg.cols - 1))
    const tileW = Math.round((availW * flexes[0]) / totalFlex) + cfg.padding * 2
    const tileH = Math.round(stageH) + cfg.padding * 2
    return { stageW, stageH, tileW, tileH }
  }, [prepared, cfg])

  const previewCfg = useMemo<SplitConfig>(() => {
    if (!prepared || !dims) return cfg
    const k = Math.min(1, 1200 / dims.stageW)
    return {
      ...cfg,
      scale: cfg.scale * k,
      gap: cfg.gap ? Math.max(1, Math.round(cfg.gap * k)) : 0,
      padding: cfg.padding ? Math.max(1, Math.round(cfg.padding * k)) : 0,
      radius: cfg.radius ? Math.max(1, Math.round(cfg.radius * k)) : 0,
    }
  }, [cfg, prepared, dims])

  const tiles = useMemo<Tile[]>(() => {
    if (!prepared) return []
    const stage = renderStage(prepared, previewCfg)
    return sliceStage(stage, previewCfg)
  }, [prepared, previewCfg])

  // Interactive Pan and Zoom
  useEffect(() => {
    const el = previewRef.current
    if (!el || !prepared) return
    let dragging = false
    let last = { x: 0, y: 0 }

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest('button')) {
        return
      }
      dragging = true
      last = { x: e.clientX, y: e.clientY }
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const rect = el.getBoundingClientRect()
      const dx = (e.clientX - last.x) / rect.width
      const dy = (e.clientY - last.y) / rect.height
      last = { x: e.clientX, y: e.clientY }
      setCfg((c) => ({
        ...c,
        panX: Math.min(1, Math.max(0, c.panX - dx / c.zoom)),
        panY: Math.min(1, Math.max(0, c.panY - dy / c.zoom)),
      }))
    }
    const up = () => {
      dragging = false
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1)
      setCfg((c) => ({
        ...c,
        zoom: Math.min(5, Math.max(1, c.zoom * Math.exp(-dy * 0.0015))),
      }))
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [prepared])

  const buildExport = useCallback(async () => {
    if (!prepared) return []
    const stage = renderStage(prepared, cfg)
    const parts = sliceStage(stage, cfg)
    const ext = extFor(cfg.format)
    return Promise.all(
      parts.map(async (t, i) => ({
        name: `${cfg.prefix || 'slice'}-${String(i + 1).padStart(2, '0')}.${ext}`,
        blob: await toBlob(t.canvas, cfg),
      })),
    )
  }, [prepared, cfg])

  const downloadOne = useCallback(
    async (i: number) => {
      bloomSound()
      const files = await buildExport()
      const f = files[i]
      if (!f) return
      saveBlob(f.blob, f.name)
    },
    [buildExport],
  )

  const downloadZip = useCallback(async () => {
    setBusy(true)
    bloomSound()
    try {
      const files = await buildExport()
      const blob = await createZipArchive(files)
      saveBlob(blob, `${cfg.prefix || 'slice'}-${files.length}-parts.zip`)
    } finally {
      setBusy(false)
    }
  }, [buildExport, cfg.prefix])

  const downloadBatch = useCallback(async () => {
    setBusy(true)
    bloomSound()
    try {
      const files = await buildExport()
      const sorted = files.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      for (let i = 0; i < sorted.length; i++) {
        const f = sorted[i]
        saveBlob(f.blob, f.name)
        if (i < sorted.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } finally {
      setBusy(false)
    }
  }, [buildExport])

  const reset = useCallback(() => {
    bloomSound()
    setCfg(DEFAULTS)
    setImg(null)
    setFile(null)
    setLoadingImage(null)
    setExpanded(false)
    clearFiles()
  }, [clearFiles])

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

  return (
    <>
      <ResourceStudio
        showRight={showRight && !expanded}
        rightWidth="20rem"
        onToggleRight={setShowRight}
        className={expanded ? 'p-0' : undefined}
        canvas={
          <div className="relative grid place-items-center h-full w-full overflow-hidden p-3 md:p-6 select-none">
            <AnimatePresence initial={false}>
              {loadingImage ? (
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
              ) : !img ? (
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
                            seed={DEFAULT_SEEDS}
                            size={24}
                            animate
                            animWobble
                            animOnHover
                            animOnClick
                            backgroundStyle="all"
                            className="size-full"
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground">Image Slicer</span>
                      </div>
                      <span className="rounded-xl bg-background px-2.5 py-1 text-[0.625rem] font-medium text-muted-foreground">
                        Polished Panorama
                      </span>
                    </header>
                    <div className="flex flex-col items-center text-center rounded-[1.125rem] bg-background p-6 sm:p-8">
                      <Badge variant="secondary" className="rounded-sm mb-3">
                        Space UI
                      </Badge>
                      <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-balance">
                        Split images into seamless columns.
                      </h1>
                      <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty mb-6">
                        Upload an image to slice into seamless Instagram carousels, panorama strips, and custom
                        multi-part layouts with pixel-accurate framing.
                      </p>

                      <div
                        {...getRootProps()}
                        className={cn(
                          'flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 transition-colors',
                          isDragging ? 'border-primary bg-muted' : 'border-border/80 bg-background',
                        )}
                      >
                        <input {...getInputProps()} className="invisible [text-align-last:center]" />
                        <div className="grid size-11 place-items-center rounded-xl bg-muted text-foreground mb-2.5">
                          <IconCut className="size-5" />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold">Drop an image here or click to browse</p>
                        <p className="text-[0.6875rem] text-muted-foreground mt-0.5">PNG, JPG, or WebP</p>
                      </div>
                    </div>
                  </article>

                  {/* Sample cards outside the card, just below it */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {imagelib.tools.imagesplit.map((sample) => (
                      <Button
                        key={sample.id}
                        type="button"
                        variant="ghost"
                        onClick={() => loadFromUrl(sample.url, `${sample.name.toLowerCase().replace(/\s+/g, '-')}.png`)}
                        className="group flex h-auto! flex-col items-center gap-1.5 rounded-2xl bg-muted p-1.5 hover:bg-muted/70 cursor-pointer shadow-none"
                      >
                        <div className="relative aspect-video w-28 overflow-hidden rounded-xl bg-background">
                          <NextImage
                            src={sample.url}
                            alt={sample.name}
                            width={112}
                            height={64}
                            className="size-full object-cover"
                          />
                        </div>
                        <span className="max-w-[112px] truncate px-1 text-[0.6875rem] font-medium text-muted-foreground group-hover:text-foreground">
                          {sample.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.article
                  key="preview-card"
                  initial={reduced ? false : { scale: 0.98, opacity: 0, filter: 'blur(3px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  exit={
                    reduced ? { opacity: 0 } : { scale: 0.98, opacity: 0, filter: 'blur(3px)', pointerEvents: 'none' }
                  }
                  transition={morphTransition}
                  className="col-start-1 row-start-1 flex w-fit max-w-full max-h-full flex-col rounded-2xl bg-muted p-1.5 select-none shadow-none overflow-hidden will-change-[opacity,transform,filter]"
                  style={{
                    maxWidth: dims ? `min(100%, calc((100vh - 12rem) * (${dims.stageW} / ${dims.stageH})))` : '100%',
                  }}
                >
                  <header className="flex shrink-0 items-center justify-between gap-3 px-2 py-1.5 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center shadow-none">
                        <Squishmoji
                          seed={file?.name ?? DEFAULT_SEEDS}
                          size={24}
                          animate
                          animWobble
                          animOnHover
                          animOnClick
                          backgroundStyle="all"
                          className="size-full"
                        />
                      </div>
                      <h2 className="truncate text-xs sm:text-sm font-semibold text-foreground">
                        {file?.name ?? 'Canvas Preview'}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {dims && (
                        <span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                          {cfg.cols} parts
                        </span>
                      )}
                    </div>
                  </header>

                  <div
                    ref={previewRef}
                    className="grid w-full touch-none select-none overflow-hidden rounded-xl bg-background"
                    style={{
                      gridTemplateColumns: colFlex.map((f) => `${f}fr`).join(' '),
                      gap: '2px',
                      aspectRatio: dims ? `${dims.stageW} / ${dims.stageH}` : undefined,
                    }}
                  >
                    {tiles.map((t, i) => (
                      <div
                        key={`tile-${t.col}-${t.flex}`}
                        onClick={() => toggleColFlex(i)}
                        className="relative h-full w-full overflow-hidden cursor-pointer"
                      >
                        <CanvasView canvas={t.canvas} />

                        {/* Column Number Badge */}
                        <Badge
                          variant="secondary"
                          className="pointer-events-none absolute left-2 top-2 aspect-square rounded-full bg-background border-2 border-muted h-auto px-1.5 py-0.5"
                        >
                          {i + 1}
                        </Badge>

                        {/* Download button - using registry Button */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            void downloadOne(i)
                          }}
                          aria-label={`Download slice ${i + 1}`}
                          title={`Download slice ${i + 1}`}
                          className="absolute right-2 top-2 z-20 cursor-pointer bg-background border-2 border-muted hover:bg-muted"
                        >
                          <IconDownload className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        }
        float={<ResourceToolbar config={toolbarConfig} left={<ResourceNav />} />}
        right={
          <ImageSplitControlPanel
            cfg={cfg}
            setCfg={setCfg}
            file={file}
            img={img}
            dims={dims}
            busy={busy}
            onReset={reset}
            onDownloadZip={() => void downloadZip()}
            onDownloadBatch={() => void downloadBatch()}
            onPickFile={openFileDialog}
          />
        }
      />
    </>
  )
}

function CanvasView({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.objectFit = 'cover'
    canvas.style.display = 'block'
    el.replaceChildren(canvas)
  }, [canvas])
  return <div ref={ref} className="h-full w-full overflow-hidden" />
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
