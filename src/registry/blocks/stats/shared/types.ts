export interface ContributionDay {
  date: string
  contributionCount: number
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE'
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface LighthouseScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

export interface ThoughtItem {
  title: string
  slug: string
  coverImage?: string
  count: number
  description?: string
}

export interface CategoryItem {
  name: string
  count: number
}

export interface ChangelogItem {
  id?: string
  version: string
  title?: string
  type?: 'milestone' | 'feature' | 'fix' | 'improvement'
  date: string
  description?: string
}
