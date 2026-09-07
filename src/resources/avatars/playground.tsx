'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveVariant, type AvatarEffect, type AvatarVariant } from '@usespaceui/avatars'
import { bloomSound } from '@/components/providers/sound-provider'
import { useResourceSidebars } from '@/resources/components/shared/layout/viewport'
import { ResourceStudio } from '@/resources/components/shared/layout/studio'
import { ResourceNav } from '@/resources/components/shared/layout/nav'
import { AvatarEngineSwitch } from '@/resources/components/shared/layout/engine-switch'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/resources/components/shared/layout/toolbar'
import { ResourceInstallCluster } from '@/resources/components/shared/layout/install-cluster'
import { TOOL_OUTBOUND } from '@/resources/shared/links'
import { type AvatarEngine, writeEngineUrl } from '@/resources/shared/engine'
import type { ResourceViewMode } from '@/resources/shared/types'
import { AvatarCodeModal } from './code-modal'
import { AvatarControlPanel } from './control-panel'
import { MockupView } from '@/resources/components/shared/avatar/mockup-view'
import { GalleryView } from './gallery-view'
import { AvatarInfoPanel } from './info-panel'
import { SeedView } from './seed-view'
import { DEFAULT_SEEDS } from '@/resources/shared/seeds'
import type { SelectedAvatar } from './types'
import { shufflePersonas, getSelectedAvatarDetails, resolvePaletteColors } from './utils'
import { useSquishmojiStudio } from '@/resources/squishmoji/playground'

export function AvatarsPlayground({ initialEngine = 'avatars' }: { initialEngine?: AvatarEngine }) {
  const [engine, setEngine] = useState<AvatarEngine>(initialEngine)
  const squish = engine === 'squishmoji'
  const [pool, setPool] = useState<string[]>(() => shufflePersonas())
  const [pattern, setPattern] = useState<AvatarVariant | 'all'>('all')
  const [size, setSize] = useState(164)
  const [effect, setEffect] = useState<AvatarEffect>('none')
  const [animate, setAnimate] = useState(true)
  const [paletteIndex, setPaletteIndex] = useState(-2)
  const [customColors, setCustomColors] = useState<string[]>([])
  const [circle, setCircle] = useState(true)
  const [view, setView] = useState<ResourceViewMode>('gallery')
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
      const type = new URLSearchParams(window.location.search).get('type')
      setEngine(type === 'squishmoji' || type === 'squish' ? 'squishmoji' : 'avatars')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const parsedColors = useMemo(() => resolvePaletteColors(paletteIndex, customColors), [paletteIndex, customColors])
  const details = useMemo(() => getSelectedAvatarDetails(pattern), [pattern])

  const changeEngine = (next: AvatarEngine) => {
    if (next === engine) return
    if (next === 'avatars' && view === 'video') setView('gallery')
    setEngine(next)
    writeEngineUrl(next)
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
    onViewChange: squish ? squishmoji.changeView : setView,
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
              setView={setView}
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
