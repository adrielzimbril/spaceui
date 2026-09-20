'use client'

import React, { Suspense } from 'react'
import { cn } from '@/registry/lib/utils'
import Iframe from '@/components/docs/mdx/iframe'
import { Code } from '@/registry/primitives/code'
import { PreviewLoading } from '@/components/shared/preview-loading'

import { getEffectiveContained } from '@/config/preview-config'

export interface PreviewContentProps {
  name: string
  previewName?: string
  componentGroup?: string | null
  Component?: React.ComponentType<any>
  componentProps?: Record<string, unknown> | null
  children?: React.ReactNode
  useIframe?: boolean
  bigScreen?: boolean
  contained?: boolean
  container?: boolean
  themeOverride?: 'system' | 'light' | 'dark'
  registryError?: boolean
  reloadKey?: number | string
  className?: string
  externalUrl?: string
}

export function PreviewContent({
  name,
  previewName,
  componentGroup,
  Component,
  componentProps,
  children,
  useIframe = false,
  bigScreen = false,
  contained,
  container,
  themeOverride = 'system',
  registryError = false,
  reloadKey,
  className,
  externalUrl,
}: PreviewContentProps) {
  const isContained = getEffectiveContained(contained, container, name, componentGroup)

  const resolvedPreviewName = previewName || name

  if (
    !externalUrl &&
    !Component &&
    !children &&
    (registryError || (!componentGroup && !name.startsWith('demo-primitives-') && !name.startsWith('primitives-')))
  ) {
    return (
      <div className="flex min-h-65 w-full items-center justify-center p-8 gap-1 text-sm text-destructive">
        Unable to load component <Code>{name}</Code>.
      </div>
    )
  }

  if (useIframe) {
    return (
      <div
        key={reloadKey}
        data-slot="preview-viewport"
        className={cn(
          'flex size-full min-h-0 min-w-0 items-center justify-center',
          isContained ? 'p-4 sm:p-8' : 'p-0',
          className,
        )}
      >
        <div
          data-slot="preview"
          className={cn(
            'flex size-full min-h-0 min-w-0 items-center justify-center *:place-content-center *:justify-center ',
            isContained && 'w-full max-w-72',
          )}
        >
          <Iframe
            key={reloadKey}
            name={resolvedPreviewName}
            bigScreen={bigScreen}
            themeOverride={themeOverride}
            src={externalUrl}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      key={reloadKey}
      data-slot="preview-viewport"
      className={cn(
        'flex size-full min-h-[inherit] items-center justify-center',
        isContained ? 'p-4 sm:p-8' : 'p-0 overflow-y-auto overflow-x-hidden',
        themeOverride === 'dark'
          ? 'force-dark dark bg-background text-foreground'
          : themeOverride === 'light'
            ? 'force-light bg-background text-foreground'
            : '',
        className,
      )}
    >
      <div
        data-slot="preview"
        className={cn(
          'preview flex justify-center items-center *:place-content-center *:justify-center',
          isContained ? 'size-full max-w-72' : 'size-full',
        )}
      >
        {Component ? (
          <Suspense fallback={<PreviewLoading />}>
            <Component {...(componentProps ?? {})} />
          </Suspense>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
