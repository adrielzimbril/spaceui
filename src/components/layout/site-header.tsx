'use client'

import { MegaMenu } from '@/components/layout/mega-menu'
import { searchNavShortcuts } from '@/config/menu-config'
import { siteConfig } from '@/config/space-config'
import { GitHubLink } from '@/registry/components/spaceui/github-link'
import { Button } from '@/registry/primitives/button'
import { Kbd, KbdGroup } from '@/registry/primitives/kbd'
import { Link } from '@/registry/primitives/link'
import { IconBrandX, IconSearch } from '@tabler/icons-react'
import { turn as turnSound } from '@usespaceui/sounds'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import dynamic from 'next/dynamic'

const CommandMenu = dynamic(() => import('@/components/layout/command-menu').then((mod) => mod.CommandMenu), {
  ssr: false,
  loading: () => (
    <Button variant="outline" size="lg" className="px-1 border-muted w-full">
      <span className="bg-muted aspect-square rounded-md px-1.5 py-0.5 inline-flex items-center justify-center">
        <IconSearch className="size-4 text-muted-foreground shrink-0" />
      </span>
      <span className="hidden sm:inline text-xs text-muted-foreground">Search…</span>
      <KbdGroup className="gap-1 ml-auto">
        <Kbd className="aspect-square">⌘</Kbd>
        <Kbd className="aspect-square">K</Kbd>
      </KbdGroup>
    </Button>
  ),
})

const MobileNavDrawer = dynamic(
  () => import('@/components/layout/mobile-nav-drawer').then((mod) => mod.MobileNavDrawer),
  { ssr: false },
)

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
            />
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={siteConfig.links.x}
              aria-label="Follow on X"
              rel="noreferrer"
              target="_blank"
              asButton
              variant="secondary"
              size="icon"
              className="relative px-[calc(--spacing(3.5)-1px)] sm:h-8 shadow-none motion-safe:active:scale-[0.96] transition-transform"
            >
              <IconBrandX className="size-4" />
            </Link>
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

          <MobileNavDrawer />
        </div>
      </div>
    </header>
  )
}
