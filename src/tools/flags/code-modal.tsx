'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconExternalLink } from '@tabler/icons-react'
import { AssetFlag } from './asset-flag'
import { getFlagMetadata } from './catalog'
import { resolveFlagUrl, snippetFor } from './cdn'
import type { FlagMode, FlagShape } from './types'
import { bloomSound } from '@/components/providers/sound-provider'
import { Button } from '@/registry/primitives/button'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { ResourceExportModal, type ExportFormat } from '@/tools/components/shared/layout/export-modal'

type FlagModalTab = 'jsx' | 'html' | 'url' | 'svg'

const SHAPE_NAMES: Record<FlagShape, string> = {
  circle: 'Circle',
  square: 'Square',
  '4x3': 'Rect (4:3)',
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function rasterizeSvgUrl(url: string, format: 'png' | 'webp', size: number, isRect = false) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Flag SVG could not be rendered'))
    image.src = url
  })
  const canvas = document.createElement('canvas')
  const width = isRect ? Math.round((size * 4) / 3) : size
  const height = size
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  context.drawImage(image, 0, 0, width, height)
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image could not be encoded'))),
      `image/${format}`,
      1,
    )
  })
}

export function FlagCodeModal({
  open,
  onClose,
  code,
  shape,
  mode,
  onShapeChange,
}: {
  open: boolean
  onClose: () => void
  code: string | null
  shape: FlagShape
  mode: FlagMode
  onShapeChange?: (shape: FlagShape) => void
}) {
  const [tab, setTab] = useState<FlagModalTab>('jsx')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('svg')
  const [exportSize, setExportSize] = useState('512')
  const [currentShape, setCurrentShape] = useState<FlagShape>(shape)
  const [svgContent, setSvgContent] = useState<string>('')

  // Sync shape with prop
  useEffect(() => {
    setCurrentShape(shape)
  }, [shape])

  // Reset tab and format on new target
  useEffect(() => {
    if (code) {
      setTab('jsx')
      setExportFormat('svg')
    }
  }, [code])

  const actualSize = Number(exportSize)
  const activeCode = code ?? (mode === 'country' ? 'ci' : 'zh')
  const meta = useMemo(() => getFlagMetadata(activeCode, mode), [activeCode, mode])
  const resolvedShape: FlagShape = mode === 'language' && currentShape === '4x3' ? 'circle' : currentShape
  const flagUrl = useMemo(() => resolveFlagUrl(activeCode, resolvedShape, mode), [activeCode, resolvedShape, mode])

  // Fetch SVG text via same-origin API endpoint (supports offline, local reading, no CORS issues)
  useEffect(() => {
    if (!code) return
    let active = true
    const apiUrl = `/api/tools/flags?code=${encodeURIComponent(activeCode)}&shape=${encodeURIComponent(resolvedShape)}&mode=${encodeURIComponent(mode)}`
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch SVG')
        return res.text()
      })
      .then((text) => {
        if (active) setSvgContent(text)
      })
      .catch(() => {
        if (active) setSvgContent('')
      })
    return () => {
      active = false
    }
  }, [code, activeCode, resolvedShape, mode])

  const snippets = useMemo(
    () => snippetFor(activeCode, resolvedShape, mode, actualSize, meta.name),
    [activeCode, resolvedShape, mode, actualSize, meta.name],
  )

  const codeString = useMemo(() => {
    if (tab === 'html') return snippets.html
    if (tab === 'url') return snippets.url
    if (tab === 'svg') return svgContent || `<!-- Loading SVG for ${activeCode}... -->`
    return snippets.react
  }, [tab, snippets, svgContent, activeCode])

  if (!code) return null

  return (
    <ResourceExportModal
      open={open}
      onClose={onClose}
      description={mode === 'country' ? 'Selected Country Flag' : 'Selected Language Flag'}
      title={meta.name}
      subtitle={
        <span className="text-sm font-normal text-muted-foreground">
          {meta.emoji ? `${meta.emoji} ` : ''}/ {meta.code.toUpperCase()}
          {meta.dialCode ? ` · ${meta.dialCode}` : ''}
          {meta.nativeName ? ` · ${meta.nativeName}` : ''}
        </span>
      }
      preview={
        <div className="flex items-center justify-center">
          <AssetFlag
            code={activeCode}
            shape={resolvedShape}
            mode={mode}
            size={resolvedShape === '4x3' ? 140 : 160}
            lazy={false}
            className="shadow-md transition-all"
          />
        </div>
      }
      meta={
        <>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">
              {mode === 'country' ? 'ISO Code' : 'Language Code'}
            </p>
            <p className="mt-1.5 px-1 text-sm font-medium uppercase font-mono">{meta.code}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Shape</p>
            <Select
              value={resolvedShape}
              onValueChange={(val) => {
                if (!val) return
                const next = val as FlagShape
                setCurrentShape(next)
                onShapeChange?.(next)
              }}
            >
              <SelectTrigger className="mt-1 h-7 w-full min-w-full border-none bg-muted px-2 text-sm font-medium shadow-none">
                <SelectValue placeholder={SHAPE_NAMES[resolvedShape]}>{SHAPE_NAMES[resolvedShape]}</SelectValue>
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="circle" label="Circle">
                  Circle
                </SelectItem>
                <SelectItem value="square" label="Square">
                  Square
                </SelectItem>
                {mode === 'country' && (
                  <SelectItem value="4x3" label="Rect (4:3)">
                    Rect (4:3)
                  </SelectItem>
                )}
              </SelectPopup>
            </Select>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Size</p>
            <Select value={exportSize} onValueChange={(val) => val && setExportSize(val)}>
              <SelectTrigger className="mt-1 h-7 w-full min-w-full border-none bg-muted px-2 text-sm font-medium tabular-nums shadow-none">
                <SelectValue placeholder={`${exportSize}px`}>{`${exportSize}px`}</SelectValue>
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="64" label="64px">
                  64px
                </SelectItem>
                <SelectItem value="128" label="128px">
                  128px
                </SelectItem>
                <SelectItem value="256" label="256px">
                  256px
                </SelectItem>
                <SelectItem value="512" label="512px">
                  512px
                </SelectItem>
                <SelectItem value="1024" label="1024px">
                  1024px
                </SelectItem>
              </SelectPopup>
            </Select>
          </div>
        </>
      }
      tabs={[
        { id: 'jsx', label: 'React' },
        { id: 'html', label: 'HTML' },
        { id: 'url', label: 'URL' },
        { id: 'svg', label: 'SVG' },
      ]}
      tab={tab}
      onTabChange={(next) => setTab(next as FlagModalTab)}
      code={codeString}
      lang={tab === 'url' ? 'bash' : tab === 'svg' ? 'xml' : tab === 'html' ? 'html' : 'tsx'}
      extraTabAction={
        tab === 'url' ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open CDN URL"
            render={<a href={flagUrl} target="_blank" rel="noreferrer" />}
            className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconExternalLink className="size-4" />
          </Button>
        ) : null
      }
      exportFormat={exportFormat}
      onExportFormatChange={setExportFormat}
      formats={['svg', 'png', 'webp']}
      onDownload={() => {
        void (async () => {
          try {
            const filename = `flag-${activeCode}-${resolvedShape}.${exportFormat}`
            if (exportFormat === 'svg') {
              if (svgContent) {
                downloadBlob(new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' }), filename)
              } else {
                const res = await fetch(
                  `/api/tools/flags?code=${encodeURIComponent(activeCode)}&shape=${encodeURIComponent(resolvedShape)}&mode=${encodeURIComponent(mode)}`,
                )
                const text = await res.text()
                downloadBlob(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }), filename)
              }
            } else if (exportFormat === 'png' || exportFormat === 'webp') {
              const isRect = resolvedShape === '4x3'
              const imgSrc = svgContent ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}` : flagUrl
              const blob = await rasterizeSvgUrl(imgSrc, exportFormat, actualSize, isRect)
              downloadBlob(blob, filename)
            }
            bloomSound()
          } catch {
            /* ignore rasterize errors */
          }
        })()
      }}
    />
  )
}
