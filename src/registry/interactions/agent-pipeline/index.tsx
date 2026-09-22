'use client'

import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { SmoothSlider } from '@/registry/components/spaceui/smooth-slider'
import { cn } from '@/registry/lib/utils'
import { Card } from '@/registry/primitives/card'
import { Frame, FrameFooter, FrameHeader, FramePanel, FrameTitle } from '@/registry/primitives/frame'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { capitalizeText, randomWord } from '@/registry/utils/format-text'
import { Check } from '@keyline-icons/react'
import { bloom, deny, ready, whisper } from '@usespaceui/sounds'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react'
import * as React from 'react'
import { AGENT_PRESETS, type AgentFlow, type AgentStep, type PresetKey } from './data'

const safeSound = (fn: () => void) => {
  if (typeof window === 'undefined') return
  try {
    fn()
  } catch {}
}

export type PipelineStatus = 'idle' | 'running' | 'paused' | 'done' | 'error'

export interface AgentLogEvent {
  id: string
  atS: number
  at: number
  label: string
  detail: string
  final?: boolean
  kind: 'milestone' | 'step' | 'error'
}

export interface AgentPipelineProps {
  /** Selected preset key ('incident' | 'codereview' | 'support' | 'growth') */
  preset?: PresetKey | string
  /** Selected flow variant ('success' | 'error') */
  flow?: 'success' | 'error' | string
  /** Whether to cycle through all presets across consecutive runs (default: false). When true, moves to next preset. */
  cyclePresets?: boolean
  /** Alias for cyclePresets */
  cyclePreset?: boolean
  /** Whether to cycle through all flows across consecutive runs (default: true). If false, replays the same flow. */
  cycleFlows?: boolean
  /** Whether the pipeline should loop upon completing (alias for autoPlay behavior) */
  loop?: boolean
  /** The title of the task being executed by the agents (overrides preset taskTitle) */
  taskTitle?: string
  /** The execution run identifier (if omitted, dynamically generates sp_XXXX each run) */
  runId?: string
  /** Custom sequence of agents (overrides preset agents) */
  agents?: AgentStep[]
  /** Animation state ('active' | 'inactive') or boolean. When inactive, pipeline halts. */
  animation?: 'active' | 'inactive' | boolean
  /** Whether the pipeline should automatically begin playing and looping */
  autoPlay?: boolean
  /** Explicitly pause or resume the pipeline */
  paused?: boolean
  /** Pause auto-advance while pointer is over the pipeline */
  pauseOnHover?: boolean
  /** Speed multiplier for pipeline execution */
  speed?: number
  /** Time in seconds between agent relays during transfer */
  travelDuration?: number
  /** Target number of sequence cycles to execute before halting (used by recorder) */
  targetLoops?: number
  /** Callback fired when targetLoops sequence cycles have completed */
  onSequenceComplete?: () => void
  /** Additional CSS class names */
  className?: string
}

interface AgentNodeProps {
  agent: AgentStep
  state: 'idle' | 'active' | 'done' | 'error'
  blinkTrigger: number
}

function AgentNode({ agent, state, blinkTrigger }: AgentNodeProps) {
  const isActive = state === 'active'
  const isDone = state === 'done'
  const isError = state === 'error'

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0 text-center">
      <div className="relative">
        <div
          className={cn(
            'relative flex items-center justify-center size-14 [corner-shape:superellipse(1.25)] rounded-2xl bg-muted transition-all duration-200 shadow-none',
            (isDone || isActive) && 'ring-2 ring-offset-2 ring-offset-background ring-muted',
            // isDone && 'ring-2 ring-offset-2 ring-offset-background ring-primary/10',
            isError && 'ring-2 ring-offset-2 ring-offset-background ring-rose-400',
          )}
        >
          <Squishmoji
            seed={agent.seed}
            size={30}
            animate
            // animWobble
            animOnHover
            animOnClick
            shape="all"
            expression="all"
            backgroundStyle="all"
            blinkTrigger={blinkTrigger}
            className="scale-175 origin-center"
          />
        </div>

        <AnimatePresence initial={false}>
          {isDone && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-none"
            >
              <Check size={10} strokeWidth={3.5} />
            </motion.span>
          )}
          {isError && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-rose-500 text-white ring-2 ring-background shadow-none font-bold text-[0.625rem]"
            >
              !
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center text-center w-full px-1">
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-200 truncate max-w-full',
            isActive && 'text-foreground font-semibold',
            isDone && 'text-foreground',
            state === 'idle' && 'text-muted-foreground',
          )}
        >
          {agent.name}
        </span>
        <span className="text-[0.5625rem] font-medium text-muted-foreground truncate max-w-full">{agent.role}</span>
      </div>
    </div>
  )
}

export function AgentPipeline({
  preset = 'incident',
  flow = 'success',
  cyclePresets = true,
  cyclePreset,
  cycleFlows = true,
  taskTitle,
  runId,
  agents,
  animation = 'active',
  autoPlay = true,
  paused,
  pauseOnHover = true,
  speed = 1,
  travelDuration = 0.7,
  targetLoops,
  onSequenceComplete,
  className,
}: AgentPipelineProps) {
  const isAnimated = animation !== 'inactive' && animation !== false
  const [status, setStatus] = React.useState<PipelineStatus>('idle')
  const [pipelineState, setPipelineState] = React.useState({
    active: 0,
    done: 0,
    travel: -1,
    errorAgent: -1,
  })
  const [logs, setLogs] = React.useState<AgentLogEvent[]>([])
  const [pausedAt, setPausedAt] = React.useState(0)
  const [blinkTrigger, setBlinkTrigger] = React.useState(0)
  const [progressVal, setProgressVal] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const contentRef = React.useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = React.useState<number | undefined>(undefined)

  React.useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
      if (h > 0) {
        setContentHeight(Math.round(h))
      }
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Dynamic runId generator: sp_XXXX using randomWord from format-text
  const [generatedRunId, setGeneratedRunId] = React.useState(
    () => `sp_${randomWord({ length: 4, alphanumeric: true })}`,
  )
  const activeRunId = runId ?? generatedRunId

  // Resolve active preset and flow
  const shouldCyclePresets = cyclePreset !== undefined ? Boolean(cyclePreset) : Boolean(cyclePresets)
  const shouldCycleFlows = Boolean(cycleFlows)

  const [currentPresetKey, setCurrentPresetKey] = React.useState<PresetKey>(() =>
    (preset as PresetKey) in AGENT_PRESETS ? (preset as PresetKey) : 'incident',
  )

  const activePreset = AGENT_PRESETS[currentPresetKey] ?? AGENT_PRESETS.incident
  const availableFlows = activePreset.flows

  const [currentFlowIdx, setCurrentFlowIdx] = React.useState(() => {
    const idx = availableFlows.findIndex((f) => f.id === flow)
    return idx >= 0 ? idx : 0
  })

  // Track previous prop values to avoid overriding internal cycling states
  const prevPresetPropRef = React.useRef(preset)
  const prevFlowPropRef = React.useRef(flow)
  const prevCyclePresetsPropRef = React.useRef(shouldCyclePresets)
  const prevCycleFlowsPropRef = React.useRef(shouldCycleFlows)

  // Synchronize only when the preset prop changes externally or cycling is turned off
  React.useEffect(() => {
    const presetChanged = prevPresetPropRef.current !== preset
    const cycleTurnedOff = prevCyclePresetsPropRef.current && !shouldCyclePresets
    prevPresetPropRef.current = preset
    prevCyclePresetsPropRef.current = shouldCyclePresets

    if ((presetChanged || cycleTurnedOff) && preset && preset in AGENT_PRESETS) {
      setCurrentPresetKey(preset as PresetKey)
      setCurrentFlowIdx(0)
    }
  }, [preset, shouldCyclePresets])

  // Synchronize only when the flow prop changes externally or flow cycling is turned off
  React.useEffect(() => {
    const flowChanged = prevFlowPropRef.current !== flow
    const cycleTurnedOff = prevCycleFlowsPropRef.current && !shouldCycleFlows
    prevFlowPropRef.current = flow
    prevCycleFlowsPropRef.current = shouldCycleFlows

    if (flowChanged || cycleTurnedOff) {
      const activeP = AGENT_PRESETS[currentPresetKey] ?? AGENT_PRESETS.incident
      const idx = activeP.flows.findIndex((f) => f.id === flow)
      if (idx >= 0) {
        setCurrentFlowIdx(idx)
      }
    }
  }, [flow, shouldCycleFlows, currentPresetKey])

  const activeFlow = availableFlows[currentFlowIdx] ?? availableFlows[0]
  const currentTitle = taskTitle ?? activeFlow.taskTitle
  const currentAgents = agents ?? activeFlow.agents

  const isPaused = !isAnimated || (paused ?? (pauseOnHover && isHovered))

  const progressMotion = useMotionValue(0)
  const lineMotion = useMotionValue(0)
  const animControlsRef = React.useRef<AnimationPlaybackControls | null>(null)
  const isRunningRef = React.useRef(false)
  const eventCursorRef = React.useRef(0)
  const loopTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const autoPlayRef = React.useRef(autoPlay)
  const isAnimatedRef = React.useRef(isAnimated)
  const isPausedRef = React.useRef(isPaused)
  const cycleFlowsRef = React.useRef(cycleFlows)
  const cyclePresetsRef = React.useRef(shouldCyclePresets)
  const completedSequencesRef = React.useRef(0)
  const onSequenceCompleteRef = React.useRef(onSequenceComplete)
  React.useEffect(() => {
    onSequenceCompleteRef.current = onSequenceComplete
  }, [onSequenceComplete])

  const logContainerRef = React.useRef<HTMLDivElement>(null)
  const scrollBottomRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom of the activity log when new items arrive
  React.useEffect(() => {
    if (logs.length === 0) {
      const viewport = logContainerRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null
      if (viewport) {
        viewport.scrollTop = 0
      }
      return
    }

    const timer = setTimeout(() => {
      const viewport = logContainerRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        })
      } else if (scrollBottomRef.current) {
        scrollBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 16)

    return () => clearTimeout(timer)
  }, [logs])

  React.useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  React.useEffect(() => {
    isAnimatedRef.current = isAnimated
  }, [isAnimated])

  React.useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  React.useEffect(() => {
    cycleFlowsRef.current = shouldCycleFlows
  }, [shouldCycleFlows])

  React.useEffect(() => {
    cyclePresetsRef.current = shouldCyclePresets
  }, [shouldCyclePresets])

  // Calculate timeline markers and schedules from current flow agents
  const { segments, allEvents, rawDuration, hasError, errorAgentIdx } = React.useMemo(() => {
    const segs: Array<{
      kind: 'work' | 'travel'
      idx: number
      from: number
      to: number
      pFrom: number
      pTo: number
    }> = []
    const evts: AgentLogEvent[] = []

    let elapsed = 0
    let encounteredError = false
    let errAgent = -1

    evts.push({
      id: 'start',
      atS: 0,
      at: 0,
      label: 'Run started',
      detail: `Task assigned to ${currentAgents[0]?.name ?? 'first agent'}`,
      kind: 'milestone',
    })

    const numAgents = currentAgents.length

    for (let i = 0; i < currentAgents.length; i++) {
      const agent = currentAgents[i]
      const workStart = elapsed

      const agentSliceStart = numAgents > 0 ? i / numAgents : 0
      const agentSliceEnd = numAgents > 0 ? (i + 1) / numAgents : 1
      const agentSliceSize = agentSliceEnd - agentSliceStart

      const hasTravel = i < currentAgents.length - 1 && !agent.isError
      const totalAgentTime = agent.workS + (hasTravel ? travelDuration : 0)
      const workFrac = totalAgentTime > 0 ? agent.workS / totalAgentTime : 1
      const workPEnd = agentSliceStart + workFrac * agentSliceSize

      if (agent.isError) {
        encounteredError = true
        errAgent = i
        const errStepIdx = agent.errorStepIndex ?? Math.max(0, agent.steps.length - 1)

        for (let sIdx = 0; sIdx <= errStepIdx; sIdx++) {
          const stepDesc = agent.steps[sIdx]
          const isErrorStep = sIdx === errStepIdx
          const stepTime = workStart + agent.workS * ((sIdx + 1) / (errStepIdx + 2))

          evts.push({
            id: `${agent.id}-step-${sIdx}`,
            atS: stepTime,
            at: 0,
            label: agent.name,
            detail: isErrorStep ? (agent.errorNote ?? stepDesc) : stepDesc,
            kind: isErrorStep ? 'error' : 'step',
          })
        }

        elapsed += agent.workS
        segs.push({
          kind: 'work',
          idx: i,
          from: workStart,
          to: elapsed,
          pFrom: agentSliceStart,
          pTo: workPEnd,
        })
        break
      }

      // Normal execution steps
      agent.steps.forEach((stepDesc, sIdx) => {
        const stepTime = workStart + agent.workS * ((sIdx + 1) / (agent.steps.length + 1))
        evts.push({
          id: `${agent.id}-step-${sIdx}`,
          atS: stepTime,
          at: 0,
          label: agent.name,
          detail: stepDesc,
          kind: 'step',
        })
      })

      elapsed += agent.workS
      segs.push({
        kind: 'work',
        idx: i,
        from: workStart,
        to: elapsed,
        pFrom: agentSliceStart,
        pTo: workPEnd,
      })

      if (i < currentAgents.length - 1) {
        const travelStart = elapsed
        evts.push({
          id: `relay-${agent.id}`,
          atS: travelStart,
          at: 0,
          label: `${agent.name} → ${currentAgents[i + 1]?.name}`,
          detail: agent.note,
          kind: 'milestone',
        })

        elapsed += travelDuration
        segs.push({
          kind: 'travel',
          idx: i,
          from: travelStart,
          to: elapsed,
          pFrom: workPEnd,
          pTo: agentSliceEnd,
        })
      }
    }

    const duration = Math.max(elapsed, 0.5)

    if (!encounteredError) {
      evts.push({
        id: 'done',
        atS: duration,
        at: 1,
        label: 'Approved',
        detail: currentAgents[currentAgents.length - 1]?.note ?? 'Completed',
        final: true,
        kind: 'milestone',
      })
    }

    // Normalize relative positions to 0..1
    evts.forEach((e) => {
      e.at = duration > 0 ? e.atS / duration : 1
    })
    segs.forEach((s) => {
      s.from = duration > 0 ? s.from / duration : 0
      s.to = duration > 0 ? s.to / duration : 1
    })

    return {
      segments: segs,
      allEvents: evts,
      rawDuration: duration,
      hasError: encounteredError,
      errorAgentIdx: errAgent,
    }
  }, [currentAgents, travelDuration])

  // Continuous tracking progress: no freezes, no jumps, speed adapting smoothly per step
  const getSpatialProgress = React.useCallback(
    (p: number) => {
      if (segments.length === 0) return 0

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        const isLast = i === segments.length - 1
        if (p < seg.to || isLast) {
          const segDuration = seg.to - seg.from
          const fraction = segDuration > 0 ? Math.min(1, Math.max(0, (p - seg.from) / segDuration)) : 1
          return seg.pFrom + fraction * (seg.pTo - seg.pFrom)
        }
      }

      return 1
    },
    [segments],
  )

  // Map physical / slider progress (0..1) back to temporal progress (0..1) for slider interaction
  const getTimeProgress = React.useCallback(
    (spatial: number) => {
      if (segments.length === 0) return 0
      const clamped = Math.min(1, Math.max(0, spatial))

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        const isLast = i === segments.length - 1
        if (clamped <= seg.pTo || isLast) {
          const segSpatialDist = seg.pTo - seg.pFrom
          const fraction = segSpatialDist > 0 ? Math.min(1, Math.max(0, (clamped - seg.pFrom) / segSpatialDist)) : 0
          return seg.from + fraction * (seg.to - seg.from)
        }
      }

      return 1
    },
    [segments],
  )

  const timerText = useTransform(progressMotion, (p) => `${(p * rawDuration).toFixed(1)}s`)

  // Listen to motion updates
  useMotionValueEvent(progressMotion, 'change', (p) => {
    const clampedP = Math.min(1, Math.max(0, p))
    const spatialP = getSpatialProgress(clampedP)
    lineMotion.set(spatialP)
    setProgressVal(Math.min(100, Math.max(0, Math.round(spatialP * 100))))

    if (isRunningRef.current) {
      while (eventCursorRef.current < allEvents.length && clampedP >= allEvents[eventCursorRef.current].at - 1e-4) {
        const item = allEvents[eventCursorRef.current]
        eventCursorRef.current += 1
        setLogs((prev) => [...prev, item])
        if (item.kind === 'milestone') {
          setBlinkTrigger((prev) => prev + 1)
          if (item.id === 'start') {
            safeSound(whisper)
          } else if (item.final) {
            safeSound(ready)
          } else {
            safeSound(bloom)
          }
        } else if (item.kind === 'error') {
          setBlinkTrigger((prev) => prev + 1)
          safeSound(deny)
        }
      }
    }

    let found = false
    for (const seg of segments) {
      if (clampedP < seg.to) {
        const nextState =
          seg.kind === 'work'
            ? { active: seg.idx, done: seg.idx, travel: -1, errorAgent: -1 }
            : { active: -1, done: seg.idx + 1, travel: seg.idx, errorAgent: -1 }
        setPipelineState((prev) => {
          return prev.active === nextState.active &&
            prev.done === nextState.done &&
            prev.travel === nextState.travel &&
            prev.errorAgent === nextState.errorAgent
            ? prev
            : nextState
        })
        found = true
        break
      }
    }

    if (!found) {
      setPipelineState((prev) => ({
        active: hasError ? errorAgentIdx : -1,
        done: hasError ? errorAgentIdx : currentAgents.length,
        travel: -1,
        errorAgent: hasError ? errorAgentIdx : -1,
      }))
    }
  })

  const stopAnimation = React.useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current)
      loopTimeoutRef.current = null
    }
    if (animControlsRef.current) {
      animControlsRef.current.stop()
      animControlsRef.current = null
    }
    isRunningRef.current = false
  }, [])

  React.useEffect(() => {
    return () => stopAnimation()
  }, [stopAnimation])

  const startPipeline = React.useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current)
      loopTimeoutRef.current = null
    }
    stopAnimation()

    // Generate new random runId on each run if no runId was passed as prop
    if (!runId) {
      setGeneratedRunId(`sp_${randomWord({ length: 4, alphanumeric: true })}`)
    }

    progressMotion.jump(0)
    lineMotion.jump(0)
    eventCursorRef.current = 0
    setLogs([])
    setPipelineState({ active: 0, done: 0, travel: -1, errorAgent: -1 })
    isRunningRef.current = true
    setStatus('running')

    const effectiveDuration = rawDuration / Math.max(speed, 0.1)
    const controls = animate(progressMotion, 1, {
      duration: effectiveDuration,
      ease: 'linear',
      onComplete: () => {
        isRunningRef.current = false

        if (hasError) {
          setStatus('error')
          setBlinkTrigger((prev) => prev + 1)
          const finalSpatial = getSpatialProgress(1)
          lineMotion.set(finalSpatial)
          setProgressVal(Math.round(finalSpatial * 100))
          setPipelineState((prev) => ({
            ...prev,
            active: -1,
            errorAgent: errorAgentIdx,
          }))
        } else {
          setStatus('done')
          lineMotion.set(1)
          setProgressVal(100)
          setBlinkTrigger((prev) => prev + 1)
        }
      },
    })

    animControlsRef.current = controls
  }, [progressMotion, stopAnimation, rawDuration, speed, runId, hasError, errorAgentIdx])

  const advanceLoop = React.useCallback(() => {
    const presetKeys = Object.keys(AGENT_PRESETS) as PresetKey[]
    const currentPreset = AGENT_PRESETS[currentPresetKey] ?? AGENT_PRESETS.incident
    const flows = currentPreset.flows
    const willCyclePresets = cyclePresetsRef.current
    const willCycleFlows = cycleFlowsRef.current

    if (willCyclePresets && willCycleFlows) {
      // 1. Advance flow; if at end of flows for this preset, advance to next preset and reset flow to 0
      if (currentFlowIdx + 1 < flows.length) {
        setCurrentFlowIdx((prev) => prev + 1)
      } else {
        const currentPIdx = presetKeys.indexOf(currentPresetKey)
        const nextPIdx = (currentPIdx + 1) % presetKeys.length
        setCurrentPresetKey(presetKeys[nextPIdx])
        setCurrentFlowIdx(0)
      }
    } else if (willCyclePresets && !willCycleFlows) {
      // 2. Advance to next preset, maintain current flow selection or clamp
      const currentPIdx = presetKeys.indexOf(currentPresetKey)
      const nextPIdx = (currentPIdx + 1) % presetKeys.length
      setCurrentPresetKey(presetKeys[nextPIdx])
    } else if (!willCyclePresets && willCycleFlows) {
      // 3. Cycle flows within current preset only
      if (flows.length > 1) {
        setCurrentFlowIdx((prev) => (prev + 1) % flows.length)
      } else {
        startPipeline()
      }
    } else {
      // 4. Replay same flow and preset
      startPipeline()
    }
  }, [currentPresetKey, currentFlowIdx, startPipeline])

  const advanceLoopRef = React.useRef(advanceLoop)
  React.useEffect(() => {
    advanceLoopRef.current = advanceLoop
  }, [advanceLoop])

  // Sync speed changes live without restarting the animation
  React.useEffect(() => {
    if (animControlsRef.current) {
      animControlsRef.current.speed = Math.max(speed, 0.1)
    }
  }, [speed])

  React.useEffect(() => {
    if (!isAnimated || isPaused) return
    if (status === 'idle') {
      const timer = setTimeout(() => {
        startPipeline()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [status, isAnimated, isPaused, startPipeline])

  // Handle preset or flow changes to restart cleanly
  React.useEffect(() => {
    if (status !== 'idle' && !isPaused) {
      startPipeline()
    }
  }, [currentPresetKey, currentFlowIdx, startPipeline])

  // Loop timer: when pipeline finishes (done or error), advance loop after delay if autoPlay is active
  React.useEffect(() => {
    if ((status === 'done' || status === 'error') && autoPlay && isAnimated && !isPaused) {
      const presetKeys = Object.keys(AGENT_PRESETS) as PresetKey[]
      const currentPreset = AGENT_PRESETS[currentPresetKey] ?? AGENT_PRESETS.incident
      const flows = currentPreset.flows
      const willCyclePresets = cyclePresetsRef.current
      const willCycleFlows = cycleFlowsRef.current

      // Check if this run finishes 1 sequence cycle
      let finishesCycle = false
      if (willCyclePresets && willCycleFlows) {
        const isLastFlow = currentFlowIdx + 1 >= flows.length
        const currentPIdx = presetKeys.indexOf(currentPresetKey)
        const isLastPreset = currentPIdx === presetKeys.length - 1
        finishesCycle = isLastFlow && isLastPreset
      } else if (willCyclePresets && !willCycleFlows) {
        const currentPIdx = presetKeys.indexOf(currentPresetKey)
        finishesCycle = currentPIdx === presetKeys.length - 1
      } else if (!willCyclePresets && willCycleFlows) {
        finishesCycle = currentFlowIdx + 1 >= flows.length
      } else {
        finishesCycle = true
      }

      const nextCompleted = completedSequencesRef.current + (finishesCycle ? 1 : 0)

      const delay = (status === 'error' ? 2200 : 1800) / Math.max(speed, 0.1)
      const timer = setTimeout(() => {
        if (targetLoops && targetLoops > 0 && finishesCycle && nextCompleted >= targetLoops) {
          completedSequencesRef.current = nextCompleted
          onSequenceCompleteRef.current?.()
          return
        }
        if (finishesCycle) {
          completedSequencesRef.current = nextCompleted
        }
        advanceLoopRef.current()
      }, delay)
      loopTimeoutRef.current = timer
      return () => {
        clearTimeout(timer)
        if (loopTimeoutRef.current === timer) {
          loopTimeoutRef.current = null
        }
      }
    }
  }, [status, autoPlay, isAnimated, isPaused, currentPresetKey, currentFlowIdx, speed, targetLoops])

  // Handle external or hover pause / resume
  React.useEffect(() => {
    if (isPaused && status === 'running') {
      if (animControlsRef.current) {
        animControlsRef.current.pause()
        setPausedAt(progressMotion.get() * rawDuration)
        setStatus('paused')
      }
    } else if (!isPaused && status === 'paused') {
      if (animControlsRef.current) {
        animControlsRef.current.play()
        setStatus('running')
      }
    }
  }, [isPaused, status, progressMotion, rawDuration])

  const activeIdx = status === 'idle' ? -1 : pipelineState.active
  const doneIdx = status === 'idle' ? 0 : pipelineState.done
  const isRunning = status === 'running'

  const currentToneIdx =
    status === 'error'
      ? errorAgentIdx
      : status === 'done'
        ? currentAgents.length - 1
        : pipelineState.travel >= 0
          ? pipelineState.travel
          : Math.max(pipelineState.active, 0)
  const currentAgent = currentAgents[currentToneIdx] ?? currentAgents[0]

  return (
    <Frame
      className={cn(
        'flex w-full max-w-md flex-col [corner-shape:superellipse(1.25)] rounded-3xl bg-muted p-1.5 select-none shadow-none overflow-hidden font-open-runde',
        className,
      )}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FrameHeader className="flex flex-row shrink-0 items-center justify-between gap-3 px-2 py-1.5 pb-2 border-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-background flex items-center justify-center shadow-none">
            <Squishmoji
              seed="agent-pipeline"
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
          <span className="text-xs sm:text-sm font-semibold text-foreground">Agent Pipeline</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.span className="inline-block w-[5ch] text-right text-[0.6875rem] font-medium text-muted-foreground tabular-nums">
            {timerText}
          </motion.span>
          <Badge
            size="xs"
            variant="secondary"
            squircle
            className="bg-background text-foreground flex items-center gap-1.5 shadow-none"
          >
            <span className="relative flex justify-center items-center size-fit">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full animate-ping animation-duration-[2.25s]',
                  status === 'error' ? 'bg-rose-300' : status === 'paused' ? 'bg-amber-300' : 'bg-emerald-300',
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full size-2 animate-pulse',
                  status === 'error' ? 'bg-rose-500' : status === 'paused' ? 'bg-amber-500' : 'bg-emerald-500',
                )}
              />
            </span>
            <BlurRevealText
              as="span"
              text={
                status === 'idle'
                  ? 'Idle'
                  : status === 'running'
                    ? pipelineState.travel >= 0
                      ? 'Relay'
                      : 'Active'
                    : status === 'paused'
                      ? 'Paused'
                      : status === 'error'
                        ? 'Failed'
                        : 'Done'
              }
              replayKey={`${status}-${pipelineState.travel}`}
              inView={false}
              once={false}
              delay={0}
              duration={0.22}
              blurAmount="0.3125rem"
              yOffset={2}
              className="inline-block text-[0.6875rem] font-medium text-foreground"
            />
          </Badge>
        </div>
      </FrameHeader>

      <Card className="flex flex-col squircle rounded-[1.125rem] bg-background p-4 sm:p-5 border-none shadow-none">
        <motion.div
          animate={contentHeight ? { height: contentHeight } : {}}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col gap-3 w-full"
        >
          <div ref={contentRef} className="w-full flex flex-col gap-3">
            <div className="relative w-full h-fit">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/3 left-[4%] right-[4%] max-w-[92%] h-1 rounded-full bg-muted overflow-hidden z-0 pointer-events-none">
                  <motion.div
                    className={cn('h-full rounded-full origin-left', status === 'error' ? 'bg-rose-500' : 'bg-primary')}
                    style={{ scaleX: lineMotion, transformOrigin: 'left' }}
                  />
                </div>

                {currentAgents.map((ag, idx) => (
                  <AgentNode
                    key={ag.id}
                    agent={ag}
                    state={
                      idx === pipelineState.errorAgent
                        ? 'error'
                        : idx === activeIdx
                          ? 'active'
                          : idx < doneIdx
                            ? 'done'
                            : 'idle'
                    }
                    blinkTrigger={blinkTrigger}
                  />
                ))}
              </div>
            </div>

            <div className="relative w-full">
              <SmoothSlider
                value={progressVal}
                min={0}
                max={100}
                height={28}
                showTicks={false}
                // animated={false}
                className="w-full [&>div]:opacity-100! **:cursor-default!"
                disabled
                onValueChange={(val) => {
                  if (Math.abs(val - progressVal) > 1) {
                    const timeP = getTimeProgress(val / 100)
                    progressMotion.jump(timeP)
                    lineMotion.jump(val / 100)
                    setProgressVal(val)
                  }
                }}
              />

              {/* <SloshSlider
            value={progressVal}
            min={0}
            max={100}
            height={28}
            corner={10}
            className="w-full opacity-100! **:opacity-100!"
            disabled
            onValueChange={(val) => {
              if (Math.abs(val - progressVal) > 1) {
                progressMotion.jump(val / 100)
                setProgressVal(val)
              }
            }}
          /> */}
            </div>

            <Frame className="border-none shadow-none bg-muted">
              <div className="flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative size-11 shrink-0 overflow-hidden [corner-shape:superellipse(1.25)] rounded-xl bg-background flex items-center justify-center shadow-none">
                    <Squishmoji
                      seed={currentAgent?.seed ?? 'agent'}
                      size={24}
                      animate
                      // animWobble
                      animOnHover
                      animOnClick
                      shape="all"
                      expression="all"
                      backgroundStyle="all"
                      blinkTrigger={blinkTrigger}
                      className="scale-175 origin-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{currentAgent?.name}</span>
                      <Badge
                        variant={
                          status === 'error'
                            ? 'error'
                            : status === 'done'
                              ? 'success'
                              : pipelineState.travel >= 0
                                ? 'info'
                                : 'secondary'
                        }
                        size="xs"
                        squircle
                        className={cn(!(status === 'error') && 'shadow-none bg-background text-foreground')}
                      >
                        {status === 'error'
                          ? 'Failed'
                          : status === 'done'
                            ? 'Approved'
                            : pipelineState.travel >= 0
                              ? 'Relay'
                              : status === 'paused'
                                ? 'Paused'
                                : 'Active'}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        'text-xs truncate mt-0.5',
                        // status === 'error' ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground',
                      )}
                    >
                      {status === 'error'
                        ? (currentAgent?.errorNote ?? 'Pipeline execution halted on error.')
                        : status === 'done'
                          ? 'All agent milestones successfully executed and approved.'
                          : pipelineState.travel >= 0
                            ? `Relay note: "${currentAgent?.note}"`
                            : `Currently ${currentAgent?.action}...`}
                    </p>
                  </div>
                </div>
              </div>
            </Frame>

            <Frame className="border-none shadow-none bg-muted">
              <FrameHeader className="flex flex-row items-center justify-between px-3 pt-1 pb-2 border-none">
                <FrameTitle className="text-xs font-semibold text-foreground">Activity Log</FrameTitle>
                <Badge
                  variant="default"
                  size="xs"
                  squircle
                  className="bg-background text-muted-foreground font-medium text-[0.625rem] shadow-none tabular-nums"
                >
                  {logs.length} events
                </Badge>
              </FrameHeader>

              <FramePanel className="px-2.5 py-1.5 border-none bg-background rounded-xl">
                <ScrollArea scrollFade className="h-32">
                  {logs.length === 0 ? (
                    <div className="grid h-32 place-items-center">
                      <span className="text-xs text-muted-foreground">
                        {status === 'idle' ? 'Ready to route task through agents' : 'Listening for pipeline events...'}
                      </span>
                    </div>
                  ) : (
                    <div ref={logContainerRef} className="space-y-1 pr-2">
                      {logs.map((item) => {
                        const isMilestone = item.kind === 'milestone'
                        const isErr = item.kind === 'error'

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              'flex items-center gap-2 text-xs py-0.5',
                              isMilestone && 'mt-1.5 first:mt-0 font-medium',
                              isErr && 'mt-1.5 font-medium',
                            )}
                          >
                            <span className="w-8 shrink-0 text-[0.625rem] font-medium text-muted-foreground tabular-nums">
                              {item.atS.toFixed(1)}s
                            </span>

                            <span
                              className={cn(
                                'shrink-0 rounded-full',
                                isErr
                                  ? 'size-2 bg-rose-500'
                                  : item.final
                                    ? 'size-2 bg-emerald-500'
                                    : isMilestone
                                      ? 'size-2 bg-primary'
                                      : 'size-1 bg-muted-foreground ml-4',
                              )}
                            />

                            {isErr ? (
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span className="shrink-0 font-semibold text-rose-600 dark:text-rose-400">
                                  {capitalizeText(item.label, 'words')}
                                </span>
                                <span className="truncate text-rose-600 dark:text-rose-400 font-medium">
                                  · {capitalizeText(item.detail)}
                                </span>
                              </div>
                            ) : isMilestone ? (
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span
                                  className={cn(
                                    'shrink-0 font-semibold',
                                    item.final ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
                                  )}
                                >
                                  {capitalizeText(item.label, 'words')}
                                </span>
                                <span className="truncate text-muted-foreground">· {capitalizeText(item.detail)}</span>
                              </div>
                            ) : (
                              <span className="truncate text-muted-foreground">{capitalizeText(item.detail)}</span>
                            )}
                          </motion.div>
                        )
                      })}
                      <div ref={scrollBottomRef} className="h-px w-full" />
                    </div>
                  )}
                </ScrollArea>
              </FramePanel>
            </Frame>

            <div className="flex hidden! items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Badge
                  variant="default"
                  size="xs"
                  squircle
                  className="shrink-0 bg-muted px-1.5 py-0.5 text-[0.5625rem] font-medium text-muted-foreground uppercase shadow-none"
                >
                  Task
                </Badge>
                <span className="truncate text-xs font-medium text-foreground">{currentTitle}</span>
              </div>
              <span className="shrink-0 text-[0.6875rem] text-muted-foreground font-normal">{activeRunId}</span>
            </div>
          </div>
        </motion.div>
      </Card>

      <FrameFooter className="flex shrink-0 items-center justify-between gap-3 px-3 py-1.5 pt-2 border-none">
        <div className="min-w-0 flex-1 text-xs">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={
                status === 'running'
                  ? `run-${pipelineState.active}-${pipelineState.travel}`
                  : `phase-${status}-${currentPresetKey}-${currentFlowIdx}`
              }
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18 }}
              className="truncate"
            >
              {status === 'idle' && <span className="text-muted-foreground">Ready to route task through agents</span>}
              {status === 'paused' && (
                <span className="text-muted-foreground">
                  Paused at <span className="text-foreground tabular-nums">{pausedAt.toFixed(1)}s</span>
                </span>
              )}
              {status === 'error' && (
                <span className="text-foreground">
                  <span className="font-medium text-rose-600 dark:text-rose-400">Halted</span> at{' '}
                  <span className="font-medium text-foreground">{currentAgents[errorAgentIdx]?.name}</span>
                  <span className="text-muted-foreground"> · Error encountered</span>
                </span>
              )}
              {status === 'done' && (
                <span className="text-foreground">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Approved</span> in{' '}
                  <span className="tabular-nums">{rawDuration.toFixed(1)}s</span>
                  <span className="text-muted-foreground"> · {currentAgents.length - 1} relays</span>
                </span>
              )}
              {status === 'running' &&
                (pipelineState.travel >= 0 ? (
                  <span className="text-muted-foreground">
                    Relay ·{' '}
                    <span className="font-medium text-foreground">{currentAgents[pipelineState.travel]?.name}</span> →{' '}
                    <span className="font-medium text-foreground">{currentAgents[pipelineState.travel + 1]?.name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {currentAgents[Math.max(pipelineState.active, 0)]?.name}
                    </span>{' '}
                    · {currentAgents[Math.max(pipelineState.active, 0)]?.action}
                  </span>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <Badge
          variant="default"
          size="xs"
          squircle
          className="shrink-0 bg-background text-muted-foreground font-medium text-[0.625rem] shadow-none"
        >
          {currentAgents.length} agents
        </Badge>
      </FrameFooter>
    </Frame>
  )
}

export default AgentPipeline

export { AGENT_PRESETS }
export type { AgentFlow, AgentStep, PresetKey }
