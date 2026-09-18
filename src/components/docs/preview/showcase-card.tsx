'use client'

import { getRegistryComponentGroup } from '@/__registry__/components'
import { Button } from '@/registry/primitives/button'
import { Badge } from '@/registry/primitives/badge'
import { Kbd } from '@/registry/primitives/kbd'
import { cn } from '@/registry/lib/utils'
import React, { useMemo, useState, useEffect } from 'react'
import { usePreviewTheme } from '@/components/docs/preview/hooks/use-preview-theme'
import { index } from '@/__registry__/index'
import { ShikiRenderer } from '@/components/docs/code/shiki-renderer'
import ReactIcon from '@/registry/icons/react-icon'
import { useRegistryEntry } from '@/components/docs/preview/hooks/use-registry-entry'
import {
  IconRotateClockwise,
  IconExternalLink,
  IconFileCode,
  IconMaximize,
  IconX,
  IconPackage,
  IconWindowMaximize,
} from '@tabler/icons-react'
import { CopyButton } from '@/registry/components/spaceui/copy'
import { bloomSound } from '@/components/providers/sound-provider'
import { formatCodeForDisplay } from '@/lib/install-command'
import { useBundle, prettify } from '@/components/providers/bundle-provider'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'
import { CodeDrawer } from '@/components/docs/preview/code-drawer'
import { PreviewContent } from '@/components/docs/preview/preview-content'
import { getEffectiveContained } from '@/config/preview-config'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'
import registryMeta from '@/__registry__/meta.json'
import { usePathname } from 'next/navigation'
import { ProSplitPlaceholder } from './pro-split-placeholder'
import { useProAccess } from '@/components/providers/pro-access-provider'

export interface ShowcaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string
  title?: string
  iframe?: boolean
  restart?: boolean
  open?: boolean
  allowCopy?: boolean
  contained?: boolean
  container?: boolean
  isPro?: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ShowcaseCard({
  name,
  description,
  title,
  iframe,
  restart = false,
  open,
  allowCopy = true,
  contained,
  container,
  className,
  children,
  id,
  ...props
}: ShowcaseCardProps) {
  const [key, setKey] = useState(0)
  const { themeOverride, setThemeOverride } = usePreviewTheme(name)
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false)
  const { isSplit, setActivePreview, activePreview, registerDefaultPreview } = useLayoutMode()
  const { has, toggle } = useBundle()
  const isBundled = has(name)
  const isSelected = activePreview?.name === name
  const { entry, error: registryError } = useRegistryEntry(name)
  const componentGroup = getRegistryComponentGroup(name)
  const isBlock = name.includes('block') || Boolean(componentGroup?.includes('block'))
  const isShader = name.includes('shader') || Boolean(componentGroup?.includes('shader'))
  const useIframe = iframe !== undefined ? iframe : isBlock
  const Component = index[name]?.component

  const rawContained = contained !== undefined ? contained : container
  const effectiveContained = getEffectiveContained(contained, container, name, componentGroup)
  const effectiveOpen = open ?? !effectiveContained

  const pathname = usePathname()
  const cleanGroup = componentGroup?.replace(/^demo-/, '')
  const derivedSlug = name.replace(/^(demo-)?(c|b|p)-/, '').replace(/-\d+$/, '')
  const pageSlug = pathname ? pathname.split('/').filter(Boolean).pop() : undefined
  const metaRecord = registryMeta as Record<string, any>

  const isPro = Boolean(
    props.isPro ||
    (Component as any)?.isPro ||
    entry?.isPro ||
    entry?.meta?.isPro ||
    metaRecord[name]?.isPro === true ||
    metaRecord[name]?.meta?.isPro === true ||
    (cleanGroup && metaRecord[cleanGroup]?.isPro === true) ||
    (derivedSlug &&
      (metaRecord[derivedSlug]?.isPro === true ||
        metaRecord[`components-spaceui-${derivedSlug}`]?.isPro === true ||
        metaRecord[`blocks-${derivedSlug}`]?.isPro === true ||
        metaRecord[`components-shader-${derivedSlug}`]?.isPro === true)) ||
    (pageSlug &&
      (metaRecord[pageSlug]?.isPro === true ||
        metaRecord[`components-spaceui-${pageSlug}`]?.isPro === true ||
        metaRecord[`blocks-${pageSlug}`]?.isPro === true ||
        metaRecord[`components-shader-${pageSlug}`]?.isPro === true)) ||
    (entry?.registryDependencies as string[] | undefined)?.some((dep) => {
      const depName = dep.replace(/.*\/([^/]+)\.json$/, '$1')
      return metaRecord[depName]?.isPro === true
    }),
  )

  const hasProAccess = useProAccess()
  const isLocked = isPro && !hasProAccess

  const previewName = useMemo(() => {
    return name
  }, [name])

  const code = useMemo(() => {
    return formatCodeForDisplay(entry?.files?.[0]?.content) || null
  }, [entry])

  const displayLabel = description || title || name.replace(/^demo-primitives-/, '').replace(/^p-/, '')
  const cardId = id || `example-${slugify(displayLabel || name)}`

  useEffect(() => {
    if (!activePreview && (Component || useIframe)) {
      registerDefaultPreview({
        name,
        title: displayLabel,
        component: Component,
        useIframe,
        previewName,
        code,
        themeOverride,
        restart,
        open: effectiveOpen,
        contained: effectiveContained,
      })
    }
  }, [
    activePreview,
    Component,
    useIframe,
    name,
    displayLabel,
    previewName,
    code,
    themeOverride,
    restart,
    open,
    effectiveContained,
    registerDefaultPreview,
  ])

  return (
    <div
      id={cardId}
      data-slot="showcase-card"
      data-toc-title={displayLabel}
      className={cn('rounded-2xl bg-muted w-full p-2 flex flex-col gap-2 not-prose scroll-mt-24', className)}
      {...props}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2 pt-1 pb-0.5 min-h-8">
        <span className="text-sm text-muted-foreground font-semibold truncate max-w-[40%] capitalize">
          {displayLabel}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {restart && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                bloomSound()
                setKey((prev) => prev + 1)
              }}
              className="size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-[0.96]"
              title="Restart demo"
              aria-label="Restart demo"
            >
              <IconRotateClockwise className="size-3.5" />
            </Button>
          )}

          {effectiveOpen && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                bloomSound()
                window.open(`/registry/view/${previewName}`, '_blank')
              }}
              className="size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-[0.96]"
              title="Open in new window"
              aria-label="Open in new window"
            >
              <IconExternalLink className="size-3.5" />
            </Button>
          )}

          {/* {allowCopy && code && (
            <CopyButton
              content={code}
              variant="ghost"
              size="default"
              className="size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.96]"
            />
          )} */}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              bloomSound()
              toggle({ slug: name, title: displayLabel || prettify(name) })
            }}
            className={cn(
              'size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.96] transition-all',
              isBundled && 'bg-secondary border-4 border-background text-foreground font-semibold',
            )}
            title={isBundled ? 'Remove from bundle' : 'Add to bundle'}
            aria-label={isBundled ? 'Remove from bundle' : 'Add to bundle'}
          >
            <IconPackage className="size-3.5" />
          </Button>

          {isSplit && !isSelected && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                bloomSound()
                setActivePreview({
                  name,
                  title: displayLabel,
                  component: Component,
                  useIframe,
                  previewName,
                  code,
                  themeOverride,
                  restart,
                  open,
                  contained: effectiveContained,
                })
              }}
              className="size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.96]"
              title="Show on Canvas Stage"
            >
              <IconMaximize className="size-3.5" />
            </Button>
          )}

          {!(isSplit && isSelected) && (
            <ModeSwitcher
              variant="ghost"
              size="icon"
              value={themeOverride}
              onValueChange={setThemeOverride}
              className="size-7 bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.96]"
              iconSize="size-3.5"
              enableTransition={false}
            />
          )}

          {/* View Code Drawer Trigger */}
          {!isLocked && (
            <Button
              size="default"
              variant="ghost"
              onClick={() => {
                bloomSound()
                setCodeDrawerOpen(true)
              }}
              className="gap-1.5 bg-background hover:bg-background text-xs text-foreground cursor-pointer font-medium"
            >
              {/* <IconFileCode className="size-3.5 text-muted-foreground" /> */}
              <span>Code</span>
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="rounded-[0.875rem] bg-background h-full min-h-55 flex items-center justify-center relative overflow-hidden group">
        {isSplit && isSelected ? (
          <ProSplitPlaceholder />
        ) : (
          <PreviewContent
            name={name}
            previewName={previewName}
            componentGroup={componentGroup}
            Component={Component}
            children={children}
            useIframe={useIframe}
            contained={effectiveContained}
            themeOverride={themeOverride}
            registryError={Boolean(registryError)}
            reloadKey={key}
          />
        )}
      </div>

      {/* View Code Right Drawer */}
      <CodeDrawer
        open={codeDrawerOpen}
        onOpenChange={setCodeDrawerOpen}
        name={name}
        title={displayLabel}
        code={code}
        previewName={previewName}
      />
    </div>
  )
}
