'use client'

import { IconLayout2 } from '@tabler/icons-react'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { ToolbarButton } from '@/components/playground/playground-toolbar-button'
import { source, uiKitSource, resourcesSource } from '@/lib/source'

export function ResourceNav() {
  return (
    <MobileNavDrawer
      trees={[source.pageTree, uiKitSource.pageTree, resourcesSource.pageTree]}
      triggerClassName="flex!"
      trigger={
        <ToolbarButton label="Open navigation">
          <IconLayout2 className="size-4" />
        </ToolbarButton>
      }
    />
  )
}
