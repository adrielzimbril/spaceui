'use client'

import { OrbBloop } from '@/registry/components/orb/bloop'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { BlurRevealText } from '@/registry/components/spaceui/blur-reveal-text'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { cn } from '@/registry/lib/utils'
import { Card } from '@/registry/primitives/card'
import { Frame, FrameFooter, FrameHeader } from '@/registry/primitives/frame'
import { capitalizeText } from '@/registry/utils/format-text'
import { logger } from '@/registry/utils/logger'
import { Mic, MicOff, Pause, Phone, PhoneOff, AudioLines, X } from '@keyline-icons/react'
import { bloom, tap } from '@usespaceui/sounds'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import {
  DEFAULT_VOICE_DURATIONS,
  VOICE_PRESETS,
  VOICE_STATE_META,
  type VoiceDialogueTurn,
  type VoicePresetKey,
  type VoiceState,
} from './data'

const safeSound = (fn: () => void) => {
  if (typeof window === 'undefined') return
  try {
    fn()
  } catch {}
}

export interface RealtimeVoiceProps {
  preset?: VoicePresetKey | string
  dialogues?: VoiceDialogueTurn[]
  modelName?: string
  autoPlay?: boolean
  animation?: 'active' | 'inactive' | boolean
  loop?: boolean
  cyclePresets?: boolean
  cyclePreset?: boolean
  speed?: number
  pauseOnHover?: boolean
  targetLoops?: number
  onSequenceComplete?: () => void
  className?: string
}

export function RealtimeVoice({
  preset = 'developer',
  dialogues: customDialogues,
  modelName: customModelName,
  autoPlay = true,
  animation = 'active',
  loop = true,
  cyclePresets: propCyclePresets,
  cyclePreset,
  speed = 1,
  pauseOnHover = true,
  targetLoops,
  onSequenceComplete,
  className,
}: RealtimeVoiceProps) {
  const shouldCyclePresets = Boolean(propCyclePresets ?? cyclePreset ?? true)
  const isAnimationActive = animation === true || animation === 'active'

  const presetKeys = React.useMemo(() => Object.keys(VOICE_PRESETS) as VoicePresetKey[], [])
  const [currentPresetKey, setCurrentPresetKey] = React.useState<VoicePresetKey>(() => {
    return (preset as VoicePresetKey) in VOICE_PRESETS ? (preset as VoicePresetKey) : 'developer'
  })

  React.useEffect(() => {
    if (preset && (preset as VoicePresetKey) in VOICE_PRESETS) {
      setCurrentPresetKey(preset as VoicePresetKey)
    }
  }, [preset])

  const activePreset = VOICE_PRESETS[currentPresetKey] ?? VOICE_PRESETS.developer
  const activeDialogues = customDialogues ?? activePreset.dialogues
  const activeModelName = customModelName ?? activePreset.modelName

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

  const [dialogueIndex, setDialogueIndex] = React.useState(0)
  const [voiceState, setVoiceState] = React.useState<VoiceState>('idle')
  const [isActive, setIsActive] = React.useState(Boolean(autoPlay && isAnimationActive))
  const [isHovered, setIsHovered] = React.useState(false)
  const [blinkTrigger, setBlinkTrigger] = React.useState(0)
  const [elapsedMs, setElapsedMs] = React.useState(0)
  const completedCyclesRef = React.useRef(0)

  const isPaused = !isAnimationActive || !isActive || (pauseOnHover && isHovered)

  const currentDialogue = activeDialogues[dialogueIndex % activeDialogues.length]
  const stateMeta = VOICE_STATE_META[voiceState]

  const handleToggleActive = React.useCallback(() => {
    safeSound(tap)
    setIsActive((prev) => {
      const next = !prev
      if (next && voiceState === 'idle') {
        setVoiceState('listening')
      }
      return next
    })
  }, [voiceState])

  const handleEndCall = React.useCallback(() => {
    safeSound(tap)
    setIsActive(false)
    setVoiceState('idle')
    setElapsedMs(0)
    setDialogueIndex(0)
    completedCyclesRef.current = 0
    setBlinkTrigger((prev) => prev + 1)
    logger.info('Realtime voice session reset to standby.')
  }, [])

  React.useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setElapsedMs((prev) => prev + 100)
    }, 100)
    return () => clearInterval(interval)
  }, [isPaused])

  React.useEffect(() => {
    const shouldBeActive = Boolean(autoPlay && isAnimationActive)
    setIsActive(shouldBeActive)
    if (shouldBeActive && voiceState === 'idle') {
      setVoiceState('listening')
    } else if (!shouldBeActive) {
      setVoiceState('idle')
    }
  }, [autoPlay, isAnimationActive])

  React.useEffect(() => {
    if (isPaused) return

    const effectiveSpeed = Math.max(0.2, speed)
    let phaseDuration = DEFAULT_VOICE_DURATIONS[voiceState] / effectiveSpeed

    if (currentDialogue?.durations) {
      if (voiceState === 'listening' && currentDialogue.durations.listening) {
        phaseDuration = currentDialogue.durations.listening / effectiveSpeed
      } else if (voiceState === 'thinking' && currentDialogue.durations.thinking) {
        phaseDuration = currentDialogue.durations.thinking / effectiveSpeed
      } else if (voiceState === 'speaking' && currentDialogue.durations.speaking) {
        phaseDuration = currentDialogue.durations.speaking / effectiveSpeed
      }
    }

    const timer = setTimeout(() => {
      setBlinkTrigger((prev) => prev + 1)

      if (voiceState === 'idle') {
        setVoiceState('listening')
      } else if (voiceState === 'listening') {
        setVoiceState('thinking')
      } else if (voiceState === 'thinking') {
        setVoiceState('speaking')
        safeSound(bloom)
      } else if (voiceState === 'speaking') {
        const nextTurn = dialogueIndex + 1
        const finishedCurrentPreset = nextTurn >= activeDialogues.length

        if (finishedCurrentPreset) {
          const currentPIdx = presetKeys.indexOf(currentPresetKey)
          const isLastPreset = currentPIdx === presetKeys.length - 1
          const finishesFullCycle = shouldCyclePresets ? isLastPreset : true

          if (finishesFullCycle) {
            completedCyclesRef.current += 1
          }

          if (targetLoops && targetLoops > 0 && finishesFullCycle && completedCyclesRef.current >= targetLoops) {
            setIsActive(false)
            setVoiceState('idle')
            safeSound(bloom)
            logger.info(`Realtime voice reached target loops (${targetLoops}). Sequence complete.`)
            onSequenceComplete?.()
            return
          }

          if (shouldCyclePresets) {
            const nextPresetIdx = (currentPIdx + 1) % presetKeys.length
            setCurrentPresetKey(presetKeys[nextPresetIdx])
          }
          setDialogueIndex(0)

          if (!autoPlay || (!loop && finishesFullCycle)) {
            setIsActive(false)
            setVoiceState('idle')
            return
          }
        } else {
          setDialogueIndex(nextTurn)
        }

        setVoiceState('listening')
      }
    }, phaseDuration)

    return () => clearTimeout(timer)
  }, [
    isPaused,
    voiceState,
    dialogueIndex,
    speed,
    loop,
    autoPlay,
    shouldCyclePresets,
    currentPresetKey,
    presetKeys,
    activeDialogues.length,
    currentDialogue?.durations,
    targetLoops,
    onSequenceComplete,
  ])

  const timerText = React.useMemo(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [elapsedMs])

  return (
    <Frame
      className={cn(
        'relative flex w-full max-w-md flex-col [corner-shape:superellipse(1.25)] rounded-3xl p-1.5 select-none shadow-none font-open-runde',
        className,
      )}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FrameHeader className="flex flex-row shrink-0 items-center justify-between gap-3 px-2 py-1.5 pb-2 border-none">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="relative size-6 shrink-0 overflow-hidden rounded-full bg-background flex items-center justify-center shadow-none cursor-pointer"
          >
            <Squishmoji
              seed="realtime-voice-agents"
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
          <span className="text-xs sm:text-sm font-semibold text-foreground">Realtime Voice</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
                  isPaused
                    ? 'bg-amber-300'
                    : voiceState === 'speaking'
                      ? 'bg-emerald-300'
                      : voiceState === 'listening'
                        ? 'bg-blue-300'
                        : voiceState === 'thinking'
                          ? 'bg-amber-300'
                          : 'bg-zinc-300',
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full size-2 animate-pulse',
                  isPaused
                    ? 'bg-amber-500'
                    : voiceState === 'speaking'
                      ? 'bg-emerald-500'
                      : voiceState === 'listening'
                        ? 'bg-blue-500'
                        : voiceState === 'thinking'
                          ? 'bg-amber-500'
                          : 'bg-zinc-400',
                )}
              />
            </span>
            <BlurRevealText
              as="span"
              text={isPaused ? 'Paused' : stateMeta.label}
              replayKey={`${isPaused}-${voiceState}`}
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
          className="relative flex flex-col items-center justify-center gap-3 w-full"
        >
          <div ref={contentRef} className="w-full flex flex-col items-center justify-center">
            <div className="relative flex size-48 items-center justify-center">
              <OrbBloop
                size={180}
                state={stateMeta.bloopState}
                audioMode="ambient"
                bloopColorMain={stateMeta.bloopColors.main}
                bloopColorLow={stateMeta.bloopColors.low}
                bloopColorMid={stateMeta.bloopColors.mid}
                bloopColorHigh={stateMeta.bloopColors.high}
                watercolorStrength={0.55}
                watercolorAnimated={true}
                className="shadow-none"
              />
            </div>

            <div className="mt-3 min-h-11 flex items-center justify-center text-center px-4 w-full">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`${voiceState}-${dialogueIndex}`}
                  initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex flex-col items-center justify-center"
                >
                  {voiceState === 'idle' ? (
                    <span className="text-sm text-center font-medium text-muted-foreground">
                      Ready to start conversation
                    </span>
                  ) : voiceState === 'thinking' ? (
                    <span className="text-sm text-center font-medium text-muted-foreground">
                      {currentDialogue.think}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <Badge
                        variant="secondary"
                        size="sm"
                        squircle
                        className="shrink-0 text-muted-foreground uppercase shadow-none"
                      >
                        {voiceState === 'speaking' ? 'Agent' : 'You'}
                      </Badge>
                      <BlurRevealText
                        text={voiceState === 'speaking' ? currentDialogue.speak : currentDialogue.listen}
                        className="w-full justify-center text-center pt-2 text-sm font-medium text-foreground"
                        replayKey={`${voiceState}-${dialogueIndex}`}
                        splitBy="words"
                        stagger={0.03}
                        duration={0.2}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Card>

      <FrameFooter className="flex shrink-0 items-center justify-between gap-3 px-3 py-1.5 pt-2 border-none">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon-sm"
            variant={isActive || voiceState !== 'idle' ? 'secondary' : 'default'}
            // variant={'secondary'}
            onClick={handleToggleActive}
            squircle
            className={cn((isActive || voiceState !== 'idle') && 'bg-background! border-background!')}
          >
            <MorphIcon activeKey={isActive ? 'mic-off' : 'mic'} variant="blur-scale" duration={0.22}>
              {isActive ? <MicOff className="size-3" /> : <AudioLines className="size-3" />}
            </MorphIcon>
          </Button>

          {(isActive || voiceState !== 'idle') && (
            <Button size="icon-sm" variant="destructive" onClick={handleEndCall} aria-label="End conversation" squircle>
              {/* <X className="size-3" /> */}
              <PhoneOff className="size-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm" squircle className="shrink-0 bg-background! shadow-none">
            {/* {capitalizeText(activeModelName, 'words')} */}
            {/* {capitalizeText(`${timerText}s · ${activeModelName}`, 'words')} */}
            {`${timerText}`}
          </Badge>
        </div>
      </FrameFooter>
    </Frame>
  )
}

export default RealtimeVoice
