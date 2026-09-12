'use client'

import * as React from 'react'
import { IconHeartFilled, IconGraphFilled } from '@tabler/icons-react'
import { SectionLayout } from '@/registry/blocks/stats/shared/section-layout'
import { ThoughtsTopList } from '@/registry/blocks/stats/shared/thoughts-top-list'
import { ReactionsSection } from '@/registry/blocks/stats/shared/reactions-section'
import { ThoughtMostViewedCard } from '@/registry/blocks/stats/shared/thought-most-viewed-card'
import { ThoughtsCategoriesCard } from '@/registry/blocks/stats/shared/thoughts-categories-card'
import { ChangelogUpdatesCard } from '@/registry/blocks/stats/shared/changelog-updates-card'
import {
  MOCK_TOP_VIEWED,
  MOCK_TOP_REACTED,
  MOCK_REACTIONS,
  MOCK_CATEGORIES,
  MOCK_CHANGELOG,
} from '@/registry/blocks/stats/shared/mock-data'
import type { ThoughtItem, CategoryItem, ChangelogItem } from '@/registry/blocks/stats/shared/types'

export interface StatsEngagementProps {
  topViewedThoughts?: ThoughtItem[]
  topReactedThoughts?: ThoughtItem[]
  reactions?: Record<string, number>
  categories?: CategoryItem[]
  changelog?: ChangelogItem[]
  className?: string
}

export default function StatsEngagement({
  topViewedThoughts = MOCK_TOP_VIEWED,
  topReactedThoughts = MOCK_TOP_REACTED,
  reactions = MOCK_REACTIONS,
  categories = MOCK_CATEGORIES,
  changelog = MOCK_CHANGELOG,
  className = '',
}: StatsEngagementProps) {
  const featuredThought = topViewedThoughts[0]

  return (
    <SectionLayout badge="Engagement 💬" isFlex className={`pb-0! ${className}`}>
      <div className="w-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThoughtsTopList
          title="Most viewed articles"
          description="Most read articles"
          type="viewed"
          thoughts={topViewedThoughts}
          icon={<IconGraphFilled size={26} />}
          decoration="📈"
        />
        <ThoughtsTopList
          title="Most liked articles"
          description="Articles with the most reactions"
          type="reacted"
          thoughts={topReactedThoughts}
          icon={<IconHeartFilled size={26} />}
          decoration="❤️"
        />
      </div>

      <div className="w-full">
        <ReactionsSection reactions={reactions} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 col-span-2">
        {featuredThought && (
          <ThoughtMostViewedCard
            title={featuredThought.title}
            slug={featuredThought.slug}
            description={featuredThought.description}
            coverImage={featuredThought.coverImage}
            views={featuredThought.count}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 h-full w-full lg:flex lg:flex-col gap-2 lg:col-span-4">
          <ThoughtsCategoriesCard
            data={categories}
            title="Categories"
            description="Articles by topic"
            decorationEmoji="📊"
          />
          <ChangelogUpdatesCard count={changelog.length} changelog={changelog} />
        </div>
      </div>
    </SectionLayout>
  )
}
