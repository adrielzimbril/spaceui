'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveVariant, type AvatarEffect, type AvatarVariant } from '@usespaceui/avatars'
import { bloomSound } from '@/components/providers/sound-provider'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { AvatarEngineSwitch } from '@/tools/components/shared/layout/engine-switch'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { ResourceInstallCluster } from '@/tools/components/shared/layout/install-cluster'
import { TOOL_OUTBOUND } from '@/tools/shared/links'
import { type AvatarEngine, writeEngineUrl } from '@/tools/shared/engine'
import type { ResourceViewMode } from '@/tools/shared/types'
import { viewFromQuery, writeViewQuery } from '@/tools/shared/view'

const AVATAR_VIEWS: ResourceViewMode[] = ['gallery', 'mockup', 'seed']
const SQUISH_VIEWS: ResourceViewMode[] = ['gallery', 'mockup', 'seed', 'video']
import { AvatarCodeModal } from './code-modal'
import { AvatarControlPanel } from './control-panel'
import { MockupView } from '@/tools/components/shared/avatar/mockup-view'
import { GalleryView } from './gallery-view'
import { AvatarInfoPanel } from './info-panel'
import { SeedView } from './seed-view'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'
import type { SelectedAvatar } from './types'
import { shufflePersonas, getSelectedAvatarDetails, resolvePaletteColors } from './utils'
import { useSquishmojiStudio } from '@/tools/squishmoji/playground'

export function AvatarsPlayground({
  initialEngine = 'avatars',
  initialView,
}: {
  initialEngine?: AvatarEngine
  initialView?: string
}) {
  const [engine, setEngine] = useState<AvatarEngine>(initialEngine)
  const squish = engine === 'squishmoji'
  const allowedViews = squish ? SQUISH_VIEWS : AVATAR_VIEWS
  const [pool, setPool] = useState<string[]>(() => shufflePersonas())
  const [pattern, setPattern] = useState<AvatarVariant | 'all'>('all')
  const [size, setSize] = useState(164)
  const [effect, setEffect] = useState<AvatarEffect>('none')
  const [animate, setAnimate] = useState(true)
  const [paletteIndex, setPaletteIndex] = useState(-2)
  const [customColors, setCustomColors] = useState<string[]>([])
  const [circle, setCircle] = useState(true)
  const [view, setView] = useState<ResourceViewMode>(() =>
    viewFromQuery(initialView, initialEngine === 'squishmoji' ? SQUISH_VIEWS : AVATAR_VIEWS),
  )
  const [seedName, setSeedName] = useState(DEFAULT_SEEDS)
  const [expanded, setExpanded] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(null)
  const { isDesktop, showLeft, setShowLeft, showRight, setShowRight } = useResourceSidebars()

  const squishmoji = useSquishmojiStudio({
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
  })

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const nextEngine = type === 'squishmoji' || type === 'squish' ? 'squishmoji' : 'avatars'
      setEngine(nextEngine)
      setView(viewFromQuery(params.get('view'), nextEngine === 'squishmoji' ? SQUISH_VIEWS : AVATAR_VIEWS))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const parsedColors = useMemo(() => resolvePaletteColors(paletteIndex, customColors), [paletteIndex, customColors])
  const details = useMemo(() => getSelectedAvatarDetails(pattern), [pattern])

  const changeView = (next: ResourceViewMode) => {
    const resolved = viewFromQuery(next, allowedViews)
    if (squish) squishmoji.changeView(resolved)
    else setView(resolved)
    writeViewQuery(resolved)
  }

  const changeEngine = (next: AvatarEngine) => {
    if (next === engine) return
    const nextViews = next === 'squishmoji' ? SQUISH_VIEWS : AVATAR_VIEWS
    const nextView = viewFromQuery(view, nextViews)
    if (nextView !== view) setView(nextView)
    setEngine(next)
    writeEngineUrl(next)
    writeViewQuery(nextView)
  }

  const selectAvatar = (avatar: SelectedAvatar) => {
    bloomSound()
    setSelectedAvatar({
      ...avatar,
      variant: avatar.variant === 'all' ? resolveVariant(avatar.seed, 'all') : avatar.variant,
    })
  }

  const reset = () => {
    setPool(shufflePersonas())
    setSize(164)
    setAnimate(true)
    setSeedName(DEFAULT_SEEDS)
    setView('gallery')
    writeViewQuery('gallery')
    setShowLeft(false)
    setShowRight(isDesktop)
    setExpanded(false)
    setSelectedAvatar(null)
    if (squish) {
      squishmoji.reset()
      return
    }
    setPattern('all')
    setEffect('none')
    setPaletteIndex(-2)
    setCustomColors([])
    setCircle(true)
  }

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    info: !squish,
    sidebar: true,
    reset: true,
    viewToggle: true,
    view,
    views: ['gallery', 'mockup', 'seed'],
    video: squish,
    onViewChange: changeView,
    onReset: reset,
    onToggleExpand: setExpanded,
    onToggleInfo: setShowLeft,
    onToggleSidebar: setShowRight,
    infoVisible: showLeft,
    sidebarVisible: showRight,
    expanded,
  }

  return (
    <>
      <ResourceStudio
        showLeft={!squish && showLeft && !expanded}
        showRight={showRight && !expanded}
        leftWidth="30%"
        rightWidth="20rem"
        onToggleLeft={setShowLeft}
        onToggleRight={setShowRight}
        className={expanded ? 'p-0' : undefined}
        left={squish ? undefined : <AvatarInfoPanel />}
        bottom={squish ? squishmoji.bottom : null}
        installBar={
          squish ? (
            squishmoji.installBar
          ) : view !== 'seed' && !expanded ? (
            <ResourceInstallCluster packageName="@usespaceui/avatars" links={TOOL_OUTBOUND.avatars} />
          ) : null
        }
        canvas={
          squish ? (
            squishmoji.canvas
          ) : view === 'mockup' ? (
            <MockupView
              pool={pool}
              pattern={pattern}
              size={size}
              effect={effect}
              animate={animate}
              circle={circle}
              parsedColors={parsedColors}
              paletteIndex={paletteIndex}
            />
          ) : view === 'seed' ? (
            <SeedView
              seed={seedName}
              setSeed={setSeedName}
              pattern={pattern}
              size={size}
              effect={effect}
              animate={animate}
              circle={circle}
              parsedColors={parsedColors}
            />
          ) : (
            <GalleryView
              pool={pool}
              pattern={pattern}
              effect={effect}
              animate={animate}
              circle={circle}
              parsedColors={parsedColors}
              paletteIndex={paletteIndex}
              onSelectAvatar={selectAvatar}
              sidebarLeft={showLeft && !expanded}
              sidebarRight={showRight && !expanded}
            />
          )
        }
        float={
          <ResourceToolbar
            config={toolbarConfig}
            left={
              <>
                <ResourceNav />
                <AvatarEngineSwitch engine={engine} onEngineChange={changeEngine} expanded={expanded} />
              </>
            }
          />
        }
        right={
          squish ? (
            squishmoji.right
          ) : (
            <AvatarControlPanel
              pool={pool}
              pattern={pattern}
              setPattern={setPattern}
              paletteIndex={paletteIndex}
              setPaletteIndex={setPaletteIndex}
              customColors={customColors}
              setCustomColors={setCustomColors}
              size={size}
              setSize={setSize}
              effect={effect}
              setEffect={setEffect}
              circle={circle}
              setCircle={setCircle}
              animate={animate}
              setAnimate={setAnimate}
              parsedColors={parsedColors}
              details={details}
              regenerateSeeds={() => {
                const next = shufflePersonas()
                setPool(next)
                setSeedName(next[0] ?? DEFAULT_SEEDS)
              }}
              view={view}
              setView={changeView}
              previewSeed={seedName}
            />
          )
        }
      />
      {squish ? (
        squishmoji.modal
      ) : (
        <AvatarCodeModal
          target={selectedAvatar}
          config={{ size, circle, effect, animate }}
          onClose={() => setSelectedAvatar(null)}
        />
      )}
    </>
  )
}
