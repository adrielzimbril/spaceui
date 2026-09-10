'use client'

import { usePathname } from 'next/navigation'
import { ToastProvider, AnchoredToastProvider } from '@/registry/primitives/toast'
import { SiteHeader } from '@/components/layout/site-header'
import { SoundProvider } from '@/components/providers/sound-provider'
import { PackageManagerProvider } from '@/components/providers/package-manager-provider'
import { BrandColorProvider } from '@/components/providers/brand-color-provider'
import { BundleProvider } from '@/components/providers/bundle-provider'
import { LayoutModeProvider, useLayoutMode, Mode, type LayoutMode } from '@/components/providers/layout-mode-provider'
import { SquircleProvider } from '@/components/providers/squircle-provider'
import { FloatNav } from '@/components/layout/float-nav'

function GlobalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isStandard, isImmersive } = useLayoutMode()
  const isResourceStudio = pathname.startsWith('/tools/')

  if (isImmersive || isResourceStudio) {
    return <>{children}</>
  }

  if (!isStandard) {
    return (
      <>
        {children}
        <FloatNav />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      {children}
      {/* <SiteFooter /> */}
      <FloatNav />
    </>
  )
}

export function GlobalLayoutWrapper({
  children,
  initialLayoutMode = Mode.standard,
}: {
  children: React.ReactNode
  initialLayoutMode?: LayoutMode
}) {
  const pathname = usePathname()
  const isPreview = pathname.startsWith('/registry/view') || pathname.startsWith('/examples')

  return (
    <SquircleProvider>
      <ToastProvider>
        <AnchoredToastProvider>
          <SoundProvider>
            <PackageManagerProvider>
              <BrandColorProvider>
                <BundleProvider>
                  <LayoutModeProvider initialMode={initialLayoutMode}>
                    {isPreview ? <>{children}</> : <GlobalLayoutContent>{children}</GlobalLayoutContent>}
                  </LayoutModeProvider>
                </BundleProvider>
              </BrandColorProvider>
            </PackageManagerProvider>
          </SoundProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </SquircleProvider>
  )
}
