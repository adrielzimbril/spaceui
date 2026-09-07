'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  createAvatar,
  resolveExpression,
  resolveShape,
  type SquishBackgroundStyleChoice,
  type SquishExpressionChoice,
  type SquishShapeChoice,
} from '@usespaceui/squishmoji'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { bloomSound } from '@/components/providers/sound-provider'
import { toastManager } from '@/registry/primitives/toast'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { exportRaster, exportSvgMarkup } from '@/resources/components/shared/avatar/export/raster'
import { exportToVideoAuto } from '@/resources/components/shared/avatar/export/squish-video'
import { ResourceExportModal, type ExportFormat } from '@/resources/components/shared/layout/export-modal'

export interface SquishmojiModalTarget {
  seed: string
}

export interface SquishmojiModalConfig {
  shape: SquishShapeChoice
  expression: SquishExpressionChoice
  backgroundStyle: SquishBackgroundStyleChoice
  animate: boolean
  animWobble: boolean
  animOnHover: boolean
  animOnClick: boolean
}

type ModalTab = 'jsx' | 'svg' | 'base64'

function svgDataUrl(svg: string) {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

function codeFor(seed: string, config: SquishmojiModalConfig, size: number) {
  const lines = [
    `<Squishmoji`,
    `  seed="${seed}"`,
    `  shape="${resolveShape(seed, config.shape)}"`,
    `  expression="${resolveExpression(seed, config.expression)}"`,
    `  size={${size}}`,
  ]
  if (config.backgroundStyle !== 'all') lines.push(`  backgroundStyle="${config.backgroundStyle}"`)
  if (!config.animate) lines.push('  animate={false}')
  if (config.animWobble) lines.push('  animWobble')
  if (config.animOnHover) lines.push('  animOnHover')
  if (config.animOnClick) lines.push('  animOnClick')
  lines.push('/>')
  return `import { Squishmoji } from '@usespaceui/squishmoji/react'\n\n${lines.join('\n')}`
}

export function SquishmojiCodeModal({
  target,
  config,
  onClose,
}: {
  target: SquishmojiModalTarget | null
  config: SquishmojiModalConfig
  onClose: () => void
}) {
  const [tab, setTab] = useState<ModalTab>('jsx')
  const [visible, setVisible] = useState<SquishmojiModalTarget | null>(target)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportSize, setExportSize] = useState('512')

  useEffect(() => {
    if (target) {
      setTab('jsx')
      setExportFormat('png')
      setExportSize('512')
      setVisible(target)
    }
  }, [target])

  const size = Number(exportSize)
  const seed = visible?.seed ?? ''
  const svg = useMemo(() => {
    if (!visible) return ''
    return createAvatar(visible.seed, {
      size,
      shape: config.shape,
      expression: config.expression,
      backgroundStyle: config.backgroundStyle,
    })
  }, [visible, size, config])

  const code = useMemo(() => {
    if (!visible) return ''
    if (tab === 'svg') return svg
    if (tab === 'base64') return svgDataUrl(svg)
    return codeFor(visible.seed, config, size)
  }, [visible, config, size, tab, svg])

  if (!visible) return null

  return (
    <ResourceExportModal
      open={Boolean(target)}
      onClose={onClose}
      description="Selected squishmoji"
      title={seed}
      subtitle={
        <span className="text-sm font-normal capitalize text-muted-foreground">
          / {resolveShape(seed, config.shape)} · {resolveExpression(seed, config.expression)}
        </span>
      }
      preview={
        <Squishmoji
          seed={seed}
          size={160}
          shape={config.shape}
          expression={config.expression}
          backgroundStyle={config.backgroundStyle}
          animate={config.animate}
          animWobble={config.animWobble}
          animOnHover={config.animOnHover}
          animOnClick={config.animOnClick}
        />
      }
      meta={
        <>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Shape</p>
            <p className="mt-1.5 px-1 text-sm font-medium capitalize">{resolveShape(seed, config.shape)}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Expression</p>
            <p className="mt-1.5 px-1 text-sm font-medium capitalize">{resolveExpression(seed, config.expression)}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Size</p>
            <Select value={exportSize} onValueChange={(value) => value && setExportSize(value)}>
              <SelectTrigger className="mt-1 h-7 w-full min-w-full border-none bg-muted px-2 text-sm font-medium tabular-nums shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="128">128px</SelectItem>
                <SelectItem value="256">256px</SelectItem>
                <SelectItem value="512">512px</SelectItem>
                <SelectItem value="1024">1024px</SelectItem>
                <SelectItem value="2048">2048px</SelectItem>
              </SelectPopup>
            </Select>
          </div>
        </>
      }
      tabs={[
        { id: 'jsx', label: 'JSX' },
        { id: 'svg', label: 'SVG' },
        { id: 'base64', label: 'Base64' },
      ]}
      tab={tab}
      onTabChange={(next) => setTab(next as ModalTab)}
      code={code}
      lang={tab === 'svg' ? 'xml' : tab === 'base64' ? 'plaintext' : 'tsx'}
      formats={['png', 'apng', 'webp', 'svg']}
      exportFormat={exportFormat}
      onExportFormatChange={setExportFormat}
      onDownload={() => {
        const filename = `squishmoji-${seed}`
        const label = exportFormat === 'apng' ? 'APNG' : exportFormat.toUpperCase()
        void (async () => {
          toastManager.add({ id: 'squish-export', type: 'loading', title: `Exporting ${label}…` })
          try {
            if (exportFormat === 'apng') {
              await exportToVideoAuto(
                seed,
                config.shape,
                config.expression,
                'transparent',
                filename,
                3,
                0,
                0,
                1,
                1,
                config.backgroundStyle,
                size,
                size,
                'apng',
              )
            } else if (exportFormat === 'svg') {
              await exportSvgMarkup(svg, filename)
            } else {
              await exportRaster(svg, filename, exportFormat === 'webp' ? 'webp' : 'png', size)
            }
            bloomSound()
            toastManager.add({ id: 'squish-export', type: 'success', title: `${label} saved` })
          } catch {
            toastManager.add({ id: 'squish-export', type: 'error', title: `${label} failed` })
          }
        })()
      }}
    />
  )
}
