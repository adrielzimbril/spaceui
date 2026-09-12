'use client'

import * as React from 'react'
import { IconDeviceDesktopFilled, IconDeviceMobileFilled } from '@tabler/icons-react'
import { Frame } from '@/registry/primitives/frame'
import { Card } from '@/registry/primitives/card'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { cn } from '@/registry/lib/utils'
import type { LighthouseScores } from './types'

export interface LighthouseScoreCardProps {
  scores: LighthouseScores
  strategy: 'mobile' | 'desktop'
  delay?: number
  className?: string
}

export function getScoreColor(score: number) {
  if (score >= 90) {
    return {
      bar: 'bg-emerald-500',
      barBg: 'bg-muted',
      text: 'text-emerald-500',
      glow: 'shadow-emerald-500/40',
    }
  }
  if (score >= 50) {
    return {
      bar: 'bg-amber-500',
      barBg: 'bg-muted',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/40',
    }
  }
  return {
    bar: 'bg-rose-500',
    barBg: 'bg-muted',
    text: 'text-rose-500',
    glow: 'shadow-rose-500/40',
  }
}

export function getOverallScore(scores: LighthouseScores) {
  const avg = (scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4
  return Math.round(avg)
}

function RadarBackground({ scores }: { scores: number[] }) {
  const size = 220
  const center = size / 2
  const maxRadius = 90

  const getPolygonPoints = (scoreValues: number[]) => {
    const angles = [-90, 0, 90, 180]
    return scoreValues
      .map((score, i) => {
        const angle = (angles[i] * Math.PI) / 180
        const radius = (score / 100) * maxRadius
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="pointer-events-none absolute -bottom-12 -right-12 text-green-600 dark:text-green-400 select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="rgb(22, 163, 74)" stopOpacity={0.1} />
          </radialGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth={scale === 1 ? 1.5 : 1}
            className="text-muted-foreground/30"
            opacity={0.35}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        ))}

        <g opacity={0.25}>
          <line
            x1={center}
            y1={center - maxRadius}
            x2={center}
            y2={center + maxRadius}
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground/30"
          />
          <line
            x1={center - maxRadius}
            y1={center}
            x2={center + maxRadius}
            y2={center}
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground/30"
          />
        </g>

        <polygon
          points={getPolygonPoints(scores)}
          fill="url(#radarGradient)"
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.6}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {scores.map((score, i) => {
          const angles = [-90, 0, 90, 180]
          const angle = (angles[i] * Math.PI) / 180
          const radius = (score / 100) * maxRadius
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return <circle key={i} cx={x} cy={y} r={3} fill="currentColor" opacity={0.7} />
        })}
      </svg>
    </div>
  )
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = getScoreColor(score)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-sm font-bold tabular-nums', colors.text)}>{score}</span>
      </div>
      <div className={cn('h-2.5 w-full overflow-hidden rounded-full', colors.barBg)}>
        <div
          style={{ width: `${score}%` }}
          className={cn('h-full rounded-full transition-all duration-500', colors.bar, 'shadow-lg', colors.glow)}
        />
      </div>
    </div>
  )
}

export function LighthouseScoreCard({ scores, strategy, className }: LighthouseScoreCardProps) {
  const scoreItems = [
    { score: scores.performance, label: 'Performance' },
    { score: scores.accessibility, label: 'Accessibility' },
    { score: scores.bestPractices, label: 'Best Practices' },
    { score: scores.seo, label: 'SEO' },
  ]

  const scoreValues = [scores.performance, scores.accessibility, scores.bestPractices, scores.seo]
  const overallScore = getOverallScore(scores)
  const DeviceIcon = strategy === 'mobile' ? IconDeviceMobileFilled : IconDeviceDesktopFilled

  return (
    <Frame
      className={cn(
        'size-full max-w-[95%] bg-muted squircle-4xl/80 md:squircle-6xl/80 border-0 overflow-hidden mx-auto p-4 gap-2',
        className,
      )}
    >
      <Card
        className={cn(
          'flex relative flex-col gap-4 md:gap-6 items-start justify-between px-4 py-6 md:px-6 md:py-8 squircle-2xl/60 md:squircle-4xl/60 bg-background border-0 overflow-hidden',
        )}
      >
        <RadarBackground scores={scoreValues} />

        <div className="relative flex flex-row z-20 items-center justify-between w-full mx-auto">
          <div className="flex flex-row items-center justify-between w-fit gap-2">
            <Badge
              className="capitalize text-xs font-medium bg-[#8e8eff] text-white size-max"
              variant="default"
              size="sm"
              square
            >
              <DeviceIcon size={32} />
            </Badge>
            <Badge className="capitalize" variant="inverted" size="md">
              <div className="flex items-center gap-3">
                <div>
                  <h6 className="text-sm font-semibold text-foreground">
                    {strategy === 'mobile' ? 'Mobile' : 'Desktop'}
                  </h6>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </Badge>
          </div>

          <Badge className="capitalize bg-[#ffd3ad] text-stone-900 font-bold tabular-nums" variant="default" size="md">
            {overallScore}
          </Badge>
        </div>

        <div className="flex flex-col z-20 items-start gap-4 md:gap-6 w-full">
          <div className="relative grid flex-1 grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {scoreItems.map((item) => (
              <ScoreBar key={item.label} score={item.score} label={item.label} />
            ))}
          </div>
        </div>
      </Card>
    </Frame>
  )
}
