'use client'

import { DocsSidebar } from '@/components/docs/layout/sidebar'
import { SiteLayout } from '@/components/layout/site-layout'
import { PlaygroundSplitView } from '@/components/playground'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'
import { ProAccessProvider } from '@/components/providers/pro-access-provider'
import { SidebarProvider } from '@/registry/primitives/sidebar'
import React from 'react'

import { usePathname } from 'next/navigation'
import { OpenRunde } from '@/registry/lib/fonts/open-runde'
import { cn } from '@/registry/lib/utils'

export function LibraryLayoutWrapper({
  children,
  hasProAccess = false,
}: {
  children: React.ReactNode
  hasProAccess?: boolean
}) {
  const { isStandard } = useLayoutMode()
  const pathname = usePathname()
  const isInteractions = pathname?.startsWith('/interactions') || pathname?.startsWith('/library/interactions')

  const fontClasses = isInteractions
    ? cn(
        OpenRunde.variable,
        'font-open-runde!',
        '[--font-body:var(--font-open-runde),sans-serif]! [--font-heading:var(--font-open-runde),sans-serif]! [--font-sans:var(--font-open-runde),sans-serif]!',
      )
    : undefined

  if (isStandard) {
    return (
      <div className={cn('min-h-screen flex flex-col', fontClasses)}>
        <ProAccessProvider hasProAccess={hasProAccess}>
          <SiteLayout>
            <div className="mx-auto flex w-full flex-1 flex-col px-0 md:px-4">
              <SidebarProvider className="min-h-min flex-1 items-start px-0 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
                <DocsSidebar />
                <div className="h-full w-full pt-16">{children}</div>
              </SidebarProvider>
            </div>
          </SiteLayout>
        </ProAccessProvider>
      </div>
    )
  }

  return (
    <div className={cn('h-full w-full min-h-screen flex flex-col', fontClasses)}>
      <ProAccessProvider hasProAccess={hasProAccess}>
        <PlaygroundSplitView>{children}</PlaygroundSplitView>
      </ProAccessProvider>
    </div>
  )
}
