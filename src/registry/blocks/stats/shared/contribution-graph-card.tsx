'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/registry/primitives/tooltip'
import { cn } from '@/registry/lib/utils'
import type { ContributionData } from './types'

export interface ContributionGraphCardProps {
  contributions: ContributionData
  className?: string
  delay?: number
}

function GithubSvg({ size = 24, className }: { size?: number | string; className?: string }) {
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

const CONTRIBUTION_LEVEL_COLORS = {
  NONE: 'bg-border',
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

export function ContributionGraphCard({ contributions, className, delay = 0 }: ContributionGraphCardProps) {
  const monthLabels = React.useMemo(() => {
    const months: { label: string; index: number }[] = []
    let currentMonth = -1

    contributions.weeks.forEach((week, weekIndex) => {
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
  }, [contributions.weeks])

  return (
    <Frame
      className={cn(
        'h-full md:col-span-10 size-full max-w-[95%] bg-muted squircle-4xl/80 md:squircle-6xl/80 border-0 overflow-hidden mx-auto p-4 gap-2',
        className,
      )}
    >
      <Card className="relative flex flex-col justify-between size-full px-4 py-6 md:px-6 md:py-8 squircle-2xl/60 md:squircle-4xl/60 bg-background border-0 overflow-hidden before:hidden shadow-none">
        {/* Header */}
        <div className="relative z-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max squircle-2xl/80 md:squircle-3xl/80 text-primary-foreground!"
              size="sm"
              variant="default"
            >
              <GithubSvg size={32} />
            </Badge>
            <div>
              <h6 className="font-medium text-foreground">Contributions</h6>
              <p className="text-sm text-muted-foreground">This year</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {contributions.totalContributions}
            </span>
            <p className="text-xs text-muted-foreground">contributions</p>
          </div>
        </div>

        {/* Graph */}
        <div className="relative z-20 mt-2 flex-1">
          {/* Mobile view with horizontal scroll */}
          <div className="overflow-x-auto md:hidden">
            <div className="w-fit">
              <div className="mb-1 flex text-[10px] text-muted-foreground" style={{ paddingLeft: '28px' }}>
                <div className="flex" style={{ gap: '2px' }}>
                  {contributions.weeks.map((week, weekIndex) => {
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
                  {contributions.weeks.map((week, weekIndex) => (
                    <motion.div
                      key={weekIndex}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: delay + 0.3 + weekIndex * 0.005,
                        ease: 'easeOut',
                      }}
                      className="flex flex-col"
                      style={{ gap: '2px' }}
                    >
                      {week.contributionDays.map((day, dayIndex) => (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger>
                            <div className={cn('group/cell relative aspect-square')}>
                              <div
                                className={cn(
                                  'h-[10px] w-[10px] aspect-square rounded-sm transition-colors duration-150',
                                  CONTRIBUTION_LEVEL_COLORS[day.contributionLevel],
                                  levelColorsHover[day.contributionLevel],
                                )}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border">
                            <div className="font-medium">
                              {day.contributionCount} contribution
                              {day.contributionCount !== 1 ? 's' : ''}
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
          <div className="hidden md:block">
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
                  gridTemplateColumns: `repeat(${contributions.weeks.length}, 1fr)`,
                  gap: '3px',
                }}
              >
                {contributions.weeks.map((week, weekIndex) => (
                  <motion.div
                    key={weekIndex}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: delay + 0.3 + weekIndex * 0.005,
                      ease: 'easeOut',
                    }}
                    className="flex flex-col gap-[3px]"
                  >
                    {week.contributionDays.map((day, dayIndex) => (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger>
                          <div className={cn('group/cell relative aspect-square')}>
                            <div
                              className={cn(
                                'h-full w-full aspect-square rounded-sm transition-colors duration-150 lg:rounded-md',
                                CONTRIBUTION_LEVEL_COLORS[day.contributionLevel],
                                levelColorsHover[day.contributionLevel],
                              )}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border">
                          <div className="font-medium">
                            {day.contributionCount} contribution
                            {day.contributionCount !== 1 ? 's' : ''}
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
        <div className="relative z-20 mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:justify-end">
          <span>Less</span>
          {(['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'] as const).map(
            (level) => (
              <div key={level} className={`h-[10px] w-[10px] rounded-[2px] ${CONTRIBUTION_LEVEL_COLORS[level]}`} />
            ),
          )}
          <span>More</span>
        </div>
      </Card>
    </Frame>
  )
}
