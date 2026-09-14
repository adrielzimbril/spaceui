'use client'

import React from 'react'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { DocsTableOfContents, type DocDependency } from '@/components/docs/layout/toc'
import { cn } from '@/registry/lib/utils'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'

export interface DocsTocSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toc?: any
  dependencies?: DocDependency[]
  hasRelated?: boolean
  className?: string
}

export function DocsTocSidebar({ toc, dependencies, hasRelated = false, className }: DocsTocSidebarProps) {
  const { isSplit } = useLayoutMode()

  if (isSplit) {
    return null
  }

  return (
    <div
      className={cn(
        'sticky top-20 z-30 ml-auto hidden h-[calc(100svh-5rem)] w-64 flex-col gap-4 overflow-hidden overscroll-none pb-8 [html[data-layout-mode=split]_&]:hidden! [html[data-layout-mode=canvas]_&]:hidden! xl:flex',
        className,
      )}
    >
      <div className="h-6 shrink-0" />
      <ScrollArea scrollFade scrollbarGutter className="w-full px-6">
        <DocsTableOfContents toc={toc} dependencies={dependencies} hasRelated={hasRelated} />
        <div className="h-12" />
      </ScrollArea>
    </div>
  )
}
