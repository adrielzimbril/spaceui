'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/registry/primitives/button'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { useResourceDesktop } from '@/tools/components/shared/layout/viewport'
import { cn } from '@/registry/lib/utils'

const GAP = 16
const PAD = 6
const PAGE_ROWS = 4
const BOTTOM_CLEAR = 112

function useGalleryColumns(sidebarLeft: boolean, sidebarRight: boolean) {
  const md = useResourceDesktop()
  const xl = useMediaQuery('(min-width: 1280px)', false)
  const xxl = useMediaQuery('(min-width: 1536px)', false)
  const extra = Number(sidebarLeft) + Number(sidebarRight)
  if (!md) return 2
  if (!xl) return 5
  if (extra === 0) return xxl ? 8 : 7
  if (extra === 1) return xxl ? 7 : 6
  return xxl ? 6 : 5
}

function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false)
}

export function ResourceGallery({
  pool,
  onSelect,
  renderMedia,
  caption,
  sidebarLeft = false,
  sidebarRight = false,
  limit = 293,
  loop = false,
  mediaClassName,
  keepPosition = false,
}: {
  pool: string[]
  onSelect: (seed: string, index: number) => void
  renderMedia: (seed: string, index: number) => ReactNode
  caption?: (seed: string, index: number) => string
  sidebarLeft?: boolean
  sidebarRight?: boolean
  limit?: number
  loop?: boolean
  mediaClassName?: string
  keepPosition?: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const columns = useGalleryColumns(sidebarLeft, sidebarRight)
  const reduced = usePrefersReducedMotion()
  const [width, setWidth] = useState(0)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  const pageSize = columns * PAGE_ROWS
  const [shown, setShown] = useState(pageSize)
  const [enteredFrom, setEnteredFrom] = useState(0)
  const shownRef = useRef(shown)
  shownRef.current = shown

  const expandedPool = useMemo(() => {
    if (loop) return pool
    return limit < pool.length ? pool.slice(0, limit) : pool
  }, [pool, limit, loop])

  useEffect(() => {
    if (keepPosition) {
      setShown((current) => Math.max(pageSize, current))
      setEnteredFrom(Number.POSITIVE_INFINITY)
      const top = scrollEl?.scrollTop ?? 0
      requestAnimationFrame(() => scrollEl?.scrollTo({ top }))
      return
    }
    setShown(pageSize)
    setEnteredFrom(0)
  }, [pool, pageSize, keepPosition, scrollEl])

  const total = loop ? shown : Math.min(shown, expandedPool.length)
  const seedAt = (index: number) => expandedPool[loop ? index % Math.max(expandedPool.length, 1) : index] ?? ''
  const hasMore = loop ? expandedPool.length > 0 : shown < expandedPool.length
  const getScrollElement = useCallback(() => scrollEl, [scrollEl])

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const bind = () => {
      const node = host.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null
      setScrollEl((prev) => (prev === node ? prev : node))
      if (node) setWidth(node.clientWidth)
    }

    bind()
    const observer = new ResizeObserver(bind)
    observer.observe(host)
    return () => observer.disconnect()
  }, [columns])

  const cell = Math.max(96, (width - PAD * 2 - GAP * (columns - 1)) / Math.max(columns, 1))
  const rowSize = cell + GAP
  const rowCount = Math.max(1, Math.ceil(total / columns))
  const rowSizeRef = useRef(rowSize)
  rowSizeRef.current = rowSize

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize: () => rowSizeRef.current,
    overscan: 8,
    paddingEnd: BOTTOM_CLEAR,
  })

  useEffect(() => {
    virtualizer.measure()
  }, [cell, columns, rowCount, virtualizer])

  const lastVirtualIndex = virtualizer.getVirtualItems().at(-1)?.index ?? -1

  useEffect(() => {
    if (!hasMore || lastVirtualIndex < 0 || lastVirtualIndex < rowCount - 1) return
    const current = shownRef.current
    const next = loop ? current + pageSize : Math.min(current + pageSize, expandedPool.length)
    if (next === current) return
    setEnteredFrom(current)
    setShown(next)
  }, [lastVirtualIndex, rowCount, hasMore, loop, pageSize, expandedPool.length])

  return (
    <div ref={hostRef} className="h-full min-h-0 w-full">
      <style>{`@keyframes resource-gallery-in{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}`}</style>
      <ScrollArea className="h-full w-full md:p-1" data-lenis-prevent="true" scrollFade showScrollbar={false}>
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() || rowCount * rowSize + BOTTOM_CLEAR }}
        >
          {virtualizer.getVirtualItems().map((row) => {
            const start = row.index * columns
            return (
              <div
                key={row.key}
                className="absolute top-0 left-0 grid w-full"
                style={{
                  height: row.size,
                  transform: `translate3d(0, ${row.start}px, 0)`,
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: GAP,
                  paddingLeft: PAD,
                  paddingRight: PAD,
                }}
              >
                {Array.from({ length: Math.min(columns, total - start) }, (_, offset) => {
                  const index = start + offset
                  const seed = seedAt(index)
                  const entering = !reduced && index >= enteredFrom
                  const delay = Math.min((index - enteredFrom) * 45, 360)
                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      key={`${seed}-${index}`}
                      onClick={() => onSelect(seed, index)}
                      className="group relative flex aspect-square h-auto! w-full cursor-pointer select-none flex-col justify-between overflow-hidden rounded-[1.25rem] bg-muted p-4 text-start hover:bg-muted [&_svg]:size-full!"
                      style={
                        entering
                          ? {
                              animation: `resource-gallery-in 420ms cubic-bezier(0.2, 0, 0, 1) ${delay}ms both`,
                            }
                          : undefined
                      }
                    >
                      <span className="absolute top-4 right-4 max-w-[70%] truncate text-[0.625rem] text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {seed}
                      </span>
                      <div
                        className={cn(
                          'pointer-events-none absolute inset-9 flex items-center justify-center self-center sm:inset-10',
                          mediaClassName,
                        )}
                      >
                        {renderMedia(seed, index)}
                      </div>
                      {caption ? (
                        <span className="absolute inset-x-4 bottom-4 truncate text-[0.625rem] font-medium capitalize text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                          {caption(seed, index)}
                        </span>
                      ) : null}
                    </Button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
