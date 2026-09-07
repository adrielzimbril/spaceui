'use client'

import { IconRefresh } from '@tabler/icons-react'
import {
  EMOJI_PROVIDERS_META,
  EmojiSource,
  EmojiType,
  getEmojiDefaultType,
  validEmojiFormats,
  validEmojiTypes,
  type EmojiFormat as EmojiFormatType,
  type EmojiSource as EmojiSourceType,
  type EmojiType as EmojiTypeType,
} from '@usespaceui/emoji'
import { AssetEmoji } from './asset-emoji'
import { assetId } from './catalog'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/primitives/select'
import { Slider } from '@/registry/primitives/slider'
import type { ResourceViewMode } from '@/resources/shared/types'
import { DEFAULT_EMOJI } from './pool'

const SOURCES = Object.values(EmojiSource)

function toLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

function displayEmoji(value: string) {
  const hex = value.trim()
  if (!/^[0-9a-f]{4,6}(-[0-9a-f]{4,6})*$/i.test(hex)) return value || DEFAULT_EMOJI
  try {
    return hex
      .split('-')
      .map((part) => String.fromCodePoint(Number.parseInt(part, 16)))
      .join('')
  } catch {
    return value
  }
}

function stylesFor(source: EmojiSourceType) {
  return (validEmojiTypes[source] ?? [getEmojiDefaultType(source)]).filter((item) => item !== EmojiType.Pure)
}

function OptionPreview({
  codepoint,
  source,
  type,
  format,
}: {
  codepoint: string
  source: EmojiSourceType
  type: EmojiTypeType
  format?: EmojiFormatType
}) {
  const id = assetId(source, type, format, codepoint)
  return (
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-muted [&_img]:size-full">
      {id ? <AssetEmoji codepoint={id} source={source} type={type} format={format} size={24} lazy={false} /> : null}
    </span>
  )
}

export function EmojiControlPanel({
  emoji,
  source,
  setSource,
  type,
  setType,
  format,
  setFormat,
  size,
  setSize,
  regenerate,
  view,
  count = 0,
  query,
  setQuery,
}: {
  emoji: string
  source: EmojiSourceType
  setSource: (value: EmojiSourceType) => void
  type: EmojiTypeType
  setType: (value: EmojiTypeType) => void
  format?: EmojiFormatType
  setFormat: (value: EmojiFormatType | undefined) => void
  size: number
  setSize: (value: number) => void
  regenerate: () => void
  view: ResourceViewMode
  count?: number
  query: string
  setQuery: (value: string) => void
}) {
  const types = stylesFor(source)
  const activeType = types.includes(type) ? type : (types[0] as EmojiTypeType)
  const formats = validEmojiFormats[source]?.[activeType] ?? []
  const activeFormat = format && formats.includes(format) ? format : formats[0]
  const meta = EMOJI_PROVIDERS_META[source]
  const codepoint = emoji || DEFAULT_EMOJI
  const glyph = displayEmoji(codepoint)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Emoji</h2>
          <span className="text-[0.625rem] text-muted-foreground">{view === 'seed' ? 'Seed' : 'Gallery'}</span>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-background [&_img]:size-full">
              {assetId(source, activeType, activeFormat, codepoint) ? (
                <AssetEmoji
                  codepoint={assetId(source, activeType, activeFormat, codepoint)!}
                  source={source}
                  type={activeType}
                  format={activeFormat}
                  size={40}
                  lazy={false}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{glyph}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                {meta.name} · {toLabel(activeType)}
                {count ? ` · ${count}` : ''}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Randomize emoji"
              className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
              onClick={regenerate}
            >
              <IconRefresh className="size-3.5" />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Search</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="🔥, love, 1f496, exploding-head"
              aria-label="Search emoji"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Source</span>
            <Select
              value={source}
              onValueChange={(value) => {
                if (!value) return
                const next = value as EmojiSourceType
                setSource(next)
                const nextType = (stylesFor(next)[0] ?? getEmojiDefaultType(next)) as EmojiTypeType
                setType(nextType)
                setFormat(validEmojiFormats[next]?.[nextType]?.[0])
              }}
            >
              <SelectTrigger aria-label="Source" className="h-10 border-0 bg-muted px-2.5 text-xs">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <OptionPreview codepoint={codepoint} source={source} type={activeType} format={activeFormat} />
                    <span className="truncate">{meta.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((item) => {
                  const itemType = (stylesFor(item)[0] ?? getEmojiDefaultType(item)) as EmojiTypeType
                  const itemFormat = validEmojiFormats[item]?.[itemType]?.[0]
                  return (
                    <SelectItem key={item} value={item} label={EMOJI_PROVIDERS_META[item].name}>
                      <span className="flex items-center gap-2">
                        <OptionPreview codepoint={codepoint} source={item} type={itemType} format={itemFormat} />
                        {EMOJI_PROVIDERS_META[item].name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Style</span>
            <Select
              value={activeType}
              onValueChange={(value) => {
                if (!value) return
                const next = value as EmojiTypeType
                setType(next)
                setFormat(validEmojiFormats[source]?.[next]?.[0])
              }}
            >
              <SelectTrigger aria-label="Style" className="h-10 border-0 bg-muted px-2.5 text-xs">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <OptionPreview codepoint={codepoint} source={source} type={activeType} format={activeFormat} />
                    <span className="truncate">{toLabel(activeType)}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {types.map((item) => {
                  const itemFormat = validEmojiFormats[source]?.[item]?.[0]
                  return (
                    <SelectItem key={item} value={item} label={toLabel(item)}>
                      <span className="flex items-center gap-2">
                        <OptionPreview codepoint={codepoint} source={source} type={item} format={itemFormat} />
                        {toLabel(item)}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {formats.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                Format{count ? ` · ${count}` : ''}
              </span>
              <Select value={activeFormat} onValueChange={(value) => value && setFormat(value as EmojiFormatType)}>
                <SelectTrigger aria-label="Format" className="h-10 border-0 bg-muted px-2.5 text-xs">
                  <SelectValue>
                    <span className="flex min-w-0 items-center gap-2">
                      <OptionPreview codepoint={codepoint} source={source} type={activeType} format={activeFormat} />
                      <span className="truncate">{activeFormat?.toUpperCase()}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {formats.map((item) => (
                    <SelectItem key={item} value={item} label={item.toUpperCase()}>
                      <span className="flex items-center gap-2">
                        <OptionPreview codepoint={codepoint} source={source} type={activeType} format={item} />
                        {item.toUpperCase()}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {view === 'seed' ? (
            <div className="flex flex-col gap-2">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Size · {size}px</span>
              <Slider
                value={[size]}
                min={32}
                max={256}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value
                  if (typeof next === 'number') setSize(next)
                }}
              />
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
