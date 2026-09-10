'use client'

import { IconRefresh } from '@tabler/icons-react'
import { AssetFlag } from './asset-flag'
import type { FlagMetadata, FlagMode, FlagShape } from './types'
import { bloomSound } from '@/components/providers/sound-provider'
import { Badge } from '@/registry/primitives/badge'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/registry/primitives/tabs'

export function FlagControlPanel({
  meta,
  mode,
  setMode,
  shape,
  setShape,
  regenerate,
  count = 0,
  query,
  setQuery,
  onOpenModal,
}: {
  meta: FlagMetadata
  mode: FlagMode
  setMode: (mode: FlagMode) => void
  shape: FlagShape
  setShape: (shape: FlagShape) => void
  regenerate: () => void
  count?: number
  query: string
  setQuery: (query: string) => void
  onOpenModal: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Title Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Country & Language Flags</h2>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          {/* Active Item Card */}
          <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                bloomSound()
                onOpenModal()
              }}
              title="Click to inspect code"
              className="grid size-12 shrink-0 place-items-center place-content-center overflow-hidden rounded-[0.625rem] bg-background! p-0 border-0 transition-all cursor-pointer"
            >
              <AssetFlag code={meta.code} shape={shape} mode={mode} size={36} lazy={false} alt={meta.name} />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold">{meta.name}</p>
                {meta.emoji && <span className="text-xs shrink-0">{meta.emoji}</span>}
              </div>
              <p className="truncate text-[0.625rem] text-muted-foreground">
                <span className="font-mono uppercase font-semibold">{meta.code}</span>
                {meta.dialCode ? ` · ${meta.dialCode}` : ''}
                {meta.nativeName ? ` · ${meta.nativeName}` : ''}
                {meta.nameFr && meta.nameFr !== meta.name ? ` · ${meta.nameFr}` : ''}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Randomize flag"
              className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
              onClick={() => {
                bloomSound()
                regenerate()
              }}
            >
              <IconRefresh className="size-3.5" />
            </Button>
          </div>

          {/* Search Filter */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Search</span>
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setQuery('')}
                  className="h-auto p-0 text-[0.625rem] text-muted-foreground hover:text-foreground cursor-pointer font-normal shadow-none bg-transparent hover:bg-transparent"
                >
                  Clear
                </Button>
              )}
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                mode === 'country'
                  ? "Côte d'Ivoire, ci, +225, 🇨🇮, China, cn, 🇨🇳..."
                  : 'Chinese, zh, cn, 中文, Spanish, English...'
              }
              aria-label="Search flags"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-semibold text-muted-foreground">Collection</span>
            <Tabs
              value={mode}
              onValueChange={(val) => {
                if (!val) return
                const nextMode = val as FlagMode
                bloomSound()
                setMode(nextMode)
                if (nextMode === 'language' && shape === '4x3') {
                  setShape('circle')
                }
              }}
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="country" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>Flags</span>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">429</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="language" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>Languages</span>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">201</span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Shape Switcher */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold text-muted-foreground">Shape</span>
            </div>
            <Tabs
              value={shape}
              onValueChange={(val) => {
                if (!val) return
                bloomSound()
                setShape(val as FlagShape)
              }}
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="circle" className="text-xs">
                  Circle
                </TabsTrigger>
                <TabsTrigger value="square" className="text-xs">
                  Square
                </TabsTrigger>
                <TabsTrigger value="4x3" disabled={mode === 'language'} className="text-xs">
                  Rect (4:3)
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {mode === 'language' && (
              <p className="text-[0.625rem] text-muted-foreground leading-tight">
                Language flags are optimized in Circle (1:1) and Square (1:1).
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
