'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  useLayoutMode,
  Mode,
  type LayoutMode,
  type PageLayoutConstraint,
} from '@/components/providers/layout-mode-provider'
import {
  getRouteLayoutDefaults,
  normalizePreviewConfig,
  getEffectiveContained,
  type PreviewOptions,
} from '@/config/preview-config'
import { index } from '@/__registry__/index'
import { getRegistryComponentGroup } from '@/__registry__/components'

export interface PageLayoutSyncProps {
  mode?: Mode
  defaultMode?: LayoutMode
  path?: string
  preview?: string | PreviewOptions | null
  title?: string
}

export function PageLayoutSync({ mode = Mode.both, defaultMode, path = '', preview, title }: PageLayoutSyncProps) {
  const pathname = usePathname()
  const { setPageConstraint, registerDefaultPreview } = useLayoutMode()

  useEffect(() => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const routeDefaults = getRouteLayoutDefaults(normalizedPath)

    const effectiveDefault = defaultMode ?? routeDefaults?.constraint?.defaultMode

    const constraint: PageLayoutConstraint = {
      mode: mode !== Mode.both ? mode : (routeDefaults?.constraint?.mode ?? mode),
      defaultMode: effectiveDefault,
    }

    setPageConstraint(constraint)

    return () => {
      setPageConstraint(null)
    }
  }, [mode, defaultMode, path, setPageConstraint])

  useEffect(() => {
    const config = normalizePreviewConfig(preview)
    if (!config) return

    const componentGroup = getRegistryComponentGroup(config.name)
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const isTemplate = config.name.startsWith('template-') || normalizedPath.includes('/templates')
    const isBlock = config.name.startsWith('block-') || Boolean(componentGroup?.includes('block'))
    const isInteraction =
      config.name.startsWith('interactions-') ||
      normalizedPath.includes('/interactions') ||
      pathname.includes('/interactions') ||
      Boolean(componentGroup?.includes('interactions'))
    const useIframe = config.iframe !== undefined ? config.iframe : isTemplate || isBlock
    const effectiveContained = getEffectiveContained(config.contained, config.container, config.name, componentGroup)
    const effectiveOpen = config.open ?? !effectiveContained
    const ActiveComponent = useIframe ? null : index[config.name]?.component

    registerDefaultPreview(
      {
        name: config.name,
        title: config.title ?? title ?? config.name,
        component: ActiveComponent,
        useIframe,
        previewName: config.name,
        contained: effectiveContained,
        open: effectiveOpen,
        restart: config.restart ?? isInteraction,
        bigScreen: config.bigScreen,
        componentGroup,
        externalUrl: config.externalUrl,
        hideDocPanel: config.showcase,
      },
      true,
    )
  }, [preview, title, path, pathname, registerDefaultPreview])

  return null
}
