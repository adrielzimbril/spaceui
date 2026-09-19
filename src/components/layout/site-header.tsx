'use client'

import { turn as turnSound } from '@usespaceui/sounds'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { CommandMenu } from '@/components/layout/command-menu'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'
import { MegaMenu } from '@/components/layout/mega-menu'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { source, librarySource, resourcesSource } from '@/lib/source'
import { Link } from '@/registry/primitives/link'
import { GitHubLink } from '@/registry/components/spaceui/github-link'
import { searchNavShortcuts } from '@/config/menu-config'

export const SITE_NAV_ITEMS = searchNavShortcuts

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 pointer-events-none -mb-17">
      <div className="relative mx-auto flex sm:grid h-14 grid-cols-[auto_1fr_auto] justify-between items-center gap-3 px-3 md:px-4 lg:px-6 lg:grid-cols-[1fr_auto_1fr] rounded-2xl border border-border bg-background backdrop-blur-lg transition-colors duration-300 pointer-events-auto">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Space UI home"
            onClick={() => turnSound('back')}
            className="inline-flex items-center text-foreground gap-2.5 group motion-safe:active:scale-[0.97] transition-transform"
          >
            <div className="relative flex items-center justify-center size-8 shrink-0 overflow-visible">
              <Squishmoji
                seed="o"
                shape="lion"
                expression="loving"
                backgroundStyle="all"
                animate
                animOnClick
                animOnHover
                // animWobble
                size={48}
                className="relative scale-150 origin-center transition-transform"
              />
            </div>
            {/* <span className="text-sm font-bold inline ml-1.5 lg:hidden">Space UI</span> */}
          </Link>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          <MegaMenu />
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <div className="hidden sm:block w-full flex-1 md:w-auto md:flex-none mr-1">
            <CommandMenu
              navItems={SITE_NAV_ITEMS.map((item) => ({
                href: item.href,
                label: item.label,
              }))}
              trees={[source.pageTree, librarySource.pageTree, resourcesSource.pageTree]}
            />
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <div className="motion-safe:active:scale-[0.96] transition-transform">
              <GitHubLink />
            </div>
            {/* <div className="motion-safe:active:scale-[0.96] transition-transform">
              <ModeSwitcher size="lg" />
            </div> */}
            {/* <Link
              href="/dashboard"
              className="inline-flex size-8 items-center justify-center rounded-md"
              aria-label="Dashboard"
              variant="secondary"
              asButton
            >
              <IconLayoutDashboard className="size-4" />
            </Link> */}
          </div>

          {/* <Link href="/login" asButton className="hidden md:flex items-center gap-2 rounded-lg px-3">
            <IconLogin className="size-3.5" />
            <span>Sign in</span>
          </Link> */}

          <MobileNavDrawer trees={[source.pageTree, librarySource.pageTree, resourcesSource.pageTree]} />
        </div>
      </div>
    </header>
  )
}
