'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EmojiSource,
  EmojiType,
  extractEmoji,
  validEmojiFormats,
  validEmojiTypes,
  type EmojiFormat,
  type EmojiSource as EmojiSourceType,
  type EmojiType as EmojiTypeType,
} from '@usespaceui/emoji'
import { AssetEmoji } from './asset-emoji'
import { catalogFor, matchesQuery, normId } from './catalog'
import { bloomSound } from '@/components/providers/sound-provider'
import { toastManager } from '@/registry/primitives/toast'
import { ResourceInstallCluster } from '@/resources/components/shared/layout/install-cluster'
import { TOOL_OUTBOUND } from '@/resources/shared/links'
import { useResourceSidebars } from '@/resources/components/shared/layout/viewport'
import { ResourceStudio } from '@/resources/components/shared/layout/studio'
import { ResourceNav } from '@/resources/components/shared/layout/nav'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/resources/components/shared/layout/toolbar'
import { ResourceGallery } from '@/resources/components/shared/layout/gallery'
import { ResourceSeedView } from '@/resources/components/shared/layout/seed-stage'
import type { ResourceViewMode } from '@/resources/shared/types'
import { viewFromQuery, writeViewQuery } from '@/resources/shared/view'

const EMOJI_VIEWS: ResourceViewMode[] = ['gallery', 'seed']
import { EmojiControlPanel } from './control-panel'
import { DEFAULT_EMOJI, randomEmoji } from './pool'

function snippetFor(emoji: string, source: EmojiSourceType, type: EmojiTypeType, size: number, format?: EmojiFormat) {
  const lines = [`<Emoji`, `  emoji="${emoji}"`, `  source="${source}"`, `  type="${type}"`]
  if (format) lines.push(`  format="${format}"`)
  if (size !== 40) lines.push(`  size={${size}}`)
  lines.push('/>')
  return `import { Emoji } from '@usespaceui/emoji/react'\n\n${lines.join('\n')}`
}

export function EmojiPlayground({ initialView }: { initialView?: string } = {}) {
  const [source, setSource] = useState<EmojiSourceType>(EmojiSource.Fluent)
  const [type, setType] = useState<EmojiTypeType>(EmojiType.Anim)
  const [format, setFormat] = useState<EmojiFormat | undefined>(
    validEmojiFormats[EmojiSource.Fluent][EmojiType.Anim]?.[0],
  )
  const [size, setSize] = useState(164)
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI)
  const [view, setView] = useState<ResourceViewMode>(() => viewFromQuery(initialView, EMOJI_VIEWS))
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const { isDesktop, showRight, setShowRight } = useResourceSidebars()

  const active = extractEmoji(emoji) || emoji.trim() || DEFAULT_EMOJI
  const types = (validEmojiTypes[source] ?? [EmojiType.Anim]).filter((item) => item !== EmojiType.Pure)
  const activeType = types.includes(type) ? type : (types[0] as EmojiTypeType)
  const formats = validEmojiFormats[source]?.[activeType] ?? []
  const activeFormat = format && formats.includes(format) ? format : formats[0]
  const catalog = useMemo(() => catalogFor(source, activeType, activeFormat), [source, activeType, activeFormat])
  const visible = useMemo(
    () => (query.trim() ? catalog.filter((id) => matchesQuery(id, query)) : catalog),
    [catalog, query],
  )
  const code = snippetFor(active, source, activeType, size, activeFormat)
  const sourceReady = useRef(false)

  useEffect(() => {
    if (!sourceReady.current) {
      sourceReady.current = true
      return
    }
    const label = `${catalog.length} emojis`
    toastManager.add({ id: 'emoji-catalog', type: 'loading', title: `Loading ${label}…` })
    const timer = window.setTimeout(() => {
      toastManager.add({ id: 'emoji-catalog', type: 'success', title: label })
    }, 600)
    return () => window.clearTimeout(timer)
  }, [source])

  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const timer = window.setTimeout(() => {
      if (visible.length === 0) {
        toastManager.add({ id: 'emoji-search', type: 'error', title: 'No emoji found' })
        return
      }
      toastManager.add({ id: 'emoji-search', type: 'success', title: `${visible.length} matches` })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [query, visible.length])

  const reset = () => {
    setSource(EmojiSource.Fluent)
    setType(EmojiType.Anim)
    setFormat(validEmojiFormats[EmojiSource.Fluent][EmojiType.Anim]?.[0])
    setSize(164)
    setEmoji(DEFAULT_EMOJI)
    setQuery('')
    setView('gallery')
    writeViewQuery('gallery')
    setShowRight(isDesktop)
    setExpanded(false)
  }

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    info: false,
    sidebar: true,
    reset: true,
    viewToggle: true,
    view,
    views: ['gallery', 'seed'],
    onViewChange: (next) => {
      const resolved = viewFromQuery(next, EMOJI_VIEWS)
      setView(resolved)
      writeViewQuery(resolved)
    },
    onReset: reset,
    onToggleExpand: setExpanded,
    onToggleSidebar: setShowRight,
    sidebarVisible: showRight,
    expanded,
  }

  const renderEmoji = (character: string, mediaSize: number, lazy = true) => (
    <AssetEmoji
      key={`${character}-${source}-${activeType}-${activeFormat ?? 'none'}`}
      codepoint={character}
      source={source}
      type={activeType}
      format={activeFormat}
      size={mediaSize}
      lazy={lazy}
    />
  )

  const seedId = /^[0-9a-f-]+$/i.test(active.trim())
    ? active.trim().toLowerCase()
    : [...active].map((char) => char.codePointAt(0)?.toString(16)).join('-')
  const seedExists = catalog.some((id) => id === seedId || normId(id) === normId(seedId))

  return (
    <ResourceStudio
      showLeft={false}
      showRight={showRight && !expanded}
      rightWidth="20rem"
      onToggleRight={setShowRight}
      className={expanded ? 'p-0' : undefined}
      installBar={
        view !== 'seed' && !expanded ? (
          <ResourceInstallCluster packageName="@usespaceui/emoji" links={TOOL_OUTBOUND.emoji} />
        ) : null
      }
      canvas={
        view !== 'seed' ? (
          <ResourceGallery
            pool={visible}
            onSelect={(character) => {
              bloomSound()
              setEmoji(character)
              setView('seed')
              writeViewQuery('seed')
            }}
            limit={visible.length}
            keepPosition
            sidebarLeft={false}
            sidebarRight={showRight && !expanded}
            renderMedia={(character) => (
              <div className="flex size-full items-center justify-center [&_img]:size-full [&_svg]:size-full">
                {renderEmoji(character, 96)}
              </div>
            )}
            caption={(codepoint) => {
              try {
                return codepoint
                  .split('-')
                  .map((part) => String.fromCodePoint(Number.parseInt(part, 16)))
                  .join('')
              } catch {
                return codepoint
              }
            }}
          />
        ) : (
          <ResourceSeedView
            title="Emoji"
            description="Fluent, Apple, Telegram, Twemoji, Blobmoji and Noto from one API."
            findLabel="Let's find your emoji"
            seed={emoji}
            setSeed={(value) => setEmoji(extractEmoji(value) || value.slice(0, 8))}
            placeholder={DEFAULT_EMOJI}
            onRandomize={() => setEmoji(randomEmoji(catalog))}
            packageName="@usespaceui/emoji"
            code={code}
            codeTitle="Emoji.tsx"
            footnote="Source, style and format come from the package. Change them there, the playground follows."
            preview={
              seedExists ? (
                <div className="shrink-0" style={{ width: size, height: size }}>
                  {renderEmoji(active, size, false)}
                </div>
              ) : null
            }
          />
        )
      }
      float={<ResourceToolbar config={toolbarConfig} left={<ResourceNav />} />}
      right={
        <EmojiControlPanel
          emoji={active}
          source={source}
          setSource={setSource}
          type={type}
          setType={setType}
          format={format}
          setFormat={setFormat}
          size={size}
          setSize={setSize}
          regenerate={() => setEmoji(randomEmoji(visible.length ? visible : catalog))}
          view={view}
          count={query.trim() ? visible.length : catalog.length}
          query={query}
          setQuery={setQuery}
        />
      }
    />
  )
}
