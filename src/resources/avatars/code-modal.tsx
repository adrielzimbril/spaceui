'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconExternalLink } from '@tabler/icons-react'
import { createAvatar, type AvatarEffect, type AvatarVariant } from '@usespaceui/avatars'
import { Avatar } from '@usespaceui/avatars/react'
import { bloomSound } from '@/components/providers/sound-provider'
import { Button } from '@/registry/primitives/button'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { ResourceExportModal, type ExportFormat } from '@/resources/components/shared/layout/export-modal'

const AVATAR_API_BASE_URL = 'https://avatars.spaceui.one'

export interface AvatarModalTarget {
  seed: string
  variant: AvatarVariant | 'all'
  colors?: string[]
}

export interface AvatarModalConfig {
  size: number
  circle: boolean
  effect: AvatarEffect
  animate: boolean
}

type ModalTab = 'jsx' | 'rest' | 'svg' | 'base64'

function svgDataUrl(svg: string) {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

async function rasterizeSvg(svg: string, format: 'png' | 'webp', size: number) {
  const source = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Avatar SVG could not be rendered'))
      image.src = source
    })
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable')
    context.drawImage(image, 0, 0, size, size)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Avatar image could not be encoded'))),
        `image/${format}`,
        1,
      )
    })
  } finally {
    URL.revokeObjectURL(source)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function codeFor(target: AvatarModalTarget, config: AvatarModalConfig) {
  const lines = [`<Avatar`, `  name="${target.seed}"`, `  variant="${target.variant}"`, `  size={${config.size}}`]
  if (target.colors?.length) lines.push(`  colors={[${target.colors.map((color) => `"${color}"`).join(', ')}]}`)
  if (config.animate) lines.push('  animate')
  if (config.effect !== 'none') lines.push(`  effect="${config.effect}"`)
  if (config.circle) lines.push('  circle')
  lines.push('/>')
  return `import { Avatar } from '@usespaceui/avatars/react';\n\n${lines.join('\n')}`
}

function restFor(target: AvatarModalTarget, config: AvatarModalConfig) {
  const params = [
    config.size !== 128 ? `size=${config.size}` : '',
    config.circle ? 'circle=true' : '',
    config.effect !== 'none' ? `effect=${config.effect}` : '',
    config.animate ? 'animate=true' : '',
    target.colors?.length ? `colors=${target.colors.map((color) => color.replace(/^#/, '')).join(',')}` : '',
  ].filter(Boolean)
  return `${AVATAR_API_BASE_URL}/v1/${target.variant}/${encodeURIComponent(target.seed)}.svg${params.length ? `?${params.join('&')}` : ''}`
}

export function AvatarCodeModal({
  target,
  config,
  onClose,
  open = true,
}: {
  target: AvatarModalTarget | null
  config: AvatarModalConfig
  onClose: () => void
  open?: boolean
}) {
  const [tab, setTab] = useState<ModalTab>('jsx')
  const [visibleTarget, setVisibleTarget] = useState<AvatarModalTarget | null>(target)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportSize, setExportSize] = useState('512')
  const [exportCircle, setExportCircle] = useState(config.circle)

  useEffect(() => {
    if (target) {
      setTab('jsx')
      setExportFormat('png')
      setExportSize('512')
      setExportCircle(config.circle)
      setVisibleTarget(target)
    }
  }, [target, config.circle])

  const actualExportSize = Number(exportSize)
  const isOpen = open && Boolean(target)

  const svg = useMemo(() => {
    if (!visibleTarget) return ''
    return createAvatar({
      name: visibleTarget.seed,
      variant: visibleTarget.variant,
      size: actualExportSize,
      colors: visibleTarget.colors,
      circle: exportCircle,
      effect: config.effect,
      animate: config.animate,
    })
  }, [config.animate, exportCircle, config.effect, actualExportSize, visibleTarget])

  const exportConfig = { ...config, size: actualExportSize, circle: exportCircle }
  const code = useMemo(() => {
    if (!visibleTarget) return ''
    if (tab === 'svg') return svg
    if (tab === 'base64') return svgDataUrl(svg)
    return tab === 'jsx' ? codeFor(visibleTarget, exportConfig) : restFor(visibleTarget, exportConfig)
  }, [visibleTarget, exportConfig, tab, svg])

  if (!visibleTarget) return null

  const restUrl = restFor(visibleTarget, exportConfig)

  return (
    <ResourceExportModal
      open={isOpen}
      onClose={onClose}
      description="Selected avatar"
      title={visibleTarget.seed}
      subtitle={<span className="text-sm font-normal text-muted-foreground">/ {visibleTarget.variant}</span>}
      preview={
        <Avatar
          name={visibleTarget.seed}
          size={160}
          variant={visibleTarget.variant}
          colors={visibleTarget.colors}
          animate={config.animate}
          effect={config.effect}
          circle={exportCircle}
        />
      }
      meta={
        <>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Variant</p>
            <p className="mt-1.5 px-1 text-sm font-medium capitalize">{visibleTarget.variant.replace(/-/g, ' ')}</p>
          </div>
          <div className="rounded-2xl bg-background p-3">
            <p className="px-1 text-[0.625rem] uppercase tracking-tight text-muted-foreground">Shape</p>
            <Select
              value={exportCircle ? 'circle' : 'square'}
              onValueChange={(value) => value && setExportCircle(value === 'circle')}
            >
              <SelectTrigger className="mt-1 h-7 w-full min-w-full border-none bg-muted px-2 text-sm font-medium shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectPopup>
            </Select>
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
                <SelectItem value="4096">4096px</SelectItem>
              </SelectPopup>
            </Select>
          </div>
        </>
      }
      tabs={[
        { id: 'jsx', label: 'JSX' },
        { id: 'rest', label: 'REST' },
        { id: 'svg', label: 'SVG' },
        { id: 'base64', label: 'Base64' },
      ]}
      tab={tab}
      onTabChange={(next) => setTab(next as ModalTab)}
      code={code}
      lang={tab === 'rest' ? 'bash' : tab === 'svg' ? 'xml' : tab === 'base64' ? 'plaintext' : 'tsx'}
      extraTabAction={
        tab === 'rest' ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open REST API URL"
            render={<a href={restUrl} target="_blank" rel="noreferrer" />}
            className="size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconExternalLink className="size-4" />
          </Button>
        ) : null
      }
      exportFormat={exportFormat}
      onExportFormatChange={setExportFormat}
      onDownload={() => {
        void (async () => {
          try {
            const filename = `space-avatar-${visibleTarget.seed}.${exportFormat}`
            const downloadSvg = createAvatar({
              name: visibleTarget.seed,
              variant: visibleTarget.variant,
              size: actualExportSize,
              colors: visibleTarget.colors,
              circle: exportCircle,
              effect: config.effect,
              animate: config.animate,
            })
            if (exportFormat === 'svg') {
              downloadBlob(new Blob([downloadSvg], { type: 'image/svg+xml;charset=utf-8' }), filename)
            } else {
              downloadBlob(await rasterizeSvg(downloadSvg, exportFormat, actualExportSize), filename)
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
