'use client'

import * as React from 'react'
import {
  BuildingLoader,
  type BuildingLoaderProps,
} from '@/registry/components/orb/loading'

export interface BuildingLoaderDemoProps extends BuildingLoaderProps {
  state?: string
  detail?: string
  showShimmer?: boolean
  color?: string
}

export default function Demo({
  state = 'Building',
  detail = 'Composing response from context',
  showShimmer = true,
  color = 'text-foreground',
}: BuildingLoaderDemoProps) {
  return (
    <div className="flex size-full min-h-[260px] flex-col items-center justify-center p-6">
      <BuildingLoader
        state={state}
        detail={detail}
        showShimmer={showShimmer}
        className={color}
      />
    </div>
  )
}
