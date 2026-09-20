'use client'

import { DoodleCallout } from '@/registry/components/spaceui/doodle-callout'

const ASPECT_RATIO = 457 / 101

export interface DoodleCalloutDemoProps {
  label?: string
  width?: number
  revealGap?: number
  loopInterval?: number
}

export default function Demo({
  label = 'Most popular',
  width = 280,
  revealGap = 400,
  loopInterval = 8000,
}: DoodleCalloutDemoProps) {
  const resolvedWidth = Number(width)

  return (
    <div className="flex w-full max-w-md items-start justify-center px-6 py-16">
      <DoodleCallout
        label={label}
        width={resolvedWidth}
        height={resolvedWidth / ASPECT_RATIO}
        revealGap={Number(revealGap)}
        loopInterval={Number(loopInterval)}
      />
    </div>
  )
}
