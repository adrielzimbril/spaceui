'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/registry/primitives/tooltip'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'

export type GitHubActivityShape = 'square' | 'rounded' | 'circle'

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

export interface GitHubActivityProps {
  /**
   * Target GitHub user or repository:
   * Accepts a username handle ('shadcn', '@shadcn'), a repository ('facebook/react'),
   * or any GitHub profile / repository URL ('https://github.com/shadcn' or 'https://github.com/facebook/react').
   */
  user?: string

  /**
   * Target repository or user. Alias for `user`.
   */
  target?: string

  /**
   * Alias for `user` for backwards compatibility.
   */
  username?: string

  /**
   * Target repository in 'owner/repo' format or full URL. Alias for `user`.
   */
  repo?: string

  /** 52-week contribution heatmap calendar data (skips fetch if provided) */
  contributions?: ContributionData

  /** Corner geometry style: strictly 'square' | 'rounded' | 'circle' */
  shape?: GitHubActivityShape

  /** Toggle header section display */
  showHeader?: boolean

  /** Toggle bottom legend display */
  showLegend?: boolean

  /** Optional custom title text */
  title?: string

  /** Optional custom subtitle text */
  subtitle?: string

  /** Additional wrapper class name */
  className?: string
}

// ── SVG Icons ──
export function GithubIcon({ size = 24, className }: { size?: number | string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

// ── Color Schemes ──
const CONTRIBUTION_LEVEL_COLORS = {
  NONE: 'bg-muted/70 dark:bg-muted/40 border border-border/30',
  FIRST_QUARTILE: 'bg-green-200 dark:bg-green-900/60',
  SECOND_QUARTILE: 'bg-green-400 dark:bg-green-700',
  THIRD_QUARTILE: 'bg-green-500 dark:bg-green-500',
  FOURTH_QUARTILE: 'bg-green-600 dark:bg-green-400',
} as const

const levelColorsHover = {
  NONE: 'group-hover/cell:bg-border/80',
  FIRST_QUARTILE: 'group-hover/cell:bg-green-300',
  SECOND_QUARTILE: 'group-hover/cell:bg-green-500',
  THIRD_QUARTILE: 'group-hover/cell:bg-green-600',
  FOURTH_QUARTILE: 'group-hover/cell:bg-green-700',
}

// ── Shape Utilities ──
function getShapeClasses(shape: GitHubActivityShape) {
  switch (shape) {
    case 'square':
      return {
        card: 'rounded-none',
        badge: 'rounded-none',
        cell: 'rounded-none',
      }
    case 'circle':
      return {
        card: 'rounded-3xl',
        badge: 'rounded-full',
        cell: 'rounded-full',
      }
    case 'rounded':
    default:
      return {
        card: 'rounded-2xl',
        badge: 'rounded-xl',
        cell: 'rounded-xs lg:rounded-sm',
      }
  }
}

function formatDate(dateString: string): string {
  const parts = dateString.split('-').map(Number)
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  if (year === undefined || month === undefined || day === undefined) {
    return dateString
  }
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Default Mock Generator ──
export function generateDefaultContributions(): ContributionData {
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
      const count = rand > 0.45 ? Math.floor(rand * 9) : 0
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

  return { totalContributions: total, weeks }
}

/**
 * Normalizes a GitHub username, handle, or URL into a clean username string.
 *
 * Supported formats:
 * - 'torvalds'
 * - '@torvalds'
 * - 'https://github.com/torvalds'
 * - 'https://github.com/torvalds?tab=repositories'
 * - 'github.com/torvalds/'
 */
export type GitHubTarget =
  { type: 'repo'; owner: string; repo: string; full: string } | { type: 'user'; username: string } | null

/**
 * Normalizes a GitHub input (username, handle, repository, or full URL) into a target descriptor.
 *
 * Supported formats:
 * - 'torvalds' -> { type: 'user', username: 'torvalds' }
 * - '@torvalds' -> { type: 'user', username: 'torvalds' }
 * - 'https://github.com/torvalds' -> { type: 'user', username: 'torvalds' }
 * - 'facebook/react' -> { type: 'repo', owner: 'facebook', repo: 'react', full: 'facebook/react' }
 * - 'https://github.com/facebook/react' -> { type: 'repo', owner: 'facebook', repo: 'react', full: 'facebook/react' }
 */
export function parseGitHubTarget(input?: string): GitHubTarget {
  if (!input) return null
  let cleaned = input.trim()
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?github\.com\/?/, '')
  cleaned = cleaned.replace(/^@/, '')
  cleaned = cleaned.split('?')[0]?.split('#')[0] || ''

  const segments = cleaned.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const RESERVED_TABS = new Set(['repositories', 'stars', 'followers', 'following', 'projects', 'packages'])
  if (segments.length >= 2 && !RESERVED_TABS.has(segments[1]!.toLowerCase())) {
    const owner = segments[0]!
    const repo = segments[1]!
    return { type: 'repo', owner, repo, full: `${owner}/${repo}` }
  }

  return { type: 'user', username: segments[0]! }
}

export function parseGitHubUser(input?: string): string {
  const target = parseGitHubTarget(input)
  if (!target) return ''
  return target.type === 'user' ? target.username : target.full
}

/**
 * Transforms the API response from jogruber's GitHub contributions service into ContributionData.
 */
export function transformContributions(apiData: {
  total?: { lastYear?: number; [year: string]: number | undefined }
  contributions: Array<{ date: string; count: number; level: number }>
}): ContributionData {
  const LEVEL_MAP: Record<number, ContributionDay['contributionLevel']> = {
    0: 'NONE',
    1: 'FIRST_QUARTILE',
    2: 'SECOND_QUARTILE',
    3: 'THIRD_QUARTILE',
    4: 'FOURTH_QUARTILE',
  }

  const weeks: ContributionWeek[] = []
  let currentDays: ContributionDay[] = []

  for (const item of apiData.contributions) {
    currentDays.push({
      date: item.date,
      contributionCount: item.count,
      contributionLevel: LEVEL_MAP[item.level] ?? 'NONE',
    })

    if (currentDays.length === 7) {
      weeks.push({ contributionDays: currentDays })
      currentDays = []
    }
  }

  if (currentDays.length > 0) {
    weeks.push({ contributionDays: currentDays })
  }

  const totalContributions =
    typeof apiData.total?.lastYear === 'number'
      ? apiData.total.lastYear
      : apiData.contributions.reduce((acc, curr) => acc + curr.count, 0)

  return {
    totalContributions,
    weeks,
  }
}

/**
 * Transforms GitHub's official repository commit activity stats (/stats/commit_activity) into ContributionData.
 */
export function transformRepoCommitActivity(
  weeks: Array<{ total: number; week: number; days: number[] }>,
): ContributionData {
  let total = 0
  const transformedWeeks: ContributionWeek[] = weeks.map((w) => {
    total += w.total
    const days: ContributionDay[] = w.days.map((count, d) => {
      const date = new Date((w.week + d * 86400) * 1000).toISOString().split('T')[0]!
      const level: ContributionDay['contributionLevel'] =
        count === 0
          ? 'NONE'
          : count < 3
            ? 'FIRST_QUARTILE'
            : count < 7
              ? 'SECOND_QUARTILE'
              : count < 15
                ? 'THIRD_QUARTILE'
                : 'FOURTH_QUARTILE'

      return {
        date,
        contributionCount: count,
        contributionLevel: level,
      }
    })
    return { contributionDays: days }
  })

  return {
    totalContributions: total,
    weeks: transformedWeeks,
  }
}

const activityCache = new Map<string, ContributionData>()

/**
 * Hook to automatically fetch 52-week activity for any GitHub user OR repository (handle, name, or URL).
 */
export function useGitHubActivity(inputTarget?: string, initialData?: ContributionData) {
  const target = React.useMemo(() => parseGitHubTarget(inputTarget), [inputTarget])
  const cacheKey = target ? (target.type === 'repo' ? `repo:${target.full}` : `user:${target.username}`) : ''

  const [data, setData] = React.useState<ContributionData | null>(() => {
    if (initialData) return initialData
    if (cacheKey && activityCache.has(cacheKey)) {
      return activityCache.get(cacheKey)!
    }
    return null
  })

  const [loading, setLoading] = React.useState<boolean>(() => {
    if (initialData) return false
    if (!target) return false
    return !activityCache.has(cacheKey)
  })

  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (initialData) {
      setData(initialData)
      setLoading(false)
      return
    }

    if (!target || !cacheKey) {
      setData(null)
      setLoading(false)
      return
    }

    if (activityCache.has(cacheKey)) {
      setData(activityCache.get(cacheKey)!)
      setLoading(false)
      return
    }

    let isMounted = true
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    async function fetchActivity() {
      try {
        let transformed: ContributionData

        if (target.type === 'repo') {
          const res = await fetch(`https://api.github.com/repos/${target.owner}/${target.repo}/stats/commit_activity`, {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github.v3+json' },
          })
          if (!res.ok) {
            throw new Error(`Failed to fetch repo commit activity: ${res.statusText}`)
          }
          const json = await res.json()
          if (!Array.isArray(json)) {
            throw new Error(`Unexpected commit activity format for repo: ${target.full}`)
          }
          transformed = transformRepoCommitActivity(json)
        } else {
          const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${target.username}?y=last`, {
            signal: controller.signal,
          })
          if (!res.ok) {
            throw new Error(`Failed to fetch user contributions: ${res.statusText}`)
          }
          const json = await res.json()
          transformed = transformContributions(json)
        }

        activityCache.set(cacheKey, transformed)

        if (isMounted) {
          setData(transformed)
          setLoading(false)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.warn(`[GitHubActivity] Could not fetch activity for ${cacheKey}:`, err)
        if (isMounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    fetchActivity()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [cacheKey, initialData])

  return { target, data, loading, error }
}

export { useGitHubActivity as useGitHubContributions }

// ── Core GitHub Activity Component (Just The Content) ──
/**
 * GitHubActivity Component
 *
 * Renders pure GitHub activity content: header summary, 52-week contribution matrix, and interactive tooltips.
 * Designed without fixed outer Frame/Card containers or embedded stat cards, offering full layout freedom.
 */
export function GitHubActivity({
  user,
  target,
  username,
  repo,
  contributions,
  shape = 'rounded',
  showHeader = true,
  showLegend = true,
  title = 'Contributions',
  subtitle,
  className,
}: GitHubActivityProps) {
  const input = user ?? target ?? repo ?? username
  const { target: resolvedTarget, data: fetchedContributions, loading } = useGitHubActivity(input, contributions)

  const finalContributions = React.useMemo(() => {
    return fetchedContributions || contributions || generateDefaultContributions()
  }, [fetchedContributions, contributions])

  const shapeClasses = getShapeClasses(shape)

  const monthLabels = React.useMemo(() => {
    const months: { label: string; index: number }[] = []
    let currentMonth = -1

    finalContributions.weeks.forEach((week, weekIndex) => {
      const firstDay = week.contributionDays[0]
      if (firstDay) {
        const date = new Date(firstDay.date)
        const month = date.getMonth()
        if (month !== currentMonth) {
          currentMonth = month
          months.push({
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            index: weekIndex,
          })
        }
      }
    })

    return months
  }, [finalContributions.weeks])

  const isRepo = resolvedTarget?.type === 'repo'
  const displayName = resolvedTarget ? (isRepo ? resolvedTarget.full : `@${resolvedTarget.username}`) : title

  const profileUrl = resolvedTarget
    ? isRepo
      ? `https://github.com/${resolvedTarget.full}`
      : `https://github.com/${resolvedTarget.username}`
    : undefined

  const counterUnit = isRepo ? 'commits' : 'contributions'
  const displaySubtitle = subtitle ?? (isRepo ? 'Repository commit activity' : 'Past 52 weeks')

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {/* Header Summary */}
      {showHeader && (
        <div className="relative z-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                'aspect-square capitalize text-xs font-medium bg-[#8e8eff] size-max text-primary-foreground!',
                shapeClasses.badge,
              )}
              size="sm"
              square={shape === 'circle'}
            >
              <GithubIcon size={32} />
            </Badge>
            <div>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:underline focus-visible:underline outline-none"
                >
                  <h6>{displayName}</h6>
                </a>
              ) : (
                <h6 className="font-medium text-foreground">{displayName}</h6>
              )}
              <p className="text-sm text-muted-foreground">{displaySubtitle}</p>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="h-7 w-16 bg-muted/60 rounded animate-pulse inline-block" />
            ) : (
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {finalContributions.totalContributions.toLocaleString()}
              </span>
            )}
            <p className="text-xs text-muted-foreground">{counterUnit}</p>
          </div>
        </div>
      )}

      {/* Heatmap Matrix */}
      <div className="relative z-20 mt-2 flex-1 w-full">
        {/* Mobile view with horizontal overflow scroll */}
        <div className="overflow-x-auto md:hidden">
          <div className="w-fit">
            <div className="mb-1 flex text-[10px] text-muted-foreground" style={{ paddingLeft: '28px' }}>
              <div className="flex" style={{ gap: '2px' }}>
                {finalContributions.weeks.map((week, weekIndex) => {
                  const showMonth = monthLabels.some((m) => m.index === weekIndex)
                  const monthLabel = showMonth ? monthLabels.find((m) => m.index === weekIndex)?.label : ''
                  return (
                    <div key={weekIndex} className="w-[10px] text-center">
                      {monthLabel && <span className="whitespace-nowrap">{monthLabel}</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-[2px]">
              <div className="flex w-6 shrink-0 flex-col text-[9px] text-muted-foreground" style={{ gap: '2px' }}>
                <div className="h-[10px]" />
                <div className="flex h-[10px] items-center">Mon</div>
                <div className="h-[10px]" />
                <div className="flex h-[10px] items-center">Wed</div>
                <div className="h-[10px]" />
                <div className="flex h-[10px] items-center">Fri</div>
                <div className="h-[10px]" />
              </div>
              <div className="flex" style={{ gap: '2px' }}>
                {finalContributions.weeks.map((week, weekIndex) => (
                  <motion.div
                    key={weekIndex}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: 0.1 + weekIndex * 0.004,
                      ease: 'easeOut',
                    }}
                    className="flex flex-col"
                    style={{ gap: '2px' }}
                  >
                    {week.contributionDays.map((day, dayIndex) => (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger>
                          <div className="group/cell relative aspect-square">
                            <div
                              className={cn(
                                'h-[10px] w-[10px] aspect-square transition-colors duration-150',
                                loading
                                  ? 'bg-muted/60 animate-pulse'
                                  : cn(
                                      CONTRIBUTION_LEVEL_COLORS[day.contributionLevel],
                                      levelColorsHover[day.contributionLevel],
                                    ),
                                shapeClasses.cell,
                              )}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border">
                          <div className="font-medium">
                            {day.contributionCount}{' '}
                            {isRepo
                              ? day.contributionCount !== 1
                                ? 'commits'
                                : 'commit'
                              : day.contributionCount !== 1
                                ? 'contributions'
                                : 'contribution'}
                          </div>
                          <div className="text-muted-foreground">{formatDate(day.date)}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block w-full">
          <div className="mb-1 flex text-[10px] text-muted-foreground" style={{ paddingLeft: '28px' }}>
            <div className="flex flex-1 justify-between">
              {monthLabels.map((month, i) => (
                <span key={i}>{month.label}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-[3px]">
            <div className="flex w-6 shrink-0 flex-col justify-between py-[2px] text-[9px] text-muted-foreground">
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>
            <div
              className="grid flex-1"
              style={{
                gridTemplateColumns: `repeat(${finalContributions.weeks.length}, 1fr)`,
                gap: '3px',
              }}
            >
              {finalContributions.weeks.map((week, weekIndex) => (
                <motion.div
                  key={weekIndex}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.1 + weekIndex * 0.004,
                    ease: 'easeOut',
                  }}
                  className="flex flex-col gap-[3px]"
                >
                  {week.contributionDays.map((day, dayIndex) => (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger>
                        <div className="group/cell relative aspect-square">
                          <div
                            className={cn(
                              'h-full w-full aspect-square transition-colors duration-150',
                              loading
                                ? 'bg-muted/60 animate-pulse'
                                : cn(
                                    CONTRIBUTION_LEVEL_COLORS[day.contributionLevel],
                                    levelColorsHover[day.contributionLevel],
                                  ),
                              shapeClasses.cell,
                            )}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border">
                        <div className="font-medium">
                          {day.contributionCount}{' '}
                          {isRepo
                            ? day.contributionCount !== 1
                              ? 'commits'
                              : 'commit'
                            : day.contributionCount !== 1
                              ? 'contributions'
                              : 'contribution'}
                        </div>
                        <div className="text-muted-foreground">{formatDate(day.date)}</div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="relative z-20 mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground md:justify-end">
          <span>Less</span>
          {(['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'] as const).map(
            (level) => (
              <div
                key={level}
                className={cn('h-[10px] w-[10px]', CONTRIBUTION_LEVEL_COLORS[level], shapeClasses.cell)}
              />
            ),
          )}
          <span>More</span>
        </div>
      )}
    </div>
  )
}
