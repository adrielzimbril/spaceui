'use client'

import React, { useRef, useState } from 'react'
import {
  IconCheck,
  IconClock,
  IconCopy,
  IconDeviceFloppy,
  IconDownload,
  IconFileCode,
  IconMovie,
  IconPhoto,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { toCanvas, toPng } from 'html-to-image'
import { ArrayBufferTarget, Muxer } from 'mp4-muxer'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import { Slider } from '@/registry/primitives/slider'
import { Switch } from '@/registry/primitives/switch'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/registry/primitives/tabs'
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from '@/registry/primitives/drawer'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { CopyButton } from '@/registry/components/spaceui/copy'
import {
  bloomSound,
  confirmSound,
  nudgeSound,
  slideSound,
  tapSound,
  tickSound,
} from '@/components/providers/sound-provider'
import { useResourceDesktop } from '@/tools/components/shared/layout/viewport'
import { cn } from '@/registry/lib/utils'
import type { AnimType, OgState } from './types'
import { ANIMS, DEFAULT_OG_STATE } from './presets'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const even = (n: number) => {
  const v = Math.round(n)
  return v % 2 ? v - 1 : v
}
const clipSeconds = (s: OgState) => s.animDuration + s.animHold
const clipFrames = (s: OgState) => Math.max(2, Math.round(clipSeconds(s) * s.animFps))

interface OgExportDrawerProps {
  open: boolean
  onClose: () => void
  s: OgState
  cardRef: React.RefObject<HTMLDivElement | null>
  presetName: string
  onImportState: (state: OgState) => void
}

export function OgExportDrawer({ open, onClose, s, cardRef, presetName, onImportState }: OgExportDrawerProps) {
  const isDesktop = useResourceDesktop()
  const [scale, setScale] = useState<number>(2)
  const [busy, setBusy] = useState<string | null>(null)
  const [progressPercent, setProgressPercent] = useState<number>(0)

  // MP4 render settings
  const [batch, setBatch] = useState(false)
  const [loopCount, setLoopCount] = useState(1)
  const [loopGap, setLoopGap] = useState(0.5)

  // Code Tab state
  const [codeTab, setCodeTab] = useState<'nextjs' | 'html' | 'json'>('nextjs')
  const [copiedImg, setCopiedImg] = useState(false)
  const jsonFileRef = useRef<HTMLInputElement>(null)

  // Save Blob helper
  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 8000)
  }

  // Download PNG at selected scale
  const handleDownloadPng = async () => {
    if (!cardRef.current) return
    setBusy('Rendering PNG...')
    setProgressPercent(30)
    try {
      bloomSound()
      const url = await toPng(cardRef.current, {
        width: s.width,
        height: s.height,
        canvasWidth: s.width * scale,
        canvasHeight: s.height * scale,
        pixelRatio: 1,
        cacheBust: true,
      })
      setProgressPercent(90)
      const a = document.createElement('a')
      a.href = url
      a.download = `spaceui-og-${presetName}-${s.layout}@${scale}x.png`
      a.click()
      confirmSound()
    } catch (err) {
      console.error(err)
      nudgeSound()
    } finally {
      setBusy(null)
      setProgressPercent(0)
    }
  }

  // Copy PNG to Clipboard
  const handleCopyClipboard = async () => {
    if (!cardRef.current) return
    setBusy('Copying image...')
    try {
      bloomSound()
      const url = await toPng(cardRef.current, {
        width: s.width,
        height: s.height,
        canvasWidth: s.width * scale,
        canvasHeight: s.height * scale,
        pixelRatio: 1,
        cacheBust: true,
      })
      const blob = await (await fetch(url)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopiedImg(true)
      confirmSound()
      setTimeout(() => setCopiedImg(false), 2500)
    } catch (err) {
      console.error(err)
      nudgeSound()
    } finally {
      setBusy(null)
    }
  }

  // Render Clip to WebCodecs H.264 MP4
  const renderClip = async (
    animType: AnimType,
    onProgress: (pct: number, label: string) => void,
  ): Promise<{ blob: Blob; ext: string; seconds: number }> => {
    const card = cardRef.current
    if (!card) throw new Error('Card element not ready')

    const fps = Math.round(s.animFps)
    const perLoop = clipFrames(s)
    const loopSeconds = clipSeconds(s)
    const loops = Math.max(1, Math.round(loopCount))
    const gapFrames = loops > 1 ? Math.max(0, Math.round(loopGap * fps)) : 0
    const total = perLoop * loops + gapFrames * (loops - 1)
    const seconds = total / fps

    const cap = 4096 / Math.max(s.width, s.height)
    const vScale = Math.max(1, Math.min(scale, cap))
    const width = even(s.width * vScale)
    const height = even(s.height * vScale)
    const bitrate = Math.min(48_000_000, Math.round(width * height * fps * 0.12))

    let muxer: Muxer<ArrayBufferTarget> | null = null
    let encoder: VideoEncoder | null = null
    let useMp4 = false

    async function tryCreateEncoder(): Promise<{
      encoder: VideoEncoder
      muxer: Muxer<ArrayBufferTarget>
    } | null> {
      if (typeof window === 'undefined' || !('VideoEncoder' in window)) return null
      const candidates = [
        {
          codec: 'avc1.420028',
          width,
          height,
          bitrate,
          framerate: fps,
          latencyMode: 'quality' as const,
        },
        {
          codec: 'avc1.4D0028',
          width,
          height,
          bitrate,
          framerate: fps,
          latencyMode: 'quality' as const,
        },
        {
          codec: 'avc1.640028',
          width,
          height,
          bitrate,
          framerate: fps,
          latencyMode: 'quality' as const,
        },
      ]

      for (const config of candidates) {
        try {
          const supported = await VideoEncoder.isConfigSupported(config)
          if (!supported.supported) continue
          const m = new Muxer({
            target: new ArrayBufferTarget(),
            video: { codec: 'avc', width, height },
            fastStart: 'in-memory',
          })
          let encoderError: Error | null = null
          const e = new VideoEncoder({
            output: (chunk, meta) => m.addVideoChunk(chunk, meta),
            error: (err) => {
              encoderError = err
              console.error(err)
            },
          })
          await e.configure(config)
          await new Promise((r) => setTimeout(r, 50))
          if (encoderError || e.state !== 'configured') {
            try {
              e.close()
            } catch {
              /* ignored */
            }
            continue
          }
          return { encoder: e, muxer: m }
        } catch {
          /* try next candidate */
        }
      }
      return null
    }

    try {
      const enc = await tryCreateEncoder()
      if (enc) {
        encoder = enc.encoder
        muxer = enc.muxer
        useMp4 = true
      }

      const bitmaps: ImageBitmap[] = []
      for (let i = 0; i < total; i++) {
        const pct = Math.round(((i + 1) / total) * 90)
        onProgress(pct, `Frame ${i + 1}/${total}`)

        const canvas = await toCanvas(card, {
          width: s.width,
          height: s.height,
          canvasWidth: width,
          canvasHeight: height,
          pixelRatio: 1,
          cacheBust: i === 0,
        })

        if (useMp4 && encoder && muxer) {
          const frame = new VideoFrame(canvas, {
            timestamp: Math.round((i * 1_000_000) / fps),
            duration: Math.round(1_000_000 / fps),
          })
          try {
            encoder.encode(frame, { keyFrame: i % fps === 0 })
          } catch (err) {
            console.error(err)
            useMp4 = false
            encoder.close()
            encoder = null
            muxer = null
            bitmaps.push(await createImageBitmap(canvas))
          } finally {
            frame.close()
          }
          if (encoder && encoder.encodeQueueSize > 8) await sleep(8)
        } else {
          bitmaps.push(await createImageBitmap(canvas))
        }
      }

      onProgress(95, 'Finalizing MP4 container...')
      let blob: Blob
      let ext = 'mp4'

      if (useMp4 && encoder && muxer) {
        await encoder.flush()
        encoder.close()
        encoder = null
        muxer.finalize()
        blob = new Blob([muxer.target.buffer], { type: 'video/mp4' })
      } else {
        // Fallback MediaRecorder
        const out = document.createElement('canvas')
        out.width = width
        out.height = height
        const ctx = out.getContext('2d', { alpha: false })!
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)
        const stream = out.captureStream(fps)
        const track = stream.getVideoTracks()[0]
        const canRequestFrame = Boolean(
          track && 'requestFrame' in track && typeof (track as any).requestFrame === 'function',
        )

        const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) =>
          MediaRecorder.isTypeSupported(m),
        )
        if (!mime) throw new Error('Video recording unsupported in this environment')
        ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm'

        const chunks: BlobPart[] = []
        const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate })
        rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
        const done = new Promise<void>((res) => (rec.onstop = () => res()))
        rec.start()
        for (const f of bitmaps) {
          ctx.drawImage(f, 0, 0, width, height)
          if (canRequestFrame && track) (track as any).requestFrame()
          await sleep(1000 / fps)
        }
        await sleep(200)
        rec.stop()
        await done
        bitmaps.forEach((b) => b.close())
        blob = new Blob(chunks, { type: rec.mimeType || mime })
      }

      return { blob, ext, seconds }
    } finally {
      try {
        encoder?.close()
      } catch {
        /* already closed */
      }
    }
  }

  // Video Export Handler
  const handleExportVideo = async () => {
    if (!cardRef.current) return
    setBusy('Initializing video encoder...')
    setProgressPercent(5)
    bloomSound()

    try {
      const types = batch ? ANIMS : [s.animType]
      for (let k = 0; k < types.length; k++) {
        const type = types[k] as AnimType
        const prefix = batch ? `[${k + 1}/${types.length} ${type}] ` : ''
        const { blob, ext, seconds } = await renderClip(type, (pct, label) => {
          setProgressPercent(pct)
          setBusy(prefix + label)
        })
        saveBlob(blob, `spaceui-og-${presetName}-${s.layout}-${type}-${seconds.toFixed(1)}s@${scale}x.${ext}`)
        confirmSound()
        await sleep(300)
      }
    } catch (err) {
      console.error(err)
      nudgeSound()
      alert(`Video render error: ${(err as Error)?.message || String(err)}`)
    } finally {
      setBusy(null)
      setProgressPercent(0)
    }
  }

  // JSON Save / Load
  const handleDownloadJson = () => {
    bloomSound()
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
    saveBlob(blob, `spaceui-og-${presetName}-${s.layout}-config.json`)
  }

  // Generate code snippets
  const nextjsCode = `// app/layout.tsx or app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${s.title.replace(/'/g, "\\'")}',
  description: '${s.subtitle.replace(/'/g, "\\'")}',
  openGraph: {
    title: '${s.title.replace(/'/g, "\\'")}',
    description: '${s.subtitle.replace(/'/g, "\\'")}',
    images: [
      {
        url: '/og.png',
        width: ${s.width},
        height: ${s.height},
        alt: '${s.title.replace(/'/g, "\\'")}',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '${s.title.replace(/'/g, "\\'")}',
    description: '${s.subtitle.replace(/'/g, "\\'")}',
    images: ['/og.png'],
  },
}`

  const htmlCode = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${s.title.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${s.subtitle.replace(/"/g, '&quot;')}" />
<meta property="og:image" content="https://yourdomain.com/og.png" />
<meta property="og:image:width" content="${s.width}" />
<meta property="og:image:height" content="${s.height}" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${s.title.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${s.subtitle.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="https://yourdomain.com/og.png" />`

  const jsonCode = JSON.stringify(s, null, 2)

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          slideSound()
          onClose()
        }
      }}
      position={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPopup
        className={cn(
          'max-w-xl border-none bg-muted p-2! shadow-none before:shadow-none dark:before:shadow-none',
          !isDesktop && 'pt-8',
        )}
        variant="inset"
        showBar={!isDesktop}
      >
        <DrawerHeader className="rounded-2xl bg-background px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <DrawerDescription className="text-xs font-medium tracking-tight text-muted-foreground uppercase">
                OG Image Studio
              </DrawerDescription>
              <DrawerTitle className="mt-1 truncate text-lg font-semibold tracking-tight">
                Export & Production Assets
              </DrawerTitle>
            </div>
            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close drawer"
                  className="size-10 shrink-0 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <IconX className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <DrawerPanel className="space-y-2 px-1 pt-2">
          {/* Export Resolution & Scale */}
          <section className="rounded-2xl bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[0.625rem] font-medium tracking-tight text-muted-foreground uppercase">
                Render Scale & Resolution
              </h3>
              <span className="font-mono text-xs font-medium text-foreground">
                {s.width * scale} × {s.height * scale} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { s: 1, label: '1× Standard', desc: `${s.width}×${s.height}` },
                { s: 2, label: '2× Retina HD', desc: `${s.width * 2}×${s.height * 2}` },
                { s: 3, label: '3× Ultra Print', desc: `${s.width * 3}×${s.height * 3}` },
              ].map((item) => (
                <Button
                  key={item.s}
                  type="button"
                  variant={scale === item.s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    tapSound()
                    setScale(item.s)
                  }}
                  className={cn(
                    'h-11 flex-col items-center justify-center rounded-xl',
                    scale === item.s
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  <span className="font-mono text-[10px] opacity-75">{item.desc}</span>
                </Button>
              ))}
            </div>
          </section>

          {/* Quick Actions (PNG & Clipboard) */}
          <section className="rounded-2xl bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[0.625rem] font-medium tracking-tight text-muted-foreground uppercase">
                Static Image Export
              </h3>
              <span className="text-xs text-muted-foreground">Lossless PNG</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                disabled={Boolean(busy)}
                onClick={handleDownloadPng}
                className="h-10 gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <IconDownload className="size-4" />
                Download PNG {scale}x
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={Boolean(busy)}
                onClick={handleCopyClipboard}
                className="h-10 gap-2 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80"
              >
                {copiedImg ? (
                  <>
                    <IconCheck className="size-4 text-emerald-500" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <IconCopy className="size-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* 60fps MP4 Video Export */}
          <section className="space-y-3 rounded-2xl bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[0.625rem] font-medium tracking-tight text-muted-foreground uppercase">
                  60 FPS Video Export
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">High-profile H.264 WebCodecs MP4 output</p>
              </div>
              <Badge variant="outline" className="h-5 px-2 font-mono text-[10px]">
                {s.animFps} FPS · {clipSeconds(s).toFixed(1)}s
              </Badge>
            </div>

            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span>Batch Mode (Export All 6 Animations)</span>
                <Switch
                  checked={batch}
                  onCheckedChange={(c) => {
                    tickSound()
                    setBatch(c)
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Loops ({loopCount}×)</span>
                <div className="w-40">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[loopCount]}
                    onValueChange={(v) => setLoopCount(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar when busy */}
            {busy && (
              <div className="space-y-1.5 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="truncate text-foreground">{busy}</span>
                  <span className="font-mono text-primary">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              disabled={Boolean(busy)}
              onClick={handleExportVideo}
              className="h-10 w-full gap-2 rounded-xl text-xs font-semibold"
            >
              <IconMovie className="size-4" />
              {batch ? `Render MP4 Batch (${ANIMS.length} files)` : `Render & Download MP4 (${scale}x)`}
            </Button>
          </section>

          {/* Code Snippets & JSON Spec */}
          <section className="rounded-2xl bg-background p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Tabs
                value={codeTab}
                onValueChange={(v) => {
                  tickSound()
                  setCodeTab(v as never)
                }}
              >
                <TabsList size="sm">
                  <TabsTab value="nextjs">Next.js</TabsTab>
                  <TabsTab value="html">HTML Meta</TabsTab>
                  <TabsTab value="json">JSON Config</TabsTab>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1.5">
                {codeTab === 'json' && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleDownloadJson}
                      title="Download JSON Spec"
                      className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <IconDownload className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => jsonFileRef.current?.click()}
                      title="Upload JSON Spec"
                      className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <IconUpload className="size-3.5" />
                    </Button>
                    <input
                      ref={jsonFileRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          try {
                            const parsed = JSON.parse(String(reader.result))
                            onImportState({
                              ...DEFAULT_OG_STATE,
                              ...parsed,
                              chips: { ...DEFAULT_OG_STATE.chips, ...(parsed.chips ?? {}) },
                            })
                            confirmSound()
                          } catch (err) {
                            nudgeSound()
                            console.error(err)
                          }
                        }
                        reader.readAsText(file)
                        e.target.value = ''
                      }}
                    />
                  </>
                )}
                <CopyButton
                  content={codeTab === 'nextjs' ? nextjsCode : codeTab === 'html' ? htmlCode : jsonCode}
                  variant="ghost"
                  size="sm"
                  aria-label="Copy snippet"
                  className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => bloomSound()}
                />
              </div>
            </div>

            <DynamicCodeBlock
              code={codeTab === 'nextjs' ? nextjsCode : codeTab === 'html' ? htmlCode : jsonCode}
              lang={codeTab === 'nextjs' ? 'typescript' : codeTab === 'html' ? 'html' : 'json'}
              allowCopy={false}
              className="my-0 max-h-64 overflow-y-auto"
            />
          </section>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  )
}
