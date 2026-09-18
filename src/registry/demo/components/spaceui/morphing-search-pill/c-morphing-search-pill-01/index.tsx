'use client'

import * as React from 'react'
import { MorphingSearchPill } from '@/registry/components/spaceui/morphing-search-pill'

export interface MorphingSearchDemoProps {
  collapsedWidth?: number
  expandedWidth?: number
  corner?: number
}

export default function Demo({ collapsedWidth = 64, expandedWidth = 280, corner = 20 }: MorphingSearchDemoProps) {
  const [query, setQuery] = React.useState('')

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4">
      <MorphingSearchPill
        collapsedWidth={Number(collapsedWidth)}
        expandedWidth={Number(expandedWidth)}
        corner={Number(corner)}
        onSearch={setQuery}
      />
      {query && <span className="text-xs font-medium text-muted-foreground">Query: &quot;{query}&quot;</span>}
    </div>
  )
}
