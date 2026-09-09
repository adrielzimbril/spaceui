'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AssetFlag } from './asset-flag'
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE,
  filterCatalog,
  getFlagMetadata,
  LANGUAGE_CODES,
  randomFlag,
} from './catalog'
import { FlagCodeModal } from './code-modal'
import { FlagControlPanel } from './control-panel'
import type { FlagMode, FlagShape } from './types'
import { bloomSound } from '@/components/providers/sound-provider'
import { toastManager } from '@/registry/primitives/toast'
import { ResourceGallery } from '@/tools/components/shared/layout/gallery'
import { ResourceInstallCluster } from '@/tools/components/shared/layout/install-cluster'
import { ResourceNav } from '@/tools/components/shared/layout/nav'
import { ResourceStudio } from '@/tools/components/shared/layout/studio'
import { ResourceToolbar, type ResourceToolbarConfig } from '@/tools/components/shared/layout/toolbar'
import { useResourceSidebars } from '@/tools/components/shared/layout/viewport'
import { TOOL_OUTBOUND } from '@/tools/shared/links'

export function FlagPlayground({
  initialShape,
  initialMode,
}: {
  initialShape?: string
  initialMode?: string
} = {}) {
  const [mode, setMode] = useState<FlagMode>(() => (initialMode === 'language' ? 'language' : 'country'))
  const [shape, setShape] = useState<FlagShape>(() => {
    if (initialShape === 'square' || initialShape === '4x3' || initialShape === 'circle') {
      return initialShape as FlagShape
    }
    return 'circle'
  })
  const [code, setCode] = useState(() => (mode === 'country' ? DEFAULT_COUNTRY : DEFAULT_LANGUAGE))
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isDesktop, showRight, setShowRight } = useResourceSidebars()

  // Ensure shape is valid for active mode
  const effectiveShape: FlagShape = mode === 'language' && shape === '4x3' ? 'circle' : shape

  // Current active catalog
  const catalog = useMemo(() => (mode === 'country' ? COUNTRY_CODES : LANGUAGE_CODES), [mode])
  const visible = useMemo(() => filterCatalog(mode, query), [mode, query])

  // Current selected flag metadata
  const currentCode = code.trim().toLowerCase()
  const activeCode = catalog.includes(currentCode)
    ? currentCode
    : (visible[0] ?? (mode === 'country' ? DEFAULT_COUNTRY : DEFAULT_LANGUAGE))
  const meta = useMemo(() => getFlagMetadata(activeCode, mode), [activeCode, mode])

  const modeReady = useRef(false)
  useEffect(() => {
    if (!modeReady.current) {
      modeReady.current = true
      return
    }
    const label = `${catalog.length} ${mode === 'country' ? 'country flags' : 'language flags'}`
    toastManager.add({ id: 'flag-mode', type: 'loading', title: `Loading ${label}…` })
    const timer = window.setTimeout(() => {
      toastManager.add({ id: 'flag-mode', type: 'success', title: label })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [mode, catalog.length])

  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const timer = window.setTimeout(() => {
      if (visible.length === 0) {
        toastManager.add({ id: 'flag-search', type: 'error', title: 'No flags found' })
        return
      }
      toastManager.add({ id: 'flag-search', type: 'success', title: `${visible.length} matches` })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [query, visible.length])

  const reset = () => {
    setMode('country')
    setShape('circle')
    setCode(DEFAULT_COUNTRY)
    setQuery('')
    setShowRight(isDesktop)
    setExpanded(false)
    setIsModalOpen(false)
  }

  const toolbarConfig: ResourceToolbarConfig = {
    theme: true,
    expand: true,
    info: false,
    sidebar: true,
    reset: true,
    viewToggle: false,
    view: 'gallery',
    views: ['gallery'],
    onReset: reset,
    onToggleExpand: setExpanded,
    onToggleSidebar: setShowRight,
    sidebarVisible: showRight,
    expanded,
  }

  const renderFlagMedia = (flagCode: string) => {
    const isRect = effectiveShape === '4x3'
    return (
      <div className="flex size-full items-center justify-center p-2">
        <AssetFlag
          key={`${flagCode}-${effectiveShape}-${mode}`}
          code={flagCode}
          shape={effectiveShape}
          mode={mode}
          size={isRect ? 64 : 68}
          lazy={true}
          className="group-hover:scale-105 transition-transform"
        />
      </div>
    )
  }

  return (
    <>
      <ResourceStudio
        showLeft={false}
        showRight={showRight && !expanded}
        rightWidth="20rem"
        onToggleRight={setShowRight}
        className={expanded ? 'p-0' : undefined}
        installBar={
          !expanded ? <ResourceInstallCluster packageName="@usespaceui/flags" links={TOOL_OUTBOUND.flags} /> : null
        }
        canvas={
          <ResourceGallery
            pool={visible}
            onSelect={(selectedCode) => {
              bloomSound()
              setCode(selectedCode)
              setIsModalOpen(true)
            }}
            limit={visible.length}
            keepPosition
            sidebarLeft={false}
            sidebarRight={showRight && !expanded}
            renderMedia={renderFlagMedia}
            caption={(itemCode) => {
              const itemMeta = getFlagMetadata(itemCode, mode)
              return itemMeta.name
            }}
          />
        }
        float={<ResourceToolbar config={toolbarConfig} left={<ResourceNav />} />}
        right={
          <FlagControlPanel
            meta={meta}
            mode={mode}
            setMode={(nextMode) => {
              setMode(nextMode)
              setCode(nextMode === 'country' ? DEFAULT_COUNTRY : DEFAULT_LANGUAGE)
            }}
            shape={effectiveShape}
            setShape={setShape}
            regenerate={() => {
              const next = randomFlag(mode, visible.length ? visible : catalog)
              setCode(next)
            }}
            count={query.trim() ? visible.length : catalog.length}
            query={query}
            setQuery={setQuery}
            onOpenModal={() => setIsModalOpen(true)}
          />
        }
      />

      <FlagCodeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        code={isModalOpen ? activeCode : null}
        shape={effectiveShape}
        mode={mode}
        onShapeChange={setShape}
      />
    </>
  )
}
