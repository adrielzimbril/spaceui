'use client'

import * as React from 'react'
import { IconBookFilled, IconClockFilled, IconFolderFilled, IconMessageCircleFilled } from '@tabler/icons-react'
import { SectionLayout } from '@/registry/blocks/stats/shared/section-layout'
import { StatCard } from '@/registry/blocks/stats/shared/stat-card'
import { MOCK_BLOG_STATS } from '@/registry/blocks/stats/shared/mock-data'

export interface StatsBlogProps {
  totalPosts?: number
  totalWords?: number
  communityMessages?: number
  totalReadingTime?: number
  className?: string
}

export default function StatsBlog({
  totalPosts = MOCK_BLOG_STATS.totalPosts,
  totalWords = MOCK_BLOG_STATS.totalWords,
  communityMessages = MOCK_BLOG_STATS.communityMessages,
  totalReadingTime = MOCK_BLOG_STATS.totalReadingTime,
  className = '',
}: StatsBlogProps) {
  return (
    <SectionLayout badge="Content ✍️" isFlex className={`pb-0! ${className}`}>
      <div className="grid md:w-[90%] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatCard
          label="Total articles"
          value={totalPosts}
          suffix="articles"
          icon={<IconBookFilled size={32} />}
          decorationPattern="💭"
        />
        <StatCard
          label="Total words"
          value={totalWords.toLocaleString()}
          suffix="words"
          icon={<IconFolderFilled size={32} />}
          decorationPattern="📝"
        />
        <StatCard
          label="Community messages"
          value={communityMessages}
          suffix="messages"
          icon={<IconMessageCircleFilled size={32} />}
          decorationPattern="💬"
        />
        <StatCard
          label="Reading time"
          value={totalReadingTime}
          suffix="min"
          icon={<IconClockFilled size={32} />}
          decorationPattern="⏱️"
        />
      </div>
    </SectionLayout>
  )
}
