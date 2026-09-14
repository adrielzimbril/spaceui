'use client'

import React from 'react'
import { useLayoutMode } from '@/components/providers/layout-mode-provider'
import { SidebarProvider } from '@/registry/primitives/sidebar'
import { SiteLayout } from '@/components/layout/site-layout'
import { DocsSidebar } from '@/components/docs/layout/sidebar'
import { PlaygroundSplitView } from '@/components/playground'

export function UiKitLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isStandard } = useLayoutMode()

  if (isStandard) {
    return (
      <SiteLayout>
        <div className="mx-auto flex w-full flex-1 flex-col px-0 md:px-4">
          <SidebarProvider className="min-h-min flex-1 items-start px-0 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
            <DocsSidebar />
            <div className="h-full w-full pt-16">{children}</div>
          </SidebarProvider>
        </div>
      </SiteLayout>
    )
  }

  return <PlaygroundSplitView>{children}</PlaygroundSplitView>
}
