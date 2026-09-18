'use client'

import * as React from 'react'
import { SlideToConfirm } from '@/registry/components/spaceui/slide-to-confirm'

export interface SlideToConfirmDemoProps {
  speed?: number
  width?: number
  corner?: number
}

export default function Demo({ speed = 50, width = 320, corner = 28 }: SlideToConfirmDemoProps) {
  const [status, setStatus] = React.useState('Awaiting action...')

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4">
      <SlideToConfirm
        speed={Number(speed)}
        width={Number(width)}
        corner={Number(corner)}
        onConfirm={() => setStatus('Action verified & executed!')}
      />
      <span className="text-xs font-medium text-muted-foreground">{status}</span>
    </div>
  )
}
