'use client'

import * as React from 'react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { IconCrop, IconAdjustments } from '@tabler/icons-react'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { tapSound } from '@/components/providers/sound-provider'
import { useFloatNav } from '@/components/providers/float-nav-provider'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { index as registryIndex } from '@/__registry__/index'
import { Tweakpane, type Binds } from '@/components/docs/preview/tweakpane'
import { InteractionCanvas } from './canvas'
import { InteractionControlPanel } from './control-panel'
import { computeSequenceTiming } from './timing'
import { useInteractionRecorder } from './use-interaction-recorder'
import { type AspectRatioValue, type InteractionGroup, type InteractionRecorderItem, type ScaleValue } from './types'

function groupByCategory(items: InteractionRecorderItem[]): InteractionGroup[] {
  const groups: Record<string, InteractionRecorderItem[]> = {}
  for (const item of items) {
    const raw = item.categories?.[1] ?? 'general'
    const label = raw.charAt(0).toUpperCase() + raw.slice(1)
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, groupItems]) => ({ value, items: groupItems }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    for (const key in obj) {
      const value = obj[key]
      result[key] = value && typeof value === 'object' && 'value' in value ? value.value : value
    }
    return result
  }
  return {}
}

export function InteractionRecorderPlayground({ items }: { items: InteractionRecorderItem[] }) {
  useFloatNav()
  const groups = useMemo(() => groupByCategory(items), [items])
  const [selected, setSelected] = useState<InteractionRecorderItem | null>(items[0] ?? null)
  const [scale, setScale] = useState<ScaleValue>(1)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>(1)
  const [elementZoom, setElementZoom] = useState(1.6)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [loops, setLoops] = useState(1)
  const [cycleSeconds, setCycleSeconds] = useState<number | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [withSound, setWithSound] = useState(false)
  const [showTweakpane, setShowTweakpane] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const { showRight, setShowRight } = useResourceSidebars()
  const stageRef = useRef<HTMLDivElement>(null)

  const entry = selected ? registryIndex[selected.name] : undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = entry?.component as React.ComponentType<any> | undefined

  const initialBinds = useMemo<Binds | null>(() => {
    if (!Component && !entry) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dp = (Component as any)?.demoProps ?? (entry as any)?.meta?.demoProps ?? (entry as any)?.demoProps
    if (dp && typeof dp === 'object' && Object.keys(dp).length > 0) {
      return JSON.parse(JSON.stringify(dp)) as Binds
    }
    return null
  }, [Component, entry])

  const [binds, setBinds] = useState<Binds | null>(null)
  const [interactionProps, setInteractionProps] = useState<Record<string, any>>({})

  useEffect(() => {
    if (initialBinds) {
      setBinds(initialBinds)
      setInteractionProps(unwrapValues(initialBinds))
    } else {
      setBinds(null)
      setInteractionProps({})
    }
  }, [initialBinds, selected?.name])

  const hasBinds = Boolean(binds && Object.keys(binds).length > 0)

  const sequenceTiming = useMemo(() => {
    return computeSequenceTiming(selected?.shortName ?? selected?.name, interactionProps, loops, cycleSeconds)
  }, [selected?.shortName, selected?.name, interactionProps, loops, cycleSeconds])

  const handleReset = () => {
    if (initialBinds) {
      setBinds(JSON.parse(JSON.stringify(initialBinds)))
      setInteractionProps(unwrapValues(initialBinds))
    }
    setPan({ x: 0, y: 0 })
    setElementZoom(1.6)
    setResetKey((k) => k + 1)
  }

  const { busy, progress, isRecording, handleRecord, handleStop, handleScreenshot, sequenceCompleteResolverRef } =
    useInteractionRecorder({
      stageRef,
      selected,
      scale,
      aspectRatio,
      pan,
      elementZoom,
      withSound,
      fps: 30,
      sequenceTiming,
      onResetAnimation: () => setResetKey((k) => k + 1),
    })

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: false,
    info: false,
    sidebar: true,
    reset: true,
    onReset: handleReset,
    viewToggle: false,
    onToggleSidebar: () => setShowRight(!showRight),
    sidebarVisible: showRight,
  }

  return (
    <ResourceStudio
      showRight={showRight}
      rightWidth="20rem"
      onToggleRight={setShowRight}
      canvas={
        <>
          <InteractionCanvas
            item={selected}
            Component={Component}
            demoProps={interactionProps}
            stageRef={stageRef}
            showGuide={showGuide}
            scale={scale}
            aspectRatio={aspectRatio}
            elementZoom={elementZoom}
            pan={pan}
            onPanChange={setPan}
            isRecording={isRecording}
            resetKey={resetKey}
            targetLoops={loops}
            onSequenceComplete={() => sequenceCompleteResolverRef.current?.()}
          />

          {hasBinds && binds && (
            <Tweakpane
              binds={binds}
              onBindsChange={(newBinds) => {
                setBinds(newBinds)
                setInteractionProps(unwrapValues(newBinds))
              }}
              show={showTweakpane && !busy}
              onClose={() => setShowTweakpane(false)}
              portal={false}
            />
          )}
        </>
      }
      float={
        <ResourceToolbar
          config={toolbarConfig}
          left={<ResourceNav />}
          right={
            <div className="flex items-center gap-1">
              {hasBinds && (
                <ToolbarButton
                  onClick={() => {
                    tapSound()
                    setShowTweakpane((v) => !v)
                  }}
                  label={showTweakpane ? 'Hide interaction controls' : 'Configure interaction'}
                  pressed={showTweakpane}
                >
                  <IconAdjustments className="size-3.5" />
                </ToolbarButton>
              )}

              <ToolbarButton
                onClick={() => {
                  tapSound()
                  setShowGuide(!showGuide)
                }}
                label={showGuide ? 'Hide recording guide' : 'Show recording guide'}
                pressed={showGuide}
              >
                <IconCrop className="size-3.5" />
              </ToolbarButton>
            </div>
          }
        />
      }
      right={
        <InteractionControlPanel
          groups={groups}
          selected={selected}
          onSelect={(item) => {
            setSelected(item)
            setResetKey((k) => k + 1)
          }}
          scale={scale}
          onScaleChange={setScale}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          elementZoom={elementZoom}
          onElementZoomChange={setElementZoom}
          pan={pan}
          onResetFraming={() => {
            setPan({ x: 0, y: 0 })
            setElementZoom(1.6)
          }}
          loops={loops}
          onLoopsChange={setLoops}
          cycleSeconds={cycleSeconds}
          withSound={withSound}
          onWithSoundChange={setWithSound}
          busy={busy}
          progress={progress}
          onRecord={handleRecord}
          onStop={handleStop}
          onScreenshot={handleScreenshot}
          hasBinds={hasBinds}
          showTweakpane={showTweakpane}
          onToggleTweakpane={() => setShowTweakpane((v) => !v)}
          timing={sequenceTiming}
        />
      }
    />
  )
}
