'use client'

import * as React from 'react'
import { IconCalendarFilled, IconMugFilled, IconEyeFilled } from '@tabler/icons-react'
import { SectionLayout } from '@/registry/blocks/stats/shared/section-layout'
import { StatCard } from '@/registry/blocks/stats/shared/stat-card'
import { MOCK_GENERAL_STATS } from '@/registry/blocks/stats/shared/mock-data'

export interface StatsGeneralProps {
  totalViews?: number
  coffeeCups?: number
  siteAgeDays?: number
  className?: string
}

export default function StatsGeneral({
  totalViews = MOCK_GENERAL_STATS.totalViews,
  coffeeCups = MOCK_GENERAL_STATS.coffeeCups,
  siteAgeDays = MOCK_GENERAL_STATS.siteAgeDays,
  className = '',
}: StatsGeneralProps) {
  return (
    <SectionLayout badge="Overview 📊" isFlex className={`py-0! ${className}`}>
      <div className="mt-6 md:w-[80%] grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <StatCard
          label="Total site views"
          value={totalViews.toLocaleString()}
          icon={<IconEyeFilled size={32} />}
          decoration="👁️"
          description="Since launch"
        />
        <StatCard
          label="Cups of coffee"
          value={coffeeCups}
          suffix="cups"
          icon={<IconMugFilled size={32} />}
          decoration="☕"
          description="1 cup per 500 words"
        />
        <StatCard
          label="Site age"
          value={siteAgeDays}
          suffix="days"
          icon={<IconCalendarFilled size={32} />}
          decoration="📅"
          description="Launched on Jan 1, 2024"
        />
      </div>
    </SectionLayout>
  )
}
