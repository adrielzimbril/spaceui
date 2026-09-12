'use client'

import * as React from 'react'
import { SectionLayout } from '@/registry/blocks/stats/shared/section-layout'
import { LighthouseScoreCard } from '@/registry/blocks/stats/shared/lighthouse-score-card'
import { MOCK_LIGHTHOUSE_SCORES } from '@/registry/blocks/stats/shared/mock-data'
import type { LighthouseScores } from '@/registry/blocks/stats/shared/types'

export interface StatsPerformanceProps {
  mobileScores?: LighthouseScores
  desktopScores?: LighthouseScores
  className?: string
}

export default function StatsPerformance({
  mobileScores = MOCK_LIGHTHOUSE_SCORES.mobile,
  desktopScores = MOCK_LIGHTHOUSE_SCORES.desktop,
  className = '',
}: StatsPerformanceProps) {
  return (
    <SectionLayout badge="Performance ⚡" isFlex={false} className={className}>
      <LighthouseScoreCard scores={mobileScores} strategy="mobile" />
      <LighthouseScoreCard scores={desktopScores} strategy="desktop" />
    </SectionLayout>
  )
}
