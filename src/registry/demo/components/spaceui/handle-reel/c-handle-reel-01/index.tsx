'use client'

import * as React from 'react'
import { HandleReel } from '@/registry/components/spaceui/handle-reel'

export default function Demo() {
  return (
    <div className="flex h-full min-h-[460px] w-full items-center justify-center bg-background">
      <HandleReel
        prefix="ryna.me/"
        finalName="ryna"
        loop
        highlightColor="oklch(0.65 0.24 265)"
      />
    </div>
  )
}
