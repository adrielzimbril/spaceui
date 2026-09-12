'use client'

import * as React from 'react'
import HeaderSection from '@/registry/blocks/stats/shared/header-section'
import StatsGeneral from '@/registry/blocks/stats/stats-general'
import StatsEngagement from '@/registry/blocks/stats/stats-engagement'
import StatsBlog from '@/registry/blocks/stats/stats-blog'
import StatsGitHub from '@/registry/blocks/stats/stats-github'
import StatsPerformance from '@/registry/blocks/stats/stats-performance'

export default function StatsTemplate() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-0 py-8 px-4 md:px-8">
      <HeaderSection />
      <StatsGeneral />
      <StatsEngagement />
      <StatsBlog />
      <StatsGitHub />
      <StatsPerformance />
    </div>
  )
}
