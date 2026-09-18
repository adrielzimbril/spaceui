'use client'

import * as React from 'react'
import { InteractiveChecklist } from '@/registry/components/spaceui/interactive-checklist'

export interface InteractiveChecklistDemoProps {
  corner?: number
}

export default function Demo({ corner = 24 }: InteractiveChecklistDemoProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
      <InteractiveChecklist corner={Number(corner)} />
    </div>
  )
}
