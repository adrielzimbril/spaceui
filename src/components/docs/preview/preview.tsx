'use client'

import { getRegistryComponentGroup } from '@/__registry__/components'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/registry/primitives/tabs'
import { Button } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'
import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react'
import { usePreviewTheme } from '@/components/docs/preview/hooks/use-preview-theme'
import { index } from '@/__registry__/index'
import { motion, AnimatePresence } from 'motion/react'
import { ShikiRenderer } from '@/components/docs/code/shiki-renderer'
import ReactIcon from '@/registry/icons/react-icon'
import { type Binds, Tweakpane } from '@/components/docs/preview/tweakpane'
import { useRegistryEntry } from '@/components/docs/preview/hooks/use-registry-entry'
import { useIsMobile } from '@/registry/hooks/browser/use-media-query'
import {
  IconRotateClockwise,
  IconExternalLink,
  IconAdjustmentsHorizontal,
  IconMaximize,
  IconPackage,
  IconSparkles,
  IconLayersIntersect,
  IconComponents,
  IconAtom,
  IconBox,
  IconTerminal2,
  IconRocket,
  IconGalaxy,
} from '@tabler/icons-react'
import { CopyButton } from '@/registry/components/spaceui/copy'
import { bloomSound } from '@/components/providers/sound-provider'
import { formatCodeForDisplay } from '@/lib/install-command'
import { useBundle, prettify } from '@/components/providers/bundle-provider'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'
import { getEffectiveContained } from '@/config/preview-config'
import { ShowcaseCard } from './showcase-card'
import { PreviewContent } from './preview-content'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'

export interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  iframe?: boolean
  bigScreen?: boolean
  title?: string
  description?: string
  variant?: 'default' | 'showcase' | 'card'
  restart?: boolean
  open?: boolean
  allowCopy?: boolean
  contained?: boolean
  container?: boolean
  isPro?: boolean
}

const PRO_ICONS = [
  { id: 'components', component: IconComponents },
  { id: 'layers', component: IconLayersIntersect },
  { id: 'atom', component: IconAtom },
  { id: 'box', component: IconBox },
  { id: 'terminal', component: IconTerminal2 },
  { id: 'galaxy', component: IconGalaxy },
  { id: 'rocket', component: IconRocket },
]

function ProSplitPlaceholder() {
  const [iconIndex, setIconIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % PRO_ICONS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const current = PRO_ICONS[iconIndex]
  const CurrentIcon = current.component

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 min-h-75 select-none text-center">
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current.id}
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(4px)', rotate: -20 }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)', rotate: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center text-muted-foreground/80"
          >
            <CurrentIcon className="size-9" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
        <span className="relative flex size-2 items-center justify-center shrink-0">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span>Active on Canvas Stage</span>
      </div>
    </div>
  )
}

function flattenFirstLevel(input?: Record<string, Record<string, unknown>> | null): Record<string, unknown> {
  if (!input) return {}

  return Object.values(input).reduce<Record<string, unknown>>((acc, current) => {
    return { ...acc, ...current }
  }, {})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValues(obj: Record<string, any>): Record<string, any> {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    if ('value' in obj) {
      return obj.value
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = unwrapValues(obj[key])
      }
    }
    return result
  }
  return obj
}

export function ComponentPreview({
  name,
  className,
  iframe,
  bigScreen = false,
  title,
  description,
  variant = 'default',
  restart = false,
  open,
  allowCopy = true,
  contained,
  container,
  children,
  ...props
}: ComponentPreviewProps) {
  const componentGroup = getRegistryComponentGroup(name)
  const isBlock = name.includes('block') || Boolean(componentGroup?.includes('block'))
  const isShader = name.includes('shader') || Boolean(componentGroup?.includes('shader'))
  const useIframe = iframe !== undefined ? iframe : isBlock
  const Component = index[name]?.component

  const rawContained = contained !== undefined ? contained : container
  const effectiveContained = getEffectiveContained(contained, container, name, componentGroup)
  const effectiveOpen = open ?? !effectiveContained

  if (variant === 'showcase' || variant === 'card') {
    return (
      <ShowcaseCard
        name={name}
        description={description}
        title={title}
        iframe={useIframe}
        restart={restart}
        open={effectiveOpen}
        allowCopy={allowCopy}
        contained={effectiveContained}
        className={className}
        {...props}
      >
        {children}
      </ShowcaseCard>
    )
  }

  const { isSplit, setActivePreview, activePreview, registerDefaultPreview, activeTweakName, setActiveTweakName } =
    useLayoutMode()
  const { has, toggle } = useBundle()
  const isBundled = has(name)
  const isSelected = activePreview?.name === name

  const isMobile = useIsMobile()
  const [binds, setBinds] = useState<Binds | null>(null)
  const [componentProps, setComponentProps] = useState<Record<string, unknown> | null>(null)
  const hasAutoOpenedRef = useRef(false)

  useEffect(() => {
    if (isSelected && !hasAutoOpenedRef.current && !isMobile && binds && activeTweakName === null) {
      hasAutoOpenedRef.current = true
      setActiveTweakName(name)
    }
  }, [isSelected, isMobile, binds, activeTweakName, name, setActiveTweakName])

  const [key, setKey] = useState(0)
  const { themeOverride, setThemeOverride } = usePreviewTheme(name)
  const { entry, error: registryError } = useRegistryEntry(name)

  const isPro = Boolean(
    props.isPro || (Component as any)?.isPro || entry?.isPro || entry?.meta?.isPro || name.includes('slosh-slider'),
  )

  const previewName = useMemo(() => {
    const flattenedProps = flattenFirstLevel(componentProps as Record<string, Record<string, unknown>> | null)
    const serializedProps = Object.keys(flattenedProps).length
      ? `?props=${encodeURIComponent(JSON.stringify(flattenedProps))}`
      : ''

    return `${name}${serializedProps}`
  }, [componentGroup, componentProps, name])

  const code = useMemo(() => {
    return formatCodeForDisplay(entry?.files?.[0]?.content) || null
  }, [entry])

  useEffect(() => {
    const demoProps = (Component as any)?.demoProps ?? entry?.meta?.demoProps ?? {}

    setBinds(Object.keys(demoProps).length > 0 ? (demoProps as Binds) : null)
    setComponentProps(Object.keys(demoProps).length > 0 ? unwrapValues(demoProps) : null)
  }, [entry, Component])

  useEffect(() => {
    if (!binds) return
    const unwrapped = unwrapValues(binds)
    setComponentProps(unwrapped)
    setActivePreview((current: any) => {
      if (current && current.name === name) {
        return {
          ...current,
          binds,
          componentProps: unwrapped,
          previewName,
        }
      }
      return current
    })
  }, [binds, name, previewName, setActivePreview])

  const isEffectivelySelected = activePreview ? activePreview.name === name : isSplit
  const [tab, setTab] = useState<'preview' | 'code'>(() => (isSplit ? 'code' : 'preview'))

  useEffect(() => {
    if (isSplit) {
      if (isEffectivelySelected) {
        setTab('code')
      } else {
        setTab('preview')
      }
    } else {
      setTab('preview')
    }
  }, [isSplit, isEffectivelySelected])

  const effectiveRestart = restart || Boolean(binds)

  const handleReset = () => {
    setKey((prev) => prev + 1)
    const demoProps = (Component as any)?.demoProps ?? entry?.meta?.demoProps ?? {}
    if (Object.keys(demoProps).length > 0) {
      setBinds(demoProps as Binds)
      setComponentProps(unwrapValues(demoProps))
    }
  }

  const handleActivate = React.useCallback(() => {
    if (activePreview?.name !== name) {
      setActivePreview({
        name,
        title: title ?? name,
        component: Component,
        componentProps,
        useIframe,
        previewName,
        code,
        binds,
        themeOverride,
        restart: effectiveRestart,
        open: effectiveOpen,
        contained: effectiveContained,
        componentGroup,
        bigScreen,
      })
    }
  }, [
    activePreview?.name,
    name,
    title,
    Component,
    componentProps,
    useIframe,
    previewName,
    code,
    binds,
    themeOverride,
    effectiveRestart,
    effectiveOpen,
    effectiveContained,
    componentGroup,
    bigScreen,
    setActivePreview,
  ])

  useEffect(() => {
    if (!activePreview && (Component || useIframe)) {
      registerDefaultPreview({
        name,
        title: title ?? name,
        component: Component,
        componentProps,
        useIframe,
        previewName,
        code,
        binds,
        themeOverride,
        restart: effectiveRestart,
        open: effectiveOpen,
        contained: effectiveContained,
        componentGroup,
        bigScreen,
      })
    }
  }, [
    activePreview,
    name,
    title,
    Component,
    componentProps,
    useIframe,
    previewName,
    code,
    binds,
    themeOverride,
    effectiveRestart,
    effectiveOpen,
    effectiveContained,
    componentGroup,
    bigScreen,
    registerDefaultPreview,
  ])

  const showToolbar = effectiveRestart || effectiveOpen || Boolean(binds)

  return (
    <div
      onClickCapture={handleActivate}
      className={cn('rounded-2xl bg-muted w-full p-2 mt-5.5 not-prose', className)}
      {...props}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'preview' | 'code')} className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-1 pt-1">
          <div className="flex items-center gap-2">
            {!isPro && (
              <TabsList
                className={cn(
                  'flex items-center rounded-lg bg-background p-1 font-medium relative z-0',
                  !title && 'ml-auto',
                )}
                aria-label="Preview and Code"
              >
                <TabsTrigger
                  value="preview"
                  disabled={isSplit && isEffectivelySelected}
                  onClick={() => {
                    if (isSplit && isEffectivelySelected) return
                    bloomSound()
                    setTab('preview')
                  }}
                  className={cn(
                    'relative z-10 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted',
                    isSplit && isEffectivelySelected && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  onClick={() => {
                    bloomSound()
                    setTab('code')
                  }}
                  className="relative z-10 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground outline-none cursor-pointer transition-all duration-300 data-active:bg-muted"
                >
                  Code
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="icon-lg"
              variant="ghost"
              onClick={() => {
                bloomSound()
                toggle({ slug: name, title: title ?? prettify(name) })
              }}
              className={cn(
                'bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all duration-300 active:scale-[0.96]',
                isBundled && 'bg-secondary border-4 border-background text-foreground font-bold',
              )}
              title={isBundled ? 'Remove from bundle' : 'Add to bundle'}
              aria-label={isBundled ? 'Remove from bundle' : 'Add to bundle'}
            >
              <IconPackage className="size-3.5" />
            </Button>
            {isSplit && !isEffectivelySelected && (
              <Button
                size="icon-lg"
                variant="ghost"
                onClick={() => {
                  bloomSound()
                  setActivePreview({
                    name,
                    title: title ?? name,
                    component: Component,
                    componentProps,
                    useIframe,
                    previewName,
                    code,
                    binds,
                    themeOverride,
                    restart,
                    open,
                    contained: effectiveContained,
                    componentGroup,
                    bigScreen,
                  })
                }}
                className="bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all duration-300 active:scale-[0.96]"
                title="Show on Canvas Stage"
              >
                <IconMaximize className="size-3.5" />
              </Button>
            )}
            {!(isSplit && isEffectivelySelected) && (
              <ModeSwitcher
                variant="ghost"
                size="icon-lg"
                value={themeOverride}
                onValueChange={setThemeOverride}
                className="bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all duration-300 active:scale-[0.96]"
                iconSize="size-3.5"
                enableTransition={false}
              />
            )}
            {allowCopy && !isPro && code && (
              <CopyButton
                content={code}
                variant="ghost"
                size="lg"
                className="rounded-md bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all duration-300 active:scale-[0.96]"
              />
            )}
          </div>
        </div>

        <TabsContent
          value="preview"
          className="rounded-[0.875rem] bg-background outline-none mt-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-center flex-col md:flex-row min-h-105 relative">
            <div className="relative size-full flex-1 min-w-0 h-[stretch] flex items-center justify-center">
              {/* Floating controls in top-right only if enabled via props */}
              {showToolbar && (
                <div className="pointer-events-auto absolute right-4 top-4 z-30 flex select-none items-center justify-center gap-1 rounded-xl bg-muted p-1.5">
                  {/* Restart / Reset component animation */}
                  {effectiveRestart && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={handleReset}
                      className="rounded-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                      title={binds ? 'Reset demo & controls' : 'Restart component'}
                      aria-label="Restart component"
                    >
                      <IconRotateClockwise className="size-3.5" />
                    </Button>
                  )}

                  {effectiveOpen && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => window.open(`/registry/view/${previewName}`, '_blank')}
                      className="rounded-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                      title="Open in new window"
                      aria-label="Open in new window"
                    >
                      <IconExternalLink className="size-3.5" />
                    </Button>
                  )}

                  {binds && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleActivate()
                        setActiveTweakName((prev) => (prev === name ? null : name))
                      }}
                      className={cn(
                        'rounded-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer',
                        activeTweakName === name && 'bg-background text-muted-foreground',
                      )}
                      title="Configure props"
                      aria-label="Toggle tweakpane"
                    >
                      <IconAdjustmentsHorizontal className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}

              {/* Component Rendering */}
              <PreviewContent
                name={name}
                previewName={previewName}
                componentGroup={componentGroup}
                Component={Component}
                componentProps={componentProps}
                children={children}
                useIframe={useIframe}
                bigScreen={bigScreen}
                contained={effectiveContained}
                themeOverride={themeOverride}
                registryError={Boolean(registryError)}
                reloadKey={key}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="rounded-[0.875rem] bg-background py-1.5 overflow-hidden outline-none mt-2">
          {isPro ? <ProSplitPlaceholder /> : <ShikiRenderer code={code ?? ''} lang="tsx" className="max-h-126" />}
        </TabsContent>
      </Tabs>

      {binds && activeTweakName === name ? (
        <Tweakpane binds={binds} onBindsChange={setBinds} show onClose={() => setActiveTweakName(null)} />
      ) : null}
    </div>
  )
}
