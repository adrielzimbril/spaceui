'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { IconCheck, IconCircle, IconChevronRight } from '@tabler/icons-react'
import { Frame, FrameHeader, FramePanel } from '@/registry/primitives/frame'
import { Card, CardPanel } from '@/registry/primitives/card'
import { Badge } from '@/registry/primitives/badge'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { Spinner } from '@/registry/primitives/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/primitives/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/primitives/collapsible'
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/registry/components/spaceui/timeline'
import { cn } from '@/registry/lib/utils'

export type DeployPipelineStep = {
  id: number
  title: string
  user: { name: string; avatar: string }
  description: string
}

export type DeployPipelineStepState = {
  status: 'completed' | 'active' | 'pending'
  duration: string
}

export type DeployPipelineFrame = {
  activeStep: number
  steps: DeployPipelineStepState[]
  lines: boolean[]
  durationMs: number
}

const defaultSteps: DeployPipelineStep[] = [
  {
    id: 1,
    title: 'Source Code Checkout',
    user: {
      name: 'Alex Johnson',
      avatar: 'https://avatars.spaceui.one/v1?name=pluto&variant=shaula',
    },
    description: 'Successfully fetched latest changes from the main branch.',
  },
  {
    id: 2,
    title: 'Dependency Installation',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://avatars.spaceui.one/v1?name=neptune&variant=singularity',
    },
    description: 'All npm packages installed and cached for future builds.',
  },
  {
    id: 3,
    title: 'Unit & Integration Tests',
    user: {
      name: 'Michael Rodriguez',
      avatar: 'https://avatars.spaceui.one/v1?name=uranus&variant=triton',
    },
    description: 'Running 142 test suites across the entire codebase...',
  },
  {
    id: 4,
    title: 'Production Build',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://avatars.spaceui.one/v1?name=earth&variant=solar-flare',
    },
    description: 'Optimizing assets and generating static site pages.',
  },
]

const defaultCycle: DeployPipelineFrame[] = [
  {
    activeStep: 3,
    durationMs: 3000,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, false],
  },
  {
    activeStep: 3,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, true],
  },
  {
    activeStep: 4,
    durationMs: 2800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'active', duration: 'Running' },
    ],
    lines: [true, true, true],
  },
  {
    activeStep: 4,
    durationMs: 3500,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'completed', duration: '38s' },
      { status: 'completed', duration: '2m 45s' },
    ],
    lines: [true, true, true],
  },
  {
    activeStep: 1,
    durationMs: 2400,
    steps: [
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [false, false, false],
  },
  {
    activeStep: 1,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, false, false],
  },
  {
    activeStep: 2,
    durationMs: 2600,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'active', duration: 'Running' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, false, false],
  },
  {
    activeStep: 2,
    durationMs: 800,
    steps: [
      { status: 'completed', duration: '12s' },
      { status: 'completed', duration: '1m 45s' },
      { status: 'pending', duration: 'Pending' },
      { status: 'pending', duration: 'Pending' },
    ],
    lines: [true, true, false],
  },
]

function PipelineStatusIcon({ status }: { status: string }) {
  return (
    <MorphIcon activeKey={status} variant="blur-scale" duration={0.25}>
      {status === 'completed' ? (
        <IconCheck className="size-3.5" />
      ) : status === 'active' ? (
        <Spinner className="size-3.5" />
      ) : (
        <IconCircle className="size-3.5" />
      )}
    </MorphIcon>
  )
}

function PipelineStatusBadge({ status, duration }: { status: string; duration: string }) {
  const variant = status === 'completed' ? 'success' : status === 'active' ? 'info' : 'warning'

  return (
    <Badge variant={variant} size="sm">
      {duration}
    </Badge>
  )
}

export interface DeployPipelineProps {
  /** Steps rendered in the pipeline. Defaults to a sample CI/CD pipeline. */
  steps?: DeployPipelineStep[]
  /** Keyframes the pipeline auto-advances through. Must line up with `steps`. */
  cycle?: DeployPipelineFrame[]
  /** Auto-advance through `cycle` on a timer. */
  autoPlay?: boolean
  /** Pause auto-advance while the pointer is over the pipeline. */
  pauseOnHover?: boolean
  /** Multiplier applied to each frame's duration (2 = twice as fast). */
  speed?: number
  className?: string
}

export function DeployPipeline({
  steps = defaultSteps,
  cycle = defaultCycle,
  autoPlay = true,
  pauseOnHover = true,
  speed = 1,
  className,
}: DeployPipelineProps) {
  const [cycleIndex, setCycleIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const current = cycle[cycleIndex % cycle.length]
  const isPaused = !autoPlay || (pauseOnHover && isHovered)

  React.useEffect(() => {
    if (isPaused || !current) return

    const duration = Math.max(current.durationMs / Math.max(speed, 0.1), 50)
    const timer = setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % cycle.length)
    }, duration)

    return () => clearTimeout(timer)
  }, [cycleIndex, isPaused, speed, current, cycle.length])

  if (!current) return null

  return (
    <Card className={cn('flex flex-col rounded-xl before:rounded-xl overflow-hidden', className)}>
      <CardPanel className="flex min-h-72 max-h-[26rem] overflow-y-auto p-2 sm:p-3 rounded-lg [&::-webkit-scrollbar]:hidden">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full max-w-lg select-none"
        >
          <Timeline value={current.activeStep}>
            {steps.map((step, idx) => {
              const stepState = current.steps[idx]
              const isLineFilled = current.lines[idx] ?? false
              if (!stepState) return null

              return (
                <TimelineItem key={step.id} step={step.id} className="ms-10 pb-5">
                  <TimelineHeader>
                    <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7 [&&]:!bg-primary/15 overflow-hidden rounded-full">
                      <motion.div
                        className="w-full bg-primary rounded-full origin-top"
                        initial={false}
                        animate={{
                          scaleY: isLineFilled ? 1 : 0,
                          opacity: isLineFilled ? 1 : 0,
                        }}
                        transition={{
                          scaleY: {
                            duration: isLineFilled ? 0.7 : 0.15,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: {
                            duration: isLineFilled ? 0.05 : 0.15,
                          },
                        }}
                        style={{
                          height: '100%',
                          transformOrigin: 'top',
                        }}
                      />
                    </TimelineSeparator>
                    <div className="flex items-center gap-2">
                      <TimelineTitle className="text-sm font-semibold">{step.title}</TimelineTitle>
                      <PipelineStatusBadge status={stepState.status} duration={stepState.duration} />
                    </div>
                    <TimelineIndicator
                      className={cn(
                        'flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7 transition-all duration-300',
                        stepState.status === 'completed' && '[&&]:bg-primary [&&]:text-primary-foreground [&&]:ring-0',
                        stepState.status === 'active' &&
                          '[&&]:bg-primary [&&]:text-primary-foreground ring-primary/20 ring-2',
                        stepState.status === 'pending' && '[&&]:bg-muted [&&]:text-muted-foreground [&&]:ring-0',
                      )}
                    >
                      <PipelineStatusIcon status={stepState.status} />
                    </TimelineIndicator>
                  </TimelineHeader>
                  <TimelineContent className="mt-1.5">
                    <Frame>
                      <Collapsible defaultOpen className="group/collapsible">
                        <CollapsibleTrigger className="flex w-full cursor-pointer">
                          <FrameHeader className="flex grow flex-row items-center justify-between gap-2 p-1.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-5">
                                <AvatarImage src={step.user.avatar} alt={step.user.name} />
                                <AvatarFallback>{step.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-muted-foreground text-xs font-medium">{step.user.name}</span>
                            </div>
                            <IconChevronRight className="text-muted-foreground size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                          </FrameHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <FramePanel className="p-2.5">
                            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                          </FramePanel>
                        </CollapsibleContent>
                      </Collapsible>
                    </Frame>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        </div>
      </CardPanel>
    </Card>
  )
}
