'use client'

import * as React from 'react'
import { SectionLayout } from '@/registry/blocks/stats/shared/section-layout'
import { GitHubActivity, type GitHubActivityShape } from '@/registry/components/spaceui/github-activity'
import { GitHubStats } from '@/registry/blocks/stats/shared/github-stats-card'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { MOCK_GITHUB_STATS } from '@/registry/blocks/stats/shared/mock-data'
import type { ContributionData } from '@/registry/blocks/stats/shared/types'
import { cn } from '@/registry/lib/utils'

export interface StatsGitHubProps {
  stars?: number
  forks?: number
  commits?: number
  contributions?: ContributionData
  variant?: 'default' | 'compact'
  shape?: GitHubActivityShape
  repoUrl?: string
  username?: string
  ctaLabel?: string
  showCta?: boolean
  className?: string
}

export default function StatsGitHub({
  stars = MOCK_GITHUB_STATS.stars,
  forks = MOCK_GITHUB_STATS.forks,
  commits = MOCK_GITHUB_STATS.commits,
  contributions = MOCK_GITHUB_STATS.contributions,
  variant = 'default',
  shape = 'rounded',
  repoUrl = 'https://github.com/adrielzimbril',
  username = 'adrielzimbril',
  ctaLabel = 'See',
  showCta = true,
  className = '',
}: StatsGitHubProps) {
  return (
    <SectionLayout badge="Code 🛠️" isFlex className={cn('pb-0!', className)}>
      {variant === 'default' ? (
        <div className="flex flex-col items-center w-full gap-6">
          {/* Top Metric Buttons */}
          <div className="w-fit">
            <GitHubStats stars={stars} forks={forks} commits={commits} shape={shape} />
          </div>

          {/* Activity Matrix in Frame & Card Container */}
          <Frame className="h-full size-full max-w-[95%] bg-muted border-0 overflow-hidden mx-auto p-4 rounded-2xl">
            <Card className="relative flex flex-col justify-between size-full px-4 py-6 md:px-6 md:py-8 bg-background border-0 overflow-hidden before:hidden shadow-none rounded-xl">
              <GitHubActivity contributions={contributions} username={username} shape={shape} />
            </Card>
          </Frame>

          {/* Bottom Action Button */}
          {showCta && (
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Button whileTap asPointer render={<a href={repoUrl} target="_blank" rel="noopener noreferrer" />}>
                <span className="font-bold text-base">{ctaLabel}</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 w-full max-w-[95%] mx-auto items-stretch">
          <Frame className="h-full size-full bg-muted border-0 overflow-hidden p-4 rounded-2xl lg:col-span-10">
            <Card className="relative flex flex-col justify-between size-full px-4 py-6 md:px-6 md:py-8 bg-background border-0 overflow-hidden before:hidden shadow-none rounded-xl">
              <GitHubActivity contributions={contributions} username={username} shape={shape} />
            </Card>
          </Frame>

          <div className="grid grid-cols-1 md:grid-cols-3 md:h-full w-full lg:flex flex-col gap-2 lg:col-span-2">
            <GitHubStats stars={stars} forks={forks} commits={commits} shape={shape} />
          </div>

          {showCta && (
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 lg:col-span-12 justify-center">
              <Button whileTap asPointer render={<a href={repoUrl} target="_blank" rel="noopener noreferrer" />}>
                <span className="font-bold text-base">{ctaLabel}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </SectionLayout>
  )
}
