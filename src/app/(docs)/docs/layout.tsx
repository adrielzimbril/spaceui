import React from 'react'
import { UiKitLayoutWrapper } from '@/components/layout/ui-kit-layout-wrapper'
import { getCurrentUserSubscription } from '@/lib/subscription'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const { isPro } = await getCurrentUserSubscription()
  return <UiKitLayoutWrapper hasProAccess={isPro}>{children}</UiKitLayoutWrapper>
}
