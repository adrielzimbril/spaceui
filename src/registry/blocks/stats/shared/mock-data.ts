import type { ContributionData, LighthouseScores, ThoughtItem, CategoryItem, ChangelogItem } from './types'

export function generateMockContributions(): ContributionData {
  const weeks = []
  const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'] as const
  let total = 0

  const now = new Date()
  for (let w = 51; w >= 0; w--) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const rand = Math.random()
      const count = rand > 0.4 ? Math.floor(rand * 9) : 0
      total += count
      const level =
        count === 0 ? levels[0] : count < 3 ? levels[1] : count < 5 ? levels[2] : count < 8 ? levels[3] : levels[4]

      days.push({
        date: date.toISOString().split('T')[0],
        contributionCount: count,
        contributionLevel: level,
      })
    }
    weeks.push({ contributionDays: days })
  }

  return {
    totalContributions: total,
    weeks,
  }
}

export const MOCK_GITHUB_STATS = {
  stars: 342,
  forks: 89,
  commits: 1845,
  contributions: generateMockContributions(),
}

export const MOCK_LIGHTHOUSE_SCORES: { mobile: LighthouseScores; desktop: LighthouseScores } = {
  mobile: {
    performance: 98,
    accessibility: 100,
    bestPractices: 100,
    seo: 100,
  },
  desktop: {
    performance: 100,
    accessibility: 100,
    bestPractices: 100,
    seo: 100,
  },
}

export const MOCK_GENERAL_STATS = {
  totalViews: 142850,
  totalWords: 84320,
  coffeeCups: 168,
  siteAgeDays: 482,
}

export const MOCK_BLOG_STATS = {
  totalPosts: 38,
  totalWords: 84320,
  communityMessages: 1240,
  totalReadingTime: 312,
}

export const MOCK_TOP_VIEWED: ThoughtItem[] = [
  {
    title: 'Designing High-Performance React Canvas Shaders',
    slug: 'designing-canvas-shaders',
    description: 'Deep dive into reactive shaders, render loops, and WebGL hardware acceleration in modern interfaces.',
    coverImage: '/samples/image-1.png',
    count: 18420,
  },
  {
    title: 'Building Fluid Motion Design Systems in Next.js',
    slug: 'fluid-motion-design-systems',
    description:
      'Constructing resilient physics springs and continuous interruptible gestures across responsive screens.',
    coverImage: '/samples/image-2.png',
    count: 14210,
  },
  {
    title: 'The Evolution of OKLCH Colors and Dynamic Gamuts',
    slug: 'evolution-oklch-gamuts',
    description: 'Perceptual uniformity, gamut mapping, and wide-color display gamuts in modern design systems.',
    coverImage: '/samples/image-3.png',
    count: 11840,
  },
  {
    title: 'Optimizing Framer Motion Layout Springs at Scale',
    slug: 'optimizing-motion-springs',
    description: 'Architecting buttery 120fps morph animations without triggering DOM layout recalculation storms.',
    coverImage: '/samples/image-4.png',
    count: 9350,
  },
]

export const MOCK_TOP_REACTED: ThoughtItem[] = [
  { title: 'Designing High-Performance React Canvas Shaders', slug: 'designing-canvas-shaders', count: 940 },
  { title: 'The Evolution of OKLCH Colors and Dynamic Gamuts', slug: 'evolution-oklch-gamuts', count: 780 },
  { title: 'Building Fluid Motion Design Systems in Next.js', slug: 'fluid-motion-design-systems', count: 650 },
]

export const MOCK_REACTIONS: Record<string, number> = {
  '🚀': 542,
  '✨': 489,
  '🔥': 382,
  '🧠': 294,
  '❤️': 415,
  '☕': 210,
}

export const MOCK_CATEGORIES: CategoryItem[] = [
  { name: 'Architecture', count: 14 },
  { name: 'UI / UX', count: 12 },
  { name: 'Animation', count: 8 },
  { name: 'WebGL & Shaders', count: 6 },
  { name: 'Typography', count: 5 },
]

export const MOCK_CHANGELOG: ChangelogItem[] = [
  { id: 'v2.4.0', version: 'v2.4.0', title: 'Modular Orbs & Canvas', type: 'feature', date: '2026-09-01' },
  { id: 'v2.3.2', version: 'v2.3.2', title: 'Hydration and Layout Fixes', type: 'fix', date: '2026-08-25' },
  { id: 'v2.3.0', version: 'v2.3.0', title: 'Design System & OKLCH Engine', type: 'milestone', date: '2026-08-10' },
  { id: 'v2.2.4', version: 'v2.2.4', title: 'Performance & Shader Cache', type: 'improvement', date: '2026-07-28' },
  { id: 'v2.2.0', version: 'v2.2.0', title: 'Lighthouse Radar Audit View', type: 'feature', date: '2026-07-15' },
  { id: 'v2.1.2', version: 'v2.1.2', title: 'Tooltip Alignment Patch', type: 'fix', date: '2026-06-30' },
  { id: 'v2.1.0', version: 'v2.1.0', title: 'Matrix Contribution Heatmap', type: 'feature', date: '2026-06-12' },
  { id: 'v2.0.0', version: 'v2.0.0', title: 'Space UI 2.0 Genesis Release', type: 'milestone', date: '2026-05-20' },
]
