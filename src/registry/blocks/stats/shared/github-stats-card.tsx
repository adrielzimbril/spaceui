'use client'

import { motion } from 'motion/react'
import * as React from 'react'
import { IconCodeCircleFilled, IconStarFilled, IconBrandGithubFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'
import { MOCK_GITHUB_STATS } from './mock-data'

export type GitHubStatType = 'stars' | 'forks' | 'commits'

export interface GitHubStatsCardProps {
  type: GitHubStatType
  label: string
  value: number | string
  period?: string
  className?: string
}

const starDecorations = [
  { x: '12%', y: '18%', size: 16, rotate: 0, delay: 0 },
  { x: '78%', y: '12%', size: 12, rotate: 15, delay: 0.1 },
  { x: '85%', y: '55%', size: 14, rotate: -10, delay: 0.15 },
  { x: '20%', y: '65%', size: 10, rotate: 20, delay: 0.2 },
  { x: '65%', y: '70%', size: 8, rotate: -5, delay: 0.25 },
]

const forkDecorations = [
  { x: '15%', y: '20%', rotate: -20, delay: 0 },
  { x: '80%', y: '15%', rotate: 25, delay: 0.1 },
  { x: '75%', y: '60%', rotate: -15, delay: 0.15 },
  { x: '25%', y: '70%', rotate: 10, delay: 0.2 },
]

const commitDecorations = [
  { x: '15%', y: '25%', delay: 0 },
  { x: '30%', y: '18%', delay: 0.05 },
  { x: '75%', y: '20%', delay: 0.1 },
  { x: '85%', y: '50%', delay: 0.15 },
  { x: '20%', y: '65%', delay: 0.2 },
  { x: '70%', y: '70%', delay: 0.25 },
]

function StarShape({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function BranchShape({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="10" cy="4" r="2" />
      <circle cx="4" cy="20" r="2" />
      <circle cx="16" cy="20" r="2" />
      <path d="M10 6v6M10 12c0 4-6 4-6 8M10 12c0 4 6 4 6 8" />
    </svg>
  )
}

function CommitDot({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <circle cx="8" cy="8" r="4" />
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
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

const themeConfig = {
  stars: {
    icon: IconStarFilled,
    decorColor: 'text-amber-400',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-[#ffd3ad] text-stone-900',
  },
  forks: {
    icon: IconCodeCircleFilled,
    decorColor: 'text-amber-400',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-[#ffd3ad] text-stone-900',
  },
  commits: {
    icon: GithubSvg,
    decorColor: 'text-amber-400',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-[#ffd3ad] text-stone-900',
  },
}

export function GitHubStatsCard({ type, label, value, period, className }: GitHubStatsCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const theme = themeConfig[type]
  const Icon = theme.icon

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('flex-1 size-full bg-muted squircle-3xl/60 border-0 overflow-hidden p-2', className)}
    >
      <Card className="relative squircle-4xl/100 bg-background border-0 overflow-hidden size-full p-0 flex flex-row items-center before:hidden shadow-none">
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          {type === 'stars' &&
            starDecorations.map((star, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: star.rotate - 30 }}
                animate={{
                  opacity: isHovered ? 0.55 : 0.3,
                  scale: isHovered ? 1.4 : 1,
                  rotate: isHovered ? star.rotate + 15 : star.rotate,
                  y: isHovered ? -8 : 0,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { type: 'spring', stiffness: 200, damping: 15 },
                  rotate: { type: 'spring', stiffness: 200, damping: 15 },
                  y: { type: 'spring', stiffness: 200, damping: 15 },
                }}
                className={`absolute ${theme.decorColor}`}
                style={{ left: star.x, top: star.y }}
              >
                <StarShape size={star.size} />
              </motion.div>
            ))}

          {type === 'forks' &&
            forkDecorations.map((fork, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: fork.rotate }}
                animate={{
                  opacity: isHovered ? 0.5 : 0.28,
                  scale: isHovered ? 1.3 : 1,
                  rotate: isHovered ? fork.rotate * 1.3 : fork.rotate,
                  y: isHovered ? -8 : 0,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { type: 'spring', stiffness: 200, damping: 15 },
                  rotate: { type: 'spring', stiffness: 200, damping: 15 },
                  y: { type: 'spring', stiffness: 200, damping: 15 },
                }}
                className={`absolute ${theme.decorColor}`}
                style={{ left: fork.x, top: fork.y }}
              >
                <BranchShape />
              </motion.div>
            ))}

          {type === 'commits' &&
            commitDecorations.map((commit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isHovered ? 0.55 : 0.32,
                  scale: isHovered ? 1.5 : 1,
                  y: isHovered ? -6 : 0,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { type: 'spring', stiffness: 250, damping: 15 },
                  y: { type: 'spring', stiffness: 200, damping: 15 },
                }}
                className={`absolute ${theme.decorColor}`}
                style={{ left: commit.x, top: commit.y }}
              >
                <CommitDot />
              </motion.div>
            ))}
        </div>

        <div className="relative size-full flex flex-row z-20 overflow-hidden items-center gap-2 md:gap-4 px-2 py-2 m-auto">
          <Badge
            className={cn('capitalize whitespace-pre-line size-auto squircle-2xl/80 md:squircle-3xl/80', theme.badgeBg)}
            variant="default"
            size="lg"
          >
            <Icon size={32} />
          </Badge>
          <div className="flex flex-col items-start gap-2">
            <h6 className="tracking-wide text-foreground whitespace-pre-line font-medium text-sm md:text-base leading-tight">
              {label}
            </h6>
            <p className="text-sm text-muted-foreground leading-[120%] font-medium">{value}</p>
            {period && <p className="mt-1 text-xs text-muted-foreground">{period}</p>}
          </div>
        </div>
      </Card>
    </Frame>
  )
}

export interface GitHubStatsProps {
  stars?: number
  forks?: number
  commits?: number
  shape?: 'square' | 'rounded' | 'circle'
  className?: string
}

export function GitHubStats({
  stars = MOCK_GITHUB_STATS.stars,
  forks = MOCK_GITHUB_STATS.forks,
  commits = MOCK_GITHUB_STATS.commits,
  className,
}: GitHubStatsProps = {}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 w-fit', className)}>
      <GitHubStatsCard type="stars" label="GitHub stars" value={stars} />
      <GitHubStatsCard type="forks" label="Forks" value={forks} />
      <GitHubStatsCard type="commits" label="Commits" value={commits} />
    </div>
  )
}
