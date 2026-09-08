'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  resolveExpression,
  resolveShape,
  type SquishBackgroundStyleChoice,
  type SquishExpressionChoice,
  type SquishShapeChoice,
} from '@usespaceui/squishmoji'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { bloomSound } from '@/components/providers/sound-provider'
import { toastManager } from '@/registry/primitives/toast'
import { Button } from '@/registry/primitives/button'
import { ResourceInstallCluster } from '@/tools/components/shared/layout/install-cluster'
import { TOOL_OUTBOUND } from '@/tools/shared/links'
import { ResourceGallery } from '@/tools/components/shared/layout/gallery'
import { ResourceSeedView } from '@/tools/components/shared/layout/seed-stage'
import { PersonaProvider } from '@/tools/components/shared/avatar/persona'
import { MockupView } from '@/tools/components/shared/avatar/mockup-view'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'
import { getRandomPersonas, shufflePersonas } from '@/tools/shared/utils'
import type { ResourceViewMode } from '@/tools/shared/types'
import { SquishmojiControlPanel } from './control-panel'
import { SquishmojiCodeModal } from './code-modal'
import { VideoStage } from './video-stage'
import { AvatarExportPanel } from '@/tools/components/shared/avatar/export/panel'
import { videoDims, type VideoAspect, type VideoExportSize } from '@/tools/components/shared/avatar/export/dims'
import { SequenceTimeline } from '@/tools/components/shared/avatar/export/sequence-timeline'
import { exportRaster, exportSvgMarkup } from '@/tools/components/shared/avatar/export/raster'
import { startLiveRecording, stopLiveRecording } from '@/tools/components/shared/avatar/export/video'
import {
  exportToVideoAuto,
  exportToVideoSequence,
  type MotionFormat,
  type SequenceStep,
} from '@/tools/components/shared/avatar/export/squish-video'

function captionFor(seed: string, shape: SquishShapeChoice, expression: SquishExpressionChoice) {
  return `${resolveShape(seed, shape)} · ${resolveExpression(seed, expression)}`
}

function snippetFor({
  seed,
  shape,
  expression,
  size,
  backgroundStyle,
  animate,
  animWobble,
  animOnHover,
  animOnClick,
}: {
  seed: string
  shape: SquishShapeChoice
  expression: SquishExpressionChoice
  size: number
  backgroundStyle: SquishBackgroundStyleChoice
  animate: boolean
  animWobble: boolean
  animOnHover: boolean
  animOnClick: boolean
}) {
  const resolvedShape = resolveShape(seed, shape)
  const resolvedExpr = resolveExpression(seed, expression)
  const lines = [`<Squishmoji`, `  seed="${seed}"`, `  shape="${resolvedShape}"`, `  expression="${resolvedExpr}"`]
  if (size !== 120) lines.push(`  size={${size}}`)
  if (backgroundStyle !== 'all' && backgroundStyle !== 'solid') lines.push(`  backgroundStyle="${backgroundStyle}"`)
  if (!animate) lines.push('  animate={false}')
  if (animWobble) lines.push('  animWobble')
  if (animOnHover) lines.push('  animOnHover')
  if (animOnClick) lines.push('  animOnClick')
  lines.push('/>')
  return `import { Squishmoji } from '@usespaceui/squishmoji/react'\n\n${lines.join('\n')}`
}

export function useSquishmojiStudio({
  pool,
  setPool,
  seedName,
  setSeedName,
  size,
  setSize,
  animate,
  setAnimate,
  view,
  setView,
  showRight,
  expanded,
}: {
  pool: string[]
  setPool: Dispatch<SetStateAction<string[]>>
  seedName: string
  setSeedName: (value: string) => void
  size: number
  setSize: (value: number) => void
  animate: boolean
  setAnimate: Dispatch<SetStateAction<boolean>>
  view: ResourceViewMode
  setView: (value: ResourceViewMode) => void
  showRight: boolean
  expanded: boolean
}): {
  canvas: ReactNode
  right: ReactNode
  bottom: ReactNode
  installBar: ReactNode
  modal: ReactNode
  reset: () => void
  changeView: (next: ResourceViewMode) => void
} {
  const [shape, setShape] = useState<SquishShapeChoice>('all')
  const [expression, setExpression] = useState<SquishExpressionChoice>('all')
  const [backgroundStyle, setBackgroundStyle] = useState<SquishBackgroundStyleChoice>('all')
  const [animWobble, setAnimWobble] = useState(true)
  const [animOnHover, setAnimOnHover] = useState(true)
  const [animOnClick, setAnimOnClick] = useState(true)
  const [videoBg, setVideoBg] = useState('transparent')
  const [stillFormat, setStillFormat] = useState<'png' | 'svg'>('png')
  const [motionFormat, setMotionFormat] = useState<MotionFormat>('webm')
  const [videoAspect, setVideoAspect] = useState<VideoAspect>('1:1')
  const [videoSize, setVideoSize] = useState<VideoExportSize>(1080)
  const [recording, setRecording] = useState(false)
  const [sequence, setSequence] = useState<SequenceStep[]>([])
  const [blinkTrigger, setBlinkTrigger] = useState(0)
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const motionSnapshot = useRef<{
    animate: boolean
    animWobble: boolean
    animOnHover: boolean
    animOnClick: boolean
  } | null>(null)

  const getSvg = () => stageRef.current?.querySelector('svg') ?? null
  const name = seedName.trim() || DEFAULT_SEEDS
  const fileBase = `squishmoji-${name}`

  useEffect(() => {
    if (!recording) return
    stopLiveRecording(`${fileBase}-live`)
    setRecording(false)
    toastManager.add({ type: 'info', title: 'Recording stopped' })
  }, [videoAspect, videoSize])

  const code = useMemo(
    () =>
      snippetFor({
        seed: name,
        shape,
        expression,
        size,
        backgroundStyle,
        animate,
        animWobble,
        animOnHover,
        animOnClick,
      }),
    [name, shape, expression, size, backgroundStyle, animate, animWobble, animOnHover, animOnClick],
  )

  const renderSquish = (seed: string, mediaSize: number, live = false) => (
    <Squishmoji
      seed={seed}
      size={mediaSize}
      shape={shape}
      expression={expression}
      backgroundStyle={backgroundStyle}
      animate={live ? animate : false}
      animWobble={live ? animWobble : false}
      animOnHover={live ? animOnHover : false}
      animOnClick={live ? animOnClick : false}
      blinkTrigger={live ? blinkTrigger : 0}
      frozenAt={live ? undefined : 0}
    />
  )

  const notify = async (label: string, run: () => void | Promise<void>) => {
    toastManager.add({ id: 'squish-export', type: 'loading', title: `${label}…` })
    try {
      await run()
      toastManager.add({ id: 'squish-export', type: 'success', title: `${label} saved` })
    } catch {
      toastManager.add({ id: 'squish-export', type: 'error', title: `${label} failed` })
    }
  }

  const reset = () => {
    setShape('all')
    setExpression('all')
    setBackgroundStyle('all')
    setAnimWobble(true)
    setAnimOnHover(true)
    setAnimOnClick(true)
    motionSnapshot.current = null
  }

  const changeView = (next: ResourceViewMode) => {
    if (next === 'video' && view !== 'video') {
      motionSnapshot.current = { animate, animWobble, animOnHover, animOnClick }
      setAnimate(true)
      setAnimWobble(true)
      setAnimOnHover(true)
      setAnimOnClick(true)
    }
    if (next !== 'video' && view === 'video' && motionSnapshot.current) {
      const snap = motionSnapshot.current
      setAnimate(snap.animate)
      setAnimWobble(snap.animWobble)
      setAnimOnHover(snap.animOnHover)
      setAnimOnClick(snap.animOnClick)
      motionSnapshot.current = null
    }
    setView(next)
  }

  const select = (seed: string) => {
    bloomSound()
    setSelectedSeed(seed)
  }

  const frame = videoDims(videoAspect, videoSize)

  const addShot = () => {
    setSequence((steps) => [
      ...steps,
      {
        id: crypto.randomUUID(),
        shape,
        expression,
        durationSec: 2,
        backgroundStyle,
        seed: name,
        blink: false,
        wobble: animWobble,
        animate,
      },
    ])
  }

  const exportSequenceJson = () => {
    const blob = new Blob([JSON.stringify({ version: 1, shots: sequence }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileBase}-sequence.json`
    link.click()
    URL.revokeObjectURL(url)
    toastManager.add({ type: 'success', title: 'Sequence JSON saved' })
  }

  const importSequenceJson = (file: File) => {
    void file.text().then((text) => {
      try {
        const parsed = JSON.parse(text) as { shots?: SequenceStep[] }
        if (!Array.isArray(parsed.shots)) throw new Error('Invalid sequence')
        setSequence(parsed.shots.map((shot) => ({ ...shot, id: shot.id || crypto.randomUUID() })))
        toastManager.add({ type: 'success', title: 'Sequence imported' })
      } catch {
        toastManager.add({ type: 'error', title: 'Invalid sequence file' })
      }
    })
  }

  const videoActions = (
    <div className="flex flex-col gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={() => setBlinkTrigger((count) => count + 1)}>
        Blink
      </Button>
      <div className="h-px bg-border" />
      <div className="grid grid-cols-2 gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={recording ? 'destructive' : 'secondary'}
          onClick={() => {
            if (recording) {
              stopLiveRecording(`${fileBase}-live`)
              setRecording(false)
              toastManager.add({ type: 'success', title: 'Recording saved' })
              return
            }
            if (startLiveRecording(getSvg, videoBg, frame.width, frame.height)) {
              setRecording(true)
              toastManager.add({ type: 'info', title: 'Recording' })
            } else {
              toastManager.add({ type: 'error', title: 'Could not start recording' })
            }
          }}
        >
          {recording ? 'Stop' : 'Record'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            void notify('3s clip', () =>
              exportToVideoAuto(
                name,
                shape,
                expression,
                videoBg,
                `${fileBase}-clip`,
                3,
                0,
                0,
                1,
                1,
                backgroundStyle,
                frame.width,
                frame.height,
                motionFormat,
              ),
            )
          }
        >
          3s clip
        </Button>
      </div>
    </div>
  )

  const exportPanel =
    view === 'video' ? (
      <AvatarExportPanel
        videoBg={videoBg}
        setVideoBg={setVideoBg}
        aspect={videoAspect}
        setAspect={setVideoAspect}
        exportSize={videoSize}
        setExportSize={setVideoSize}
        format={stillFormat}
        setFormat={setStillFormat}
        motionFormat={motionFormat}
        setMotionFormat={setMotionFormat}
        onExport={() => {
          const svg = getSvg()
          if (!svg) {
            toastManager.add({ type: 'error', title: 'Nothing to export' })
            return
          }
          if (stillFormat === 'svg') {
            void notify('SVG', () => exportSvgMarkup(svg, fileBase, videoBg, frame.width, frame.height))
            return
          }
          void notify('PNG', () =>
            exportRaster(svg, fileBase, 'png', Math.min(frame.width, frame.height), frame.width, frame.height, videoBg),
          )
        }}
      />
    ) : null

  const canvas =
    view === 'mockup' ? (
      <PersonaProvider
        render={(props) => (
          <Squishmoji
            seed={props.name ?? DEFAULT_SEEDS}
            size={props.size}
            shape={shape}
            expression={expression}
            backgroundStyle={backgroundStyle}
            animate={animate}
            animWobble={animWobble}
            animOnHover={animOnHover}
            animOnClick={animOnClick}
            blinkTrigger={blinkTrigger}
            frozenAt={animate ? undefined : 0}
          />
        )}
      >
        <MockupView
          pool={pool}
          pattern="all"
          size={size}
          effect="none"
          animate={animate}
          circle
          parsedColors={undefined}
          paletteIndex={-2}
        />
      </PersonaProvider>
    ) : view === 'gallery' ? (
      <ResourceGallery
        pool={pool}
        onSelect={select}
        loop
        sidebarLeft={false}
        sidebarRight={showRight && !expanded}
        mediaClassName="inset-0 sm:inset-1"
        renderMedia={(seed) => (
          <div className="flex size-full max-h-full max-w-full origin-center scale-[1.2] items-center justify-center lg:scale-[1.3] 2xl:scale-[1.4] 3xl:scale-[1.7] [&_svg]:size-full">
            {renderSquish(seed, 320, true)}
          </div>
        )}
        caption={(seed) => captionFor(seed, shape, expression)}
      />
    ) : view === 'seed' ? (
      <ResourceSeedView
        title="Squishmoji"
        description="Deterministic squishy SVG avatars from any string. Alive with motion, no assets, no network."
        findLabel="Let's find your squishmoji"
        seed={seedName}
        setSeed={setSeedName}
        placeholder={DEFAULT_SEEDS}
        onRandomize={() => setSeedName(getRandomPersonas(1)[0] ?? DEFAULT_SEEDS)}
        packageName="@usespaceui/squishmoji"
        code={code}
        codeTitle="Squishmoji.tsx"
        footnote="Seed is the only required prop. The same seed always renders the same squishmoji."
        preview={renderSquish(name, size, true)}
      />
    ) : (
      <VideoStage
        stageRef={stageRef}
        seed={seedName}
        setSeed={setSeedName}
        placeholder={DEFAULT_SEEDS}
        onRandomize={() => setSeedName(getRandomPersonas(1)[0] ?? DEFAULT_SEEDS)}
        aspect={videoAspect}
        preview={
          <Squishmoji
            key={name}
            seed={name}
            size={'100%'}
            className="flex size-full items-center justify-center [&_span]:size-[stretch]"
            shape={shape}
            expression={expression}
            backgroundStyle={backgroundStyle}
            animate={animate || recording}
            animWobble={animWobble}
            animOnHover={animOnHover}
            animOnClick={animOnClick}
            blinkTrigger={blinkTrigger}
          />
        }
      />
    )

  return {
    canvas,
    right: (
      <SquishmojiControlPanel
        seed={seedName.trim() || DEFAULT_SEEDS}
        shape={shape}
        setShape={setShape}
        expression={expression}
        setExpression={setExpression}
        backgroundStyle={backgroundStyle}
        setBackgroundStyle={setBackgroundStyle}
        size={size}
        setSize={setSize}
        animate={animate}
        setAnimate={setAnimate}
        animWobble={animWobble}
        setAnimWobble={setAnimWobble}
        animOnHover={animOnHover}
        setAnimOnHover={setAnimOnHover}
        animOnClick={animOnClick}
        setAnimOnClick={setAnimOnClick}
        regenerateSeeds={() => {
          const next = shufflePersonas()
          setPool(next)
          setSeedName(next[0] ?? DEFAULT_SEEDS)
        }}
        view={view}
        videoActions={videoActions}
      >
        {exportPanel}
      </SquishmojiControlPanel>
    ),
    bottom:
      view === 'video' && !expanded ? (
        <SequenceTimeline
          sequence={sequence}
          onAdd={addShot}
          onUpdate={(id, patch) =>
            setSequence((steps) => steps.map((step) => (step.id === id ? { ...step, ...patch } : step)))
          }
          onRemove={(id) => setSequence((steps) => steps.filter((step) => step.id !== id))}
          onReorder={setSequence}
          onExport={() =>
            void notify('Sequence', () =>
              exportToVideoSequence(
                sequence,
                videoBg,
                `${fileBase}-sequence`,
                0,
                0,
                1,
                1,
                frame.width,
                frame.height,
                motionFormat,
              ),
            )
          }
          onExportJson={exportSequenceJson}
          onImportJson={importSequenceJson}
        />
      ) : null,
    installBar:
      view !== 'seed' && view !== 'video' && !expanded ? (
        <ResourceInstallCluster packageName="@usespaceui/squishmoji" links={TOOL_OUTBOUND.squishmoji} />
      ) : null,
    modal: (
      <SquishmojiCodeModal
        target={selectedSeed ? { seed: selectedSeed } : null}
        config={{
          shape,
          expression,
          backgroundStyle,
          animate,
          animWobble,
          animOnHover,
          animOnClick,
        }}
        onClose={() => setSelectedSeed(null)}
      />
    ),
    reset,
    changeView,
  }
}
