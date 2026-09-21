'use client'

import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/primitives/avatar'
import { Card } from '@/registry/primitives/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/primitives/collapsible'
import { Frame, FrameFooter, FrameHeader, FramePanel } from '@/registry/primitives/frame'
import { Spinner } from '@/registry/primitives/spinner'
import { Check, ChevronRight, Circle, X } from '@keyline-icons/react'
import { bloom, confirm, droplet, loading, page, ready, sparkle, tap, tick } from '@usespaceui/sounds'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { motion } from 'motion/react'
import * as React from 'react'
import {
  DEPLOY_FLOWS,
  type DeployFlow,
  type DeployFlowKey,
  type DeployPipelineFrame,
  type DeployPipelineStep,
  type DeployPipelineStepState,
} from './data'

const safeSound = (fn: () => void) => {
  if (typeof window === 'undefined') return
  try {
    fn()
  } catch {}
}

export type { DeployFlow, DeployFlowKey, DeployPipelineFrame, DeployPipelineStep, DeployPipelineStepState }

function PipelineStatusIcon({ status }: { status: string }) {
  return (
    <MorphIcon activeKey={status} variant="blur-scale" duration={0.25}>
      {status === 'completed' ? (
        <Check className="size-3.5" />
      ) : status === 'active' ? (
        <Spinner className="size-3.5" />
      ) : status === 'failed' ? (
        <X className="size-3.5 text-rose-500 dark:text-rose-400" />
      ) : (
        <Circle className="size-3.5" />
      )}
    </MorphIcon>
  )
}

function PipelineStatusBadge({ status, duration }: { status: string; duration: string }) {
  const variant =
    status === 'completed' ? 'success' : status === 'active' ? 'info' : status === 'failed' ? 'error' : 'warning'

  return (
    <Badge variant={variant} size="xs" squircle>
      {duration}
    </Badge>
  )
}

export interface DeployPipelineProps {
  /** Selected deploy flow key ('production' | 'test_failed' | 'canary_rollback' | 'hotfix') */
  flow?: DeployFlowKey | string
  /** Whether to cycle through all flows across consecutive runs (default: true). If false, replays the same flow. */
  cycleFlows?: boolean
  /** Steps rendered in the pipeline. Defaults to the active flow's steps. */
  steps?: DeployPipelineStep[]
  /** Keyframes the pipeline auto-advances through. Defaults to the active flow's cycle. */
  cycle?: DeployPipelineFrame[]
  /** Override title for the current deployment */
  title?: string
  /** Override branch for the current deployment */
  branch?: string
  /** Override commit hash for the current deployment */
  commit?: string
  /** Animation state ('active' | 'inactive') or boolean. When inactive, pipeline halts. */
  animation?: 'active' | 'inactive' | boolean
  /** Auto-advance through `cycle` on a timer and loop cleanly. */
  autoPlay?: boolean
  /** Explicitly pause the pipeline. */
  paused?: boolean
  /** Pause auto-advance while the pointer is over the pipeline. */
  pauseOnHover?: boolean
  /** Multiplier applied to each frame's duration (2 = twice as fast). */
  speed?: number
  /** Target number of sequence cycles to execute before halting (used by recorder) */
  targetLoops?: number
  /** Callback fired when targetLoops sequence cycles have completed */
  onSequenceComplete?: () => void
  className?: string
}

export function DeployPipeline({
  flow = 'production',
  cycleFlows = true,
  steps,
  cycle,
  title,
  branch,
  commit,
  animation = 'active',
  autoPlay = true,
  paused,
  pauseOnHover = true,
  speed = 1,
  targetLoops,
  onSequenceComplete,
  className,
}: DeployPipelineProps) {
  const isAnimated = animation !== 'inactive' && animation !== false
  const flowKeys = React.useMemo(() => Object.keys(DEPLOY_FLOWS) as DeployFlowKey[], [])

  const [currentFlowIdx, setCurrentFlowIdx] = React.useState(() => {
    const idx = flowKeys.indexOf(flow as DeployFlowKey)
    return idx >= 0 ? idx : 0
  })

  // Synchronize when the flow prop changes externally
  React.useEffect(() => {
    const idx = flowKeys.indexOf(flow as DeployFlowKey)
    if (idx >= 0) {
      setCurrentFlowIdx(idx)
    }
  }, [flow, flowKeys])

  const activeFlowKey = flowKeys[currentFlowIdx] ?? 'production'
  const currentFlow = DEPLOY_FLOWS[activeFlowKey] ?? DEPLOY_FLOWS.production

  const activeSteps = steps ?? currentFlow.steps
  const activeCycle = cycle ?? currentFlow.cycle
  const activeTitle = title ?? currentFlow.title
  const activeBranch = branch ?? currentFlow.branch
  const activeCommit = commit ?? currentFlow.commit

  const [cycleIndex, setCycleIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)
  const [blinkTrigger, setBlinkTrigger] = React.useState(0)
  const [openSteps, setOpenSteps] = React.useState<Record<number, boolean>>({ 1: true })
  const lastActiveStepRef = React.useRef<number | null>(null)
  const loopTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedSequencesRef = React.useRef(0)
  const onSequenceCompleteRef = React.useRef(onSequenceComplete)
  React.useEffect(() => {
    onSequenceCompleteRef.current = onSequenceComplete
  }, [onSequenceComplete])

  const current = activeCycle[cycleIndex % activeCycle.length]
  const isPaused = !isAnimated || (paused ?? (pauseOnHover && isHovered))

  const isFinalFrame = cycleIndex === activeCycle.length - 1
  const isCurrentFailed = current?.steps.some((s) => s.status === 'failed') ?? false
  const isAllCompleted = current?.steps.every((s) => s.status === 'completed') ?? false

  // Reset cycle index when flow switches
  React.useEffect(() => {
    setCycleIndex(0)
    setOpenSteps({ 1: true })
    lastActiveStepRef.current = null
  }, [activeFlowKey])

  // Auto-expand step when it becomes active or failed
  React.useEffect(() => {
    if (current?.activeStep && current.activeStep !== lastActiveStepRef.current) {
      lastActiveStepRef.current = current.activeStep
      setOpenSteps({ [current.activeStep]: true })
    }
  }, [current?.activeStep])

  // Sound effects on step changes
  React.useEffect(() => {
    if (cycleIndex > 0) {
      setBlinkTrigger((prev) => prev + 1)
      const currentFrame = activeCycle[cycleIndex % activeCycle.length]
      const hasFailed = currentFrame?.steps.some((s) => s.status === 'failed')
      const allDone = currentFrame?.steps.every((s) => s.status === 'completed')

      if (hasFailed) {
        safeSound(droplet)
      } else if (allDone) {
        safeSound(confirm)
        setTimeout(() => safeSound(ready), 160)
        setTimeout(() => safeSound(sparkle), 340)
      } else {
        const hasActive = currentFrame?.steps.some((s) => s.status === 'active')
        if (hasActive) {
          safeSound(loading)
          setTimeout(() => safeSound(droplet), 90)
        } else {
          safeSound(bloom)
        }
      }
    }
  }, [cycleIndex, activeCycle])

  // Clear pending loop timeout
  React.useEffect(() => {
    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current)
        loopTimeoutRef.current = null
      }
    }
  }, [])

  // Auto-advance frames with cycling support
  React.useEffect(() => {
    if (isPaused || !current) return

    // If autoPlay is false and final frame is reached, halt
    if (!autoPlay && isFinalFrame) return

    const duration = Math.max(current.durationMs / Math.max(speed, 0.1), 50)

    if (isFinalFrame) {
      const willCompleteSequence = cycleFlows && flowKeys.length > 1 ? currentFlowIdx + 1 >= flowKeys.length : true
      const nextCompleted = completedSequencesRef.current + (willCompleteSequence ? 1 : 0)

      // At the end of the flow: advance to next flow or replay current
      if (autoPlay) {
        loopTimeoutRef.current = setTimeout(() => {
          if (targetLoops && targetLoops > 0 && willCompleteSequence && nextCompleted >= targetLoops) {
            completedSequencesRef.current = nextCompleted
            onSequenceCompleteRef.current?.()
            return
          }
          if (willCompleteSequence) {
            completedSequencesRef.current = nextCompleted
          }
          if (cycleFlows && flowKeys.length > 1) {
            setCurrentFlowIdx((prev) => (prev + 1) % flowKeys.length)
          } else {
            setCycleIndex(0)
          }
        }, duration)
      }
      return () => {
        if (loopTimeoutRef.current) {
          clearTimeout(loopTimeoutRef.current)
        }
      }
    }

    const timer = setTimeout(() => {
      setCycleIndex((prev) => prev + 1)
    }, duration)

    return () => clearTimeout(timer)
  }, [cycleIndex, isPaused, autoPlay, speed, current, isFinalFrame, cycleFlows, flowKeys.length])

  if (!current) return null

  return (
    <Frame
      onMouseEnter={() => {
        setIsHovered(true)
        if (pauseOnHover) safeSound(tick)
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex w-full max-w-md flex-col [corner-shape:superellipse(1.25)] rounded-3xl bg-muted p-1.5 select-none shadow-none font-open-runde',
        className,
      )}
    >
      <FrameHeader className="flex flex-row shrink-0 items-center justify-between gap-3 px-2 py-1.5 pb-2 border-none">
        <div className="flex items-center gap-2 min-w-0">
          <div
            onClick={() => safeSound(tap)}
            className="relative size-6 shrink-0 overflow-hidden rounded-full bg-background flex items-center justify-center shadow-none cursor-pointer"
          >
            <Squishmoji
              seed="deploy-pipeline"
              size={24}
              animate
              animWobble
              animOnHover
              animOnClick
              shape="all"
              expression="all"
              backgroundStyle="all"
              blinkTrigger={blinkTrigger}
              className="size-full"
            />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground">Deploy Pipeline</span>
        </div>

        <Badge
          size="xs"
          variant="secondary"
          squircle
          className="bg-background! text-foreground flex items-center gap-1.5 shadow-none"
        >
          <span className="relative flex justify-center items-center size-fit">
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping animation-duration-[2.25s]',
                isCurrentFailed
                  ? 'bg-rose-300'
                  : isAllDone(current)
                    ? 'bg-emerald-300'
                    : isPaused
                      ? 'bg-amber-300'
                      : 'bg-emerald-300',
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full size-2 animate-pulse',
                isCurrentFailed
                  ? 'bg-rose-500'
                  : isAllDone(current)
                    ? 'bg-emerald-500'
                    : isPaused
                      ? 'bg-amber-500'
                      : 'bg-emerald-500',
              )}
            />
          </span>
          <BlurRevealText
            as="span"
            text={isCurrentFailed ? 'Failed' : isAllDone(current) ? 'Passed' : isPaused ? 'Paused' : 'Deploying'}
            replayKey={`${isCurrentFailed}-${isAllDone(current)}-${isPaused}`}
            inView={false}
            once={false}
            delay={0}
            duration={0.22}
            blurAmount="0.3125rem"
            yOffset={2}
            className="inline-block text-[0.6875rem] font-medium text-foreground"
          />
        </Badge>
      </FrameHeader>

      <Card className="flex flex-col squircle rounded-[1.125rem] bg-background p-4 sm:p-5 border-none shadow-none">
        {/* Release Metadata Header */}
        {/* <div className="flex items-center justify-between gap-3 pb-3 border-none">
          <div className="flex min-w-0 items-center gap-2">
            <Badge
              variant="default"
              size="xs"
              squircle
              className="shrink-0 bg-muted px-1.5 py-0.5 text-[0.5625rem] font-medium text-muted-foreground uppercase shadow-none"
            >
              Release
            </Badge>
            <span className="truncate text-xs font-medium text-foreground">{activeTitle}</span>
          </div>
          <span className="shrink-0 text-[0.6875rem] text-muted-foreground font-mono font-normal">
            {activeBranch}@{activeCommit}
          </span>
        </div> */}

        <div className="w-full select-none">
          <Timeline value={current.activeStep}>
            {activeSteps.map((step, idx) => {
              const stepState = current.steps[idx]
              const isLineFilled = current.lines[idx] ?? false
              if (!stepState) return null

              const isLocked = stepState.status === 'pending'
              const isFailed = stepState.status === 'failed'
              const isOpen = !isLocked && Boolean(openSteps[step.id])
              const stepDescription = isFailed
                ? (step.errorDescription ?? step.completedDescription ?? step.description)
                : stepState.status === 'active'
                  ? (step.activeDescription ?? step.description)
                  : (step.completedDescription ?? step.description)

              const handleOpenChange = (open: boolean) => {
                if (isLocked) return
                safeSound(page)
                setOpenSteps((prev) => ({
                  ...prev,
                  [step.id]: open,
                }))
              }

              return (
                <TimelineItem key={step.id} step={step.id} className="ms-10 pb-5">
                  <TimelineHeader>
                    <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7 [&&]:!bg-primary/15 overflow-hidden rounded-full">
                      <motion.div
                        className={cn('w-full rounded-full origin-top', isFailed ? 'bg-rose-500' : 'bg-primary')}
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
                        stepState.status === 'failed' &&
                          '[&&]:bg-error [&&]:text-error-foreground ring-error/20 ring-2',
                        stepState.status === 'pending' && '[&&]:bg-muted [&&]:text-muted-foreground [&&]:ring-0',
                      )}
                    >
                      <PipelineStatusIcon status={stepState.status} />
                    </TimelineIndicator>
                  </TimelineHeader>
                  <TimelineContent className="mt-1.5">
                    <Frame>
                      <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="group/collapsible">
                        <CollapsibleTrigger
                          disabled={isLocked}
                          className={cn('flex w-full', isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                        >
                          <div className="flex grow flex-row items-center justify-between gap-2 p-1.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-5">
                                <AvatarImage src={step.user.avatar} alt={step.user.name} />
                                <AvatarFallback>{step.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-muted-foreground text-xs font-medium">{step.user.name}</span>
                            </div>
                            <ChevronRight
                              className={cn(
                                'text-muted-foreground size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90',
                                isLocked && 'opacity-30',
                              )}
                            />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <FramePanel className="p-2.5">
                            <p className="text-muted-foreground text-sm leading-relaxed">{stepDescription}</p>
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
      </Card>

      <FrameFooter className="flex shrink-0 items-center justify-between gap-3 px-3 py-1.5 pt-2 border-none">
        <div className="min-w-0 flex-1 text-xs">
          <span className="text-muted-foreground truncate block">
            {isCurrentFailed ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Pipeline halted on {activeSteps[current.activeStep - 1]?.title ?? 'step'}
              </span>
            ) : isAllDone(current) ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                All pipeline stages successfully passed
              </span>
            ) : (
              <span>
                Running stage {current.activeStep} of {activeSteps.length} ·{' '}
                <span className="text-foreground font-medium">{activeSteps[current.activeStep - 1]?.title}</span>
              </span>
            )}
          </span>
        </div>
        <Badge
          variant="default"
          size="xs"
          squircle
          className="shrink-0 bg-background text-muted-foreground font-medium text-[0.625rem]"
        >
          {activeSteps.length} steps
        </Badge>
      </FrameFooter>
    </Frame>
  )
}

function isAllDone(frame: DeployPipelineFrame): boolean {
  return frame.steps.every((s) => s.status === 'completed')
}

export default DeployPipeline

export { DEPLOY_FLOWS }
