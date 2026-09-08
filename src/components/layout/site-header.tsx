'use client'

import * as React from 'react'
import { IconLayoutDashboard, IconLogin } from '@tabler/icons-react'

import { IconLogo } from '@/components/layout/icon-logo'
import { CommandMenu } from '@/components/layout/command-menu'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'
import { MegaMenu } from '@/components/layout/mega-menu'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { source, uiKitSource, resourcesSource } from '@/lib/source'
import { useOffline } from '@/registry/hooks/browser/use-network'
import { Link } from '@/registry/primitives/link'
import { Badge } from '@/registry/primitives/badge'
import { GitHubLink } from '@/registry/components/spaceui/github-link'
import { searchNavShortcuts } from '@/config/menu-config'

export const SITE_NAV_ITEMS = searchNavShortcuts

export function SiteHeader() {
  const isOffline = useOffline()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex sm:grid h-16 grid-cols-[auto_1fr_auto] justify-between items-center gap-3 px-3 md:px-4 lg:px-8 xl:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" aria-label="Space UI home" className="inline-flex items-center text-foreground gap-2">
            <IconLogo size="lg" />
            <span className="text-sm font-semibold inline">Space UI</span>
            {isOffline && (
              <Badge size="sm" variant="destructive" className="ml-2">
                Offline
              </Badge>
            )}
          </Link>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          <MegaMenu />
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <div className="w-full flex-1 md:w-auto md:flex-none mr-1">
            <CommandMenu
              navItems={SITE_NAV_ITEMS.map((item) => ({
                href: item.href,
                label: item.label,
              }))}
              trees={[source.pageTree, uiKitSource.pageTree, resourcesSource.pageTree]}
            />
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <GitHubLink />
            <ModeSwitcher />
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

          <MobileNavDrawer trees={[source.pageTree, uiKitSource.pageTree, resourcesSource.pageTree]} />
        </div>
      </div>
    </header>
  )
}
