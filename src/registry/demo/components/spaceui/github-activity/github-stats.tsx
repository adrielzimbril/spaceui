'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { IconCodeCircleFilled, IconStarFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { GithubIcon } from '@/registry/components/spaceui/github-activity'
import { cn } from '@/registry/lib/utils'

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

const starDecorations = [
  { x: '12%', y: '18%', size: 16, rotate: 0 },
  { x: '78%', y: '12%', size: 12, rotate: 15 },
  { x: '85%', y: '55%', size: 14, rotate: -10 },
  { x: '20%', y: '65%', size: 10, rotate: 20 },
  { x: '65%', y: '70%', size: 8, rotate: -5 },
]

const forkDecorations = [
  { x: '15%', y: '20%', rotate: -20 },
  { x: '80%', y: '15%', rotate: 25 },
  { x: '75%', y: '60%', rotate: -15 },
  { x: '25%', y: '70%', rotate: 10 },
]

const commitDecorations = [
  { x: '15%', y: '25%' },
  { x: '30%', y: '18%' },
  { x: '75%', y: '20%' },
  { x: '85%', y: '50%' },
  { x: '20%', y: '65%' },
  { x: '70%', y: '70%' },
]

function GitHubStatCardItem({
  type,
  label,
  value,
}: {
  type: 'stars' | 'forks' | 'commits'
  label: string
  value: number | string
}) {
  const [isHovered, setIsHovered] = React.useState(false)

  const theme = {
    stars: { icon: IconStarFilled },
    forks: { icon: IconCodeCircleFilled },
    commits: { icon: GithubIcon },
  }[type]

  const Icon = theme.icon

  return (
    <Frame
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-1 size-full bg-muted border-0 overflow-hidden p-2 rounded-2xl"
    >
      <Card className="relative bg-background border-0 overflow-hidden size-full p-0 flex flex-row items-center before:hidden shadow-none rounded-2xl">
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
                className="absolute text-amber-400"
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
                className="absolute text-amber-400"
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
                className="absolute text-amber-400"
                style={{ left: commit.x, top: commit.y }}
              >
                <CommitDot />
              </motion.div>
            ))}
        </div>

        <div className="relative size-full flex flex-row z-20 overflow-hidden items-center gap-2 md:gap-4 px-3 py-2.5 m-auto">
          <Badge
            className="capitalize whitespace-pre-line size-auto bg-[#ffd3ad] text-stone-900 rounded-xl"
            variant="default"
            size="lg"
          >
            <Icon size={32} />
          </Badge>
          <div className="flex flex-col items-start gap-1.5">
            <h6 className="tracking-wide text-foreground whitespace-pre-line font-medium text-sm md:text-base leading-tight">
              {label}
            </h6>
            <p className="text-sm text-muted-foreground leading-[120%] font-medium">{value}</p>
          </div>
        </div>
      </Card>
    </Frame>
  )
}

export function GitHubStats({ className }: { className?: string } = {}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 w-fit', className)}>
      <GitHubStatCardItem type="stars" label="GitHub stars" value={342} />
      <GitHubStatCardItem type="forks" label="Forks" value={89} />
      <GitHubStatCardItem type="commits" label="Commits" value={1845} />
    </div>
  )
}
