'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { IconCircle, IconPhoto, IconPlayerStop, IconUpload } from '@tabler/icons-react'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { Badge } from '@/registry/primitives/badge'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Switch } from '@/registry/primitives/switch'
import { cn } from '@/registry/lib/utils'
import { tickSound, toggleSound } from '@/components/providers/sound-provider'
import { SliderRow } from './slider-row'
import type { RevealConfig } from './state'
import { TRAJECTORY_ICONS } from './trajectories'

const TRAJECTORY_LABELS = ['Horizon', 'Waves', 'Figure-8', 'Zigzag', 'Whirl', 'Star']
const RECORD_DURATIONS = [5, 7, 10]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.6875rem] font-semibold text-muted-foreground">{children}</span>
}

function ImageSummaryCard({
  label,
  src,
  name,
  onPick,
}: {
  label: string
  src: string | null
  name: string | null
  onPick: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
      <div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[0.625rem] bg-background">
        <AnimatePresence mode="wait" initial={false}>
          {src ? (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(3px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="size-full"
            >
              <Image
                src={src}
                alt={name ?? label}
                width={44}
                height={44}
                className="size-full object-cover"
                unoptimized={src.startsWith('blob:') || src.startsWith('data:')}
              />
            </motion.div>
          ) : (
            <IconPhoto className="size-5 text-muted-foreground" />
          )}
        </AnimatePresence>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{name ?? label}</p>
        <p className="truncate text-[0.625rem] text-muted-foreground">{name ? 'Tap to replace' : 'Upload a file'}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onPick}
        aria-label={name ? `Replace ${label}` : `Upload ${label}`}
        data-space-hover="tick"
        className="size-8 shrink-0 rounded-lg bg-background text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <IconUpload className="size-3.5" />
      </Button>
    </div>
  )
}

export function RevealControlPanel({
  config,
  onChange,
  baseSrc,
  revealSrc,
  baseName,
  revealName,
  onPickBase,
  onPickReveal,
  hasImages,
  loading,
  isRecording,
  recordSecondsLeft,
  onStartRecording,
  onCancelRecording,
}: {
  config: RevealConfig
  onChange: (patch: Partial<RevealConfig>) => void
  baseSrc: string | null
  revealSrc: string | null
  baseName: string | null
  revealName: string | null
  onPickBase: () => void
  onPickReveal: () => void
  hasImages: boolean
  loading: boolean
  isRecording: boolean
  recordSecondsLeft: number | null
  onStartRecording: (duration: number) => void
  onCancelRecording: () => void
}) {
  const [duration, setDuration] = React.useState(7)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center px-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">3D Reveal</h2>
          <Badge variant="secondary" size="xs">
            Brush to reveal
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3.5">
          {/* Source */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Source</SectionLabel>
            <ImageSummaryCard label="Base image" src={baseSrc} name={baseName} onPick={onPickBase} />
            <ImageSummaryCard label="Reveal image" src={revealSrc} name={revealName} onPick={onPickReveal} />
            <p className="px-0.5 text-[0.625rem] leading-snug text-muted-foreground">
              The brush paints away the base image to show the reveal image underneath, shaped by each image's own
              depth.
            </p>
          </div>

          {/* Physics */}
          <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
            <SectionLabel>Physics</SectionLabel>
            <SliderRow
              label="Depth"
              value={config.depthIntensity}
              min={0}
              max={0.5}
              step={0.01}
              onChange={(v) => onChange({ depthIntensity: v })}
            />
            <SliderRow
              label="Model scale"
              value={config.modelScale}
              min={0.5}
              max={2.5}
              step={0.05}
              onChange={(v) => onChange({ modelScale: v })}
            />
            <SliderRow
              label="Rotation X"
              value={config.rotX}
              min={-15}
              max={15}
              step={0.5}
              onChange={(v) => onChange({ rotX: v })}
              format={(v) => v.toFixed(1)}
            />
            <SliderRow
              label="Rotation Y"
              value={config.rotY}
              min={-15}
              max={15}
              step={0.5}
              onChange={(v) => onChange({ rotY: v })}
              format={(v) => v.toFixed(1)}
            />
          </div>

          {/* Brush */}
          <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
            <SectionLabel>Brush</SectionLabel>
            <SliderRow
              label="Thickness"
              value={config.thickness}
              min={50}
              max={800}
              step={10}
              onChange={(v) => onChange({ thickness: v })}
              format={(v) => Math.round(v).toString()}
            />
            <SliderRow
              label="Trail length"
              value={config.pointCount}
              min={50}
              max={500}
              step={10}
              onChange={(v) => onChange({ pointCount: Math.round(v) })}
              format={(v) => Math.round(v).toString()}
            />
            <SliderRow
              label="Smoothing"
              value={config.lerpFactor}
              min={0.5}
              max={0.98}
              step={0.01}
              onChange={(v) => onChange({ lerpFactor: v })}
            />
          </div>

          {/* Effects */}
          <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
            <SectionLabel>Effects</SectionLabel>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Gooey edge</span>
              <Switch
                checked={config.gooey}
                onCheckedChange={(b) => {
                  toggleSound(b ? 'on' : 'off')
                  onChange({ gooey: b })
                }}
              />
            </div>
            <SliderRow
              label="Edge softness"
              value={config.edgeSoftness}
              min={0}
              max={1}
              step={0.02}
              onChange={(v) => onChange({ edgeSoftness: v })}
            />
            <SliderRow
              label="Liquid displacement"
              value={config.displaceAmount}
              min={0}
              max={0.05}
              step={0.001}
              onChange={(v) => onChange({ displaceAmount: v })}
              format={(v) => v.toFixed(3)}
            />
            <SliderRow
              label="Chromatic aberration"
              value={config.chromaticAmount}
              min={0}
              max={0.03}
              step={0.001}
              onChange={(v) => onChange({ chromaticAmount: v })}
              format={(v) => v.toFixed(3)}
            />
          </div>

          {/* Trajectory */}
          <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between">
              <SectionLabel>Auto reveal</SectionLabel>
              <Switch
                checked={config.autoMask}
                onCheckedChange={(b) => {
                  toggleSound(b ? 'on' : 'off')
                  onChange({ autoMask: b })
                }}
              />
            </div>
            <SliderRow
              label="Speed"
              value={config.autoSpeed}
              min={0.2}
              max={3}
              step={0.1}
              onChange={(v) => onChange({ autoSpeed: v })}
              format={(v) => v.toFixed(1)}
            />
            <div className="flex flex-col gap-2">
              <SectionLabel>Trajectory</SectionLabel>
              <div className="grid grid-cols-3 gap-1.5">
                {TRAJECTORY_ICONS.map((d, i) => {
                  const isSelected = config.trajectory === i
                  return (
                    <Button
                      key={i}
                      type="button"
                      variant="ghost"
                      data-space-hover="tick"
                      onClick={() => {
                        tickSound()
                        onChange({ trajectory: i })
                      }}
                      title={TRAJECTORY_LABELS[i]}
                      className={cn(
                        'group flex h-auto! flex-col items-center gap-1.5 rounded-xl bg-muted p-1.5 transition-all hover:bg-muted',
                        isSelected && 'ring-2 ring-muted ring-offset-2 ring-offset-background',
                      )}
                    >
                      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-background/60 p-1">
                        <svg viewBox="0 0 28 24" className="h-6 w-full" fill="none">
                          <path
                            d={d}
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className={isSelected ? 'text-foreground' : 'text-muted-foreground'}
                          />
                        </svg>
                      </div>
                      <span
                        className={cn(
                          'w-full truncate px-0.5 text-center text-[0.625rem] font-medium transition-colors',
                          isSelected
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      >
                        {TRAJECTORY_LABELS[i]}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Record */}
          <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
            <SectionLabel>Record</SectionLabel>
            <div className="flex gap-1.5">
              {RECORD_DURATIONS.map((d) => {
                const isSelected = duration === d
                return (
                  <Button
                    key={d}
                    type="button"
                    variant="ghost"
                    disabled={isRecording}
                    data-space-hover="tick"
                    onClick={() => {
                      tickSound()
                      setDuration(d)
                    }}
                    className={cn(
                      'h-auto! flex-1 rounded-lg bg-muted py-1.5 text-xs transition-all hover:bg-muted',
                      isSelected
                        ? 'font-semibold text-foreground ring-2 ring-muted ring-offset-2 ring-offset-background'
                        : 'text-muted-foreground',
                    )}
                  >
                    {d}s
                  </Button>
                )
              })}
            </div>
            {isRecording ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={onCancelRecording}
                data-space-hover="tick"
              >
                <IconPlayerStop className="size-3.5" />
                Cancel ({recordSecondsLeft ?? 0}s)
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="w-full gap-2"
                disabled={!hasImages || loading}
                onClick={() => onStartRecording(duration)}
                data-space-hover="tick"
              >
                <IconCircle className="size-3.5 fill-current" />
                Start recording
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
