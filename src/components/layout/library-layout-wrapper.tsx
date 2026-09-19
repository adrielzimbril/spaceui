'use client'

import { DocsSidebar } from '@/components/docs/layout/sidebar'
import { SiteLayout } from '@/components/layout/site-layout'
import { PlaygroundSplitView } from '@/components/playground'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'
import { ProAccessProvider } from '@/components/providers/pro-access-provider'
import { SidebarProvider } from '@/registry/primitives/sidebar'
import React from 'react'

export function LibraryLayoutWrapper({
  children,
  hasProAccess = false,
}: {
  children: React.ReactNode
  hasProAccess?: boolean
}) {
  const { isStandard } = useLayoutMode()

  if (isStandard) {
    return (
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
    )
  }

  return (
    <ProAccessProvider hasProAccess={hasProAccess}>
      <PlaygroundSplitView>{children}</PlaygroundSplitView>
    </ProAccessProvider>
  )
}
