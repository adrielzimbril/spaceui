import React from 'react'
import { LibraryLayoutWrapper } from '@/components/layout/library-layout-wrapper'
import { getCurrentUserSubscription } from '@/lib/subscription'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const { isPro } = await getCurrentUserSubscription()
  return <LibraryLayoutWrapper hasProAccess={isPro}>{children}</LibraryLayoutWrapper>
}
