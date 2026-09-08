'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import Link from 'next/link'
import {
  IconArrowLeft,
  IconColumns,
  IconCut,
  IconDownload,
  IconFileZip,
  IconPhoto,
  IconRefresh,
  IconUpload,
  IconZoomIn,
  IconSparkles,
} from '@tabler/icons-react'
import { ResourceNav } from '@/resources/components/shared/layout/nav'
import {
  extFor,
  formatBytes,
  frameAspect,
  prepareSource,
  renderStage,
  sliceStage,
  toBlob,
  MAX_STAGE,
  type SplitConfig,
  type Ratio,
  type Tile,
} from './split'

const DEFAULTS: SplitConfig = {
  cols: 4,
  ratio: 'original',
  fit: 'cover',
  zoom: 1,
  panX: 0.5,
  panY: 0.5,
  gap: 0,
  bg: '#09090b',
  padding: 0,
  radius: 0,
  scale: 1,
  format: 'image/png',
  quality: 0.92,
  prefix: 'slice',
  reverse: false,
}

const RATIOS: { label: string; value: Ratio; desc: string }[] = [
  { label: 'Original', value: 'original', desc: 'Ratio source' },
  { label: '4:5', value: 4 / 5, desc: 'Insta Portrait' },
  { label: '1:1', value: 1, desc: 'Carré' },
  { label: '3:4', value: 3 / 4, desc: 'Standard' },
  { label: '9:16', value: 9 / 16, desc: 'Story / Reel' },
  { label: '16:9', value: 16 / 9, desc: 'Landscape' },
]

const PRESETS: { label: string; cols: number; ratio: Ratio; desc: string }[] = [
  { label: 'Carousel ×3', cols: 3, ratio: 4 / 5, desc: 'Post Instagram 3 panneaux' },
  { label: 'Carousel ×4', cols: 4, ratio: 4 / 5, desc: 'Post Instagram 4 panneaux' },
  { label: 'Panorama ×2', cols: 2, ratio: 'original', desc: 'Double page panoramique' },
  { label: 'Story strip ×5', cols: 5, ratio: 9 / 16, desc: 'Série de 5 Stories' },
]

const DEMO_PREVIEWS = [
  {
    label: 'Cyber Grid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    label: 'Abstract Neon',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
  },
  {
    label: 'Cosmic Gradient',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
  },
]

export function XplitPlayground() {
  const [cfg, setCfg] = useState<SplitConfig>(DEFAULTS)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = useCallback(<K extends keyof SplitConfig>(key: K, value: SplitConfig[K]) => {
    setCfg((c) => ({ ...c, [key]: value }))
  }, [])

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    const url = URL.createObjectURL(f)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setFile({ name: f.name, size: f.size })
    }
    image.src = url
  }, [])

  const loadFromUrl = useCallback((url: string, name: string) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setImg(image)
      setFile({ name, size: 450000 })
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
    const tileW = Math.round((stageW - cfg.gap * (cfg.cols - 1)) / cfg.cols) + cfg.padding * 2
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

  // Pan et Zoom interactifs
  useEffect(() => {
    const el = previewRef.current
    if (!el || !prepared) return
    let dragging = false
    let last = { x: 0, y: 0 }

    const down = (e: PointerEvent) => {
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
      const files = await buildExport()
      const f = files[i]
      if (!f) return
      saveBlob(f.blob, f.name)
    },
    [buildExport],
  )

  const downloadAll = useCallback(async () => {
    setBusy(true)
    try {
      const files = await buildExport()
      const zip = new JSZip()
      files.forEach((f) => zip.file(f.name, f.blob))
      const blob = await zip.generateAsync({ type: 'blob' })
      saveBlob(blob, `${cfg.prefix || 'slice'}-${files.length}-parts.zip`)
    } finally {
      setBusy(false)
    }
  }, [buildExport, cfg.prefix])

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-3 md:px-4 z-20">
        <div className="flex items-center gap-2">
          <ResourceNav />
          <Link
            href="/tools"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconArrowLeft className="size-3.5" />
            <span>Tools</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-sm">
              <IconCut className="size-4 text-primary" />
              <span>Xplit</span>
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Studio
            </span>
          </div>
        </div>

        {file && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="max-w-[180px] truncate font-medium text-foreground">{file.name}</span>
            <span>·</span>
            <span>
              {img?.naturalWidth}×{img?.naturalHeight} px
            </span>
            <span>·</span>
            <span>{formatBytes(file.size)}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {img && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              <IconUpload className="size-3.5" />
              <span>Remplacer</span>
            </button>
          )}
          <button
            onClick={() => setCfg(DEFAULTS)}
            title="Réinitialiser tous les paramètres"
            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconRefresh className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) loadFile(f)
            }}
          />
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Central Canvas / Dropzone Area */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-muted/20 p-4 md:p-8">
          {!img ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) loadFile(f)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border/80 bg-card hover:border-primary/50 hover:bg-muted/40 shadow-sm'
              }`}
            >
              <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                <IconCut className="size-8" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight mb-1">Déposez une image pour la découper</h2>
              <p className="text-xs text-muted-foreground max-w-sm mb-6">
                Glissez-déposez votre visuel ou cliquez pour parcourir. Formats supportés : PNG, JPG, WebP.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              >
                <IconUpload className="size-4" />
                <span>Sélectionner un fichier</span>
              </button>

              <div className="mt-8 pt-6 border-t border-border w-full">
                <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">
                  Ou essayer un exemple
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {DEMO_PREVIEWS.map((demo) => (
                    <button
                      key={demo.label}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        loadFromUrl(demo.url, `${demo.label.toLowerCase().replace(' ', '-')}.jpg`)
                      }}
                      className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs hover:border-primary/40 hover:bg-muted transition-colors"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full max-h-full overflow-hidden">
              <div
                ref={previewRef}
                className="grid cursor-grab touch-none select-none active:cursor-grabbing rounded-2xl p-2 bg-card/60 shadow-lg border border-border/80 backdrop-blur-sm max-w-full max-h-[calc(100%-4rem)] overflow-hidden transition-shadow"
                style={{
                  gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
                  gap: cfg.gap > 0 ? '6px' : '2px',
                }}
              >
                {tiles.map((t, i) => (
                  <div
                    key={t.col}
                    className="group relative overflow-hidden rounded-lg bg-black/5 shadow-xs transition-transform"
                  >
                    <CanvasView canvas={t.canvas} />
                    <span className="pointer-events-none absolute left-2 top-2 grid size-6 place-items-center rounded-full bg-background/80 backdrop-blur-md text-[11px] font-bold shadow-xs border border-border/40">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void downloadOne(i)
                      }}
                      className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                      title={`Télécharger la partie ${i + 1}`}
                      aria-label={`Télécharger la tranche ${i + 1}`}
                    >
                      <IconDownload className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Status footer bar */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-card border border-border px-3 py-1 font-medium text-foreground">
                  {cfg.cols} parties {dims ? `· ${dims.tileW} × ${dims.tileH} px par tranche` : ''}
                </span>
                <span className="rounded-full bg-card border border-border px-3 py-1">
                  Glisser pour déplacer le cadrage · Molette pour zoomer ({cfg.zoom.toFixed(2)}×)
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar Controls */}
        <aside className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col shrink-0 overflow-y-auto max-h-[50dvh] lg:max-h-full">
          <div className="p-4 space-y-5">
            {/* Presets */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Presets rapides
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCfg((c) => ({ ...c, cols: p.cols, ratio: p.ratio }))}
                    className="flex flex-col items-start rounded-xl border border-border/80 bg-muted/30 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-muted/70"
                  >
                    <span className="text-xs font-semibold">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Framing Controls */}
            <section className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cadrage & Découpage
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Nombre de colonnes</span>
                  <span className="font-semibold">{cfg.cols}</span>
                </div>
                <div className="flex items-center justify-between rounded-full bg-muted/60 p-1 border border-border/60">
                  <button
                    type="button"
                    onClick={() => set('cols', Math.max(1, cfg.cols - 1))}
                    className="grid size-7 place-items-center rounded-full hover:bg-card transition-colors text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold">{cfg.cols} parties</span>
                  <button
                    type="button"
                    onClick={() => set('cols', Math.min(10, cfg.cols + 1))}
                    className="grid size-7 place-items-center rounded-full hover:bg-card transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Format de tranche</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/40 p-1 border border-border/60">
                  {RATIOS.map((r) => (
                    <button
                      key={String(r.value)}
                      type="button"
                      onClick={() => set('ratio', r.value === 'original' ? 'original' : (Number(r.value) as Ratio))}
                      className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                        String(cfg.ratio) === String(r.value)
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Mode de remplissage</span>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1 border border-border/60">
                  <button
                    type="button"
                    onClick={() => set('fit', 'cover')}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                      cfg.fit === 'cover'
                        ? 'bg-card text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Remplir (Cover)
                  </button>
                  <button
                    type="button"
                    onClick={() => set('fit', 'contain')}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                      cfg.fit === 'contain'
                        ? 'bg-card text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Adapter (Contain)
                  </button>
                </div>
              </div>

              <RangeSlider
                label="Zoom"
                value={cfg.zoom}
                min={1}
                max={5}
                step={0.01}
                suffix="×"
                onChange={(v) => set('zoom', v)}
              />

              <RangeSlider
                label="Position horizontale (Pan X)"
                value={cfg.panX}
                min={0}
                max={1}
                step={0.005}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => set('panX', v)}
              />

              <RangeSlider
                label="Position verticale (Pan Y)"
                value={cfg.panY}
                min={0}
                max={1}
                step={0.005}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => set('panY', v)}
              />

              <button
                type="button"
                onClick={() => setCfg((c) => ({ ...c, zoom: 1, panX: 0.5, panY: 0.5 }))}
                className="w-full rounded-xl border border-border/80 bg-muted/30 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Réinitialiser le cadrage
              </button>
            </section>

            {/* Styling & Margins */}
            <section className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Style & Finition
              </h3>

              <RangeSlider
                label="Espacement (Gap)"
                value={cfg.gap}
                min={0}
                max={120}
                step={1}
                suffix=" px"
                onChange={(v) => set('gap', Math.round(v))}
              />

              <RangeSlider
                label="Bordure interne (Padding)"
                value={cfg.padding}
                min={0}
                max={120}
                step={1}
                suffix=" px"
                onChange={(v) => set('padding', Math.round(v))}
              />

              <RangeSlider
                label="Coins arrondis (Radius)"
                value={cfg.radius}
                min={0}
                max={120}
                step={1}
                suffix=" px"
                onChange={(v) => set('radius', Math.round(v))}
              />

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Couleur de fond</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-muted-foreground">{cfg.bg}</span>
                  <input
                    type="color"
                    value={cfg.bg}
                    onChange={(e) => set('bg', e.target.value)}
                    className="size-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Inverser l'ordre des colonnes</span>
                <button
                  type="button"
                  onClick={() => set('reverse', !cfg.reverse)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    cfg.reverse ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cfg.reverse ? 'Inversé' : 'Normal'}
                </button>
              </div>
            </section>

            {/* Export Section */}
            <section className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Export & Téléchargement
              </h3>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Format de sortie</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/40 p-1 border border-border/60">
                  {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => set('format', fmt)}
                      className={`rounded-lg py-1 text-xs font-medium transition-all ${
                        cfg.format === fmt
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                    </button>
                  ))}
                </div>
              </div>

              {cfg.format !== 'image/png' && (
                <RangeSlider
                  label="Qualité d'image"
                  value={cfg.quality}
                  min={0.3}
                  max={1}
                  step={0.01}
                  format={(v) => `${Math.round(v * 100)}%`}
                  onChange={(v) => set('quality', v)}
                />
              )}

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Facteur d'échelle (Résolution)</span>
                <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/40 p-1 border border-border/60">
                  {[0.5, 1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('scale', s)}
                      className={`rounded-lg py-1 text-xs font-medium transition-all ${
                        cfg.scale === s
                          ? 'bg-card text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Préfixe du nom de fichier</span>
                <input
                  type="text"
                  value={cfg.prefix}
                  onChange={(e) => set('prefix', e.target.value)}
                  placeholder="slice"
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium outline-none focus:border-primary focus:bg-background transition-colors"
                />
              </div>

              <button
                type="button"
                disabled={!img || busy}
                onClick={() => void downloadAll()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <IconFileZip className="size-4" />
                <span>
                  {busy ? 'Génération du ZIP…' : `Télécharger tout en ZIP (${cfg.cols} fichiers)`}
                </span>
              </button>

              <p className="text-center text-[11px] text-muted-foreground">
                {dims
                  ? `Archive ZIP · ${dims.tileW} × ${dims.tileH} px par tranche`
                  : 'Importez une image pour activer le téléchargement'}
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CanvasView({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    canvas.style.display = 'block'
    el.replaceChildren(canvas)
  }, [canvas])
  return <div ref={ref} className="w-full" />
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  format?: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {format ? format(value) : `${Math.round(value * 100) / 100}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
