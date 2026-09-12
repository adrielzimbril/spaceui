'use client'

import * as React from 'react'
import {
  BuildingLoader,
  type BuildingLoaderProps,
  type LoaderPattern,
} from '@/registry/components/orb/loading'

const STATE_DETAILS: Record<string, { detail: string; pattern: LoaderPattern }> = {
  Building: { detail: 'Composing response from context', pattern: 'diamond' },
  Thinking: { detail: 'Synthesizing reasoning graph', pattern: 'bands' },
  Searching: { detail: 'Scanning semantic vector index', pattern: 'scatter' },
  Generating: { detail: 'Streaming token generation pipeline', pattern: 'glyph' },
  Connecting: { detail: 'Establishing agent mesh network', pattern: 'corners' },
}

export interface BuildingLoaderDemoProps extends BuildingLoaderProps {
  state?: string
  detail?: string
  showShimmer?: boolean
  color?: string
}

export default function Demo({
  state = 'Building',
  detail,
  showShimmer = true,
  color = 'text-foreground',
}: BuildingLoaderDemoProps) {
  const currentConfig = STATE_DETAILS[state] ?? STATE_DETAILS.Building
  const effectiveDetail = detail || currentConfig.detail

  return (
    <div className="flex size-full min-h-[260px] flex-col items-center justify-center p-6">
      <BuildingLoader
        state={state}
        detail={effectiveDetail}
        pattern={currentConfig.pattern}
        showShimmer={showShimmer}
        className={color}
      />
    </div>
  )
}
