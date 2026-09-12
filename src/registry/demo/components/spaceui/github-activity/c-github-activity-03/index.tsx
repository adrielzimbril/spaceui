'use client'

import * as React from 'react'
import { GitHubActivity } from '@/registry/components/spaceui/github-activity'
import { GitHubStats } from '@/registry/blocks/stats/shared/github-stats-card'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'

export default function Demo() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center gap-6">
      {/* GitHub Activity Matrix inside Frame & Card */}
      <Frame className="w-full bg-muted squircle-4xl/80 md:squircle-6xl/80 border-0 overflow-hidden mx-auto p-4">
        <Card className="relative flex flex-col justify-between size-full px-4 py-6 md:px-6 md:py-8 squircle-2xl/60 md:squircle-4xl/60 bg-background border-0 overflow-hidden before:hidden shadow-none">
          <GitHubActivity user="adrielzimbril" shape="rounded" />
        </Card>
      </Frame>

      {/* 3 Metric Buttons at BOTTOM */}
      <GitHubStats />
    </div>
  )
}
