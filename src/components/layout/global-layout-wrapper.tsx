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
  const marketingRoutes = ['/', '/tools', '/pricing', '/terms', '/privacy']

  const marketingStartsWithRoutes = ['/showcase']

  const isMarketing =
    marketingRoutes.includes(pathname) || marketingStartsWithRoutes.some((route) => pathname.startsWith(route))

  if (isImmersive || isResourceStudio) {
    return <>{children}</>
  }

  if (isMarketing) {
    return (
      <>
        <SiteHeader />
        {children}
        <FloatNav className="bottom-6" />
      </>
    )
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

  const content = isPreview ? (
    children
  ) : (
    <PackageManagerProvider>
      <BrandColorProvider>
        <BundleProvider>
          <LayoutModeProvider initialMode={initialLayoutMode}>
            <GlobalLayoutContent>{children}</GlobalLayoutContent>
          </LayoutModeProvider>
        </BundleProvider>
      </BrandColorProvider>
    </PackageManagerProvider>
  )

  return (
    <SquircleProvider>
      <ToastProvider>
        <AnchoredToastProvider>
          <SoundProvider>{content}</SoundProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </SquircleProvider>
  )
}
