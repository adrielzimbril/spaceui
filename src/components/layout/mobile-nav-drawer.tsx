'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/registry/lib/utils'
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerContent,
  DrawerHeader,
  DrawerPanel,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
} from '@/registry/primitives/drawer'
import { Link } from '@/registry/primitives/link'
import { Badge } from '@/registry/primitives/badge'
import { Button } from '@/registry/primitives/button'
import { Input } from '@/registry/primitives/input'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'
import { useMediaQuery } from '@/registry/hooks/browser/use-media-query'
import { IconLogo } from '@/components/layout/icon-logo'
import { Kbd } from '@/registry/primitives/kbd'
import {
  IconArrowRight,
  IconArrowLeft,
  IconCrown,
  IconAtom,
  IconBook,
  IconBox,
  IconChevronRight,
  IconCircle,
  IconCode,
  IconCompass,
  IconCreditCard,
  IconDeviceDesktop,
  IconFlag,
  IconFolderHeart,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogin,
  IconMenu,
  IconMenu2,
  IconMoodSmile,
  IconNetwork,
  IconSparkles,
  IconTool,
  IconX,
  IconSearch,
  IconFolderOpen,
} from '@tabler/icons-react'
import {
  extractSectionsFromNode,
  sortComponentsSections,
  NavBadge,
  type PageItem,
  type SectionItem,
} from '@/lib/nav-registry'

interface MobileNavDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trees?: any[]
  trigger?: React.ReactElement
  triggerClassName?: string
}

function getGroupIcon(group: string, title?: string) {
  if (title === 'Others') return IconFolderOpen
  switch (group) {
    case 'Docs':
      return IconBook
    case 'Primitives':
      return IconBox
    case 'Components':
      return IconAtom
    case 'Hooks & Utils':
      return IconCode
    case 'Blocks':
      return IconFolderHeart
    case 'Templates':
      return IconDeviceDesktop
    case 'Icons':
      return IconMoodSmile
    case 'Tools':
      return IconTool
    default:
      return IconSparkles
  }
}

import { mobileNavGroups, type NavItem } from '@/config/menu-config'

const NAV_GROUPS = mobileNavGroups

// ----------------- Components -----------------

export function MobileNavDrawer({ open, onOpenChange, trees = [], trigger, triggerClassName }: MobileNavDrawerProps) {
  const pathname = usePathname()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const [searchQuery, setSearchQuery] = React.useState('')
  const [drillTarget, setDrillTarget] = React.useState<NavItem | null>(null)
  const activeItemRef = React.useRef<HTMLAnchorElement | null>(null)

  const handleLinkClick = () => {
    setIsOpen(false)
    // reset state after closing
    setTimeout(() => {
      setSearchQuery('')
      setDrillTarget(null)
    }, 300)
  }

  React.useEffect(() => {
    if (drillTarget && activeItemRef.current) {
      const el = activeItemRef.current
      const timer = setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [drillTarget, pathname])

  // Determine sections for drill target
  const drillSections = React.useMemo<SectionItem[]>(() => {
    if (!drillTarget || !trees.length) return []
    const sourceTree = trees[0]
    const uiKitTree = trees[1]

    if (drillTarget.title === 'Others' || (drillTarget.group === 'Docs' && drillTarget.isDrillable)) {
      const docsNodes = sourceTree?.children ?? []
      return extractSectionsFromNode(docsNodes)
    }

    if (drillTarget.title === 'Hooks & Utils') {
      const uiKitNodes = uiKitTree?.children ?? []
      const hooksFolder = uiKitNodes.find(
        (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('hook') || n.$id?.includes('hooks')),
      )
      return hooksFolder ? extractSectionsFromNode([hooksFolder]) : []
    }

    if (drillTarget.title === 'Primitives') {
      const uiKitNodes = uiKitTree?.children ?? []
      const primitivesFolder = uiKitNodes.find(
        (n: any) =>
          n.type === 'folder' && (n.name?.toLowerCase().includes('primitive') || n.$id?.includes('primitives')),
      )
      return primitivesFolder ? extractSectionsFromNode([primitivesFolder]) : []
    }

    if (drillTarget.title === 'Blocks') {
      const uiKitNodes = uiKitTree?.children ?? []
      const blocksFolder = uiKitNodes.find(
        (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('block') || n.$id?.includes('blocks')),
      )
      return blocksFolder ? extractSectionsFromNode([blocksFolder]) : []
    }

    if (drillTarget.title === 'Templates') {
      const uiKitNodes = uiKitTree?.children ?? []
      const templatesFolder = uiKitNodes.find(
        (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('template') || n.$id?.includes('templates')),
      )
      return templatesFolder ? extractSectionsFromNode([templatesFolder]) : []
    }

    if (drillTarget.title === 'Components') {
      const uiKitNodes = uiKitTree?.children ?? []
      const nonPrimitives = uiKitNodes.filter(
        (n: any) =>
          n.type === 'folder' &&
          !n.name?.toLowerCase().includes('primitive') &&
          !n.$id?.includes('primitives') &&
          !n.name?.toLowerCase().includes('hook') &&
          !n.$id?.includes('hooks') &&
          !n.name?.toLowerCase().includes('block') &&
          !n.$id?.includes('blocks') &&
          !n.name?.toLowerCase().includes('template') &&
          !n.$id?.includes('templates'),
      )
      return sortComponentsSections(extractSectionsFromNode(nonPrimitives))
    }

    return []
  }, [drillTarget, trees])

  // Category counts map for Root View
  const categoryCounts = React.useMemo<Record<string, number | undefined>>(() => {
    if (!trees.length) return {}
    const sourceTree = trees[0]
    const uiKitTree = trees[1]
    const uiKitNodes = uiKitTree?.children ?? []

    const hooksFolder = uiKitNodes.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('hook') || n.$id?.includes('hooks')),
    )
    const hooksCount = hooksFolder
      ? extractSectionsFromNode([hooksFolder]).reduce((acc, s) => acc + s.items.length, 0)
      : 0

    const primitivesFolder = uiKitNodes.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('primitive') || n.$id?.includes('primitives')),
    )
    const primitivesCount = primitivesFolder
      ? extractSectionsFromNode([primitivesFolder]).reduce((acc, s) => acc + s.items.length, 0)
      : 0

    const blocksFolder = uiKitNodes.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('block') || n.$id?.includes('blocks')),
    )
    const blocksCount = blocksFolder
      ? extractSectionsFromNode([blocksFolder]).reduce((acc, s) => acc + s.items.length, 0)
      : 0

    const templatesFolder = uiKitNodes.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('template') || n.$id?.includes('templates')),
    )
    const templatesCount = templatesFolder
      ? extractSectionsFromNode([templatesFolder]).reduce((acc, s) => acc + s.items.length, 0)
      : 0

    const nonPrimitives = uiKitNodes.filter(
      (n: any) =>
        n.type === 'folder' &&
        !n.name?.toLowerCase().includes('primitive') &&
        !n.$id?.includes('primitives') &&
        !n.name?.toLowerCase().includes('hook') &&
        !n.$id?.includes('hooks') &&
        !n.name?.toLowerCase().includes('block') &&
        !n.$id?.includes('blocks') &&
        !n.name?.toLowerCase().includes('template') &&
        !n.$id?.includes('templates'),
    )
    const componentsCount = extractSectionsFromNode(nonPrimitives).reduce((acc, s) => acc + s.items.length, 0)

    const docsCount = sourceTree?.children
      ? extractSectionsFromNode(sourceTree.children).reduce((acc, s) => acc + s.items.length, 0)
      : 0

    return {
      Primitives: primitivesCount,
      Components: componentsCount,
      Blocks: blocksCount,
      Templates: templatesCount,
      'Hooks & Utils': hooksCount,
      Others: docsCount,
      Documentation: docsCount,
    }
  }, [trees])

  // Determine search results across all trees
  const searchResults = React.useMemo<SectionItem[]>(() => {
    if (!searchQuery.trim() || !trees.length) return []
    const allNodes = trees.flatMap((t) => t?.children ?? [])
    const allSections = extractSectionsFromNode(allNodes)

    const query = searchQuery.toLowerCase()
    const filtered: SectionItem[] = []

    for (const section of allSections) {
      const matchedItems = section.items.filter(
        (item) => item.name.toLowerCase().includes(query) || item.url.toLowerCase().includes(query),
      )
      if (matchedItems.length > 0) {
        filtered.push({ title: section.title, items: matchedItems })
      }
    }
    return filtered
  }, [searchQuery, trees])

  const renderBadge = (badgeType: string | undefined | null) => {
    if (!badgeType) return null
    return <NavBadge badge={badgeType as any} className="shrink-0 ml-auto" />
  }

  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} position={isDesktop ? 'left' : 'bottom'}>
      <DrawerTrigger
        render={
          (trigger as any) || (
            <Button
              variant="secondary"
              size="icon"
              className={cn('rounded-md lg:hidden cursor-pointer', triggerClassName)}
              aria-label="Open Navigation Menu"
            >
              <IconMenu2 className="size-5" />
            </Button>
          )
        }
      />

      <DrawerPopup
        variant={isDesktop ? 'inset' : 'default'}
        showBar={!isDesktop}
        className={cn(
          'bg-muted p-1 flex flex-col gap-2 h-full',
          isDesktop ? 'max-w-md' : 'sm:max-w-2xl self-center place-self-center',
        )}
      >
        {/* Header — Logo left, Close right, same as site-header */}
        <DrawerHeader className={cn('flex flex-col p-0!')}>
          {/* Header */}
          <div className="shrink-0 flex flex-row gap-2 items-center justify-between px-3.5 py-2! bg-background rounded-xl">
            <Link href="/" onClick={handleLinkClick} className="inline-flex items-center gap-2">
              <IconLogo size="sm" />
              <span className="text-sm font-semibold">Space UI</span>
            </Link>

            <DrawerTitle className="sr-only">Navigation</DrawerTitle>

            <Kbd className="ml-auto">Esc</Kbd>
            <DrawerClose
              render={
                <Button variant="secondary" size="icon" className="size-8 rounded-lg">
                  <IconX className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              }
            />
          </div>
          {/* Search Bar */}
          <div className="relative flex px-2 items-center bg-background rounded-xl border-transparent shadow-none before:hidden has-[input:focus-visible]:ring-0 text-sm font-normal">
            <span className="bg-muted aspect-square rounded-md px-2 py-0.5 inline-flex items-center justify-center">
              <IconSearch className="size-4 text-muted-foreground shrink-0" />
            </span>
            <Input
              type="search"
              placeholder="Search components, hooks, blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 place-content-center border-0 bg-transparent outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:border-transparent placeholder:text-muted-foreground/70 shadow-none text-sm"
              unstyled
              nativeInput
            />
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                variant="ghost"
                size="icon"
                className="transition-colors cursor-pointer"
              >
                <IconX className="size-3.5" />
              </Button>
            )}
          </div>
        </DrawerHeader>

        {/* Content Area */}
        <DrawerContent className="flex-1 min-h-0 overflow-hidden bg-background rounded-xl">
          <DrawerPanel className="p-0">
            {searchQuery.trim().length > 0 ? (
              /* ================= SEARCH RESULTS ================= */
              <div className="py-2">
                {searchResults.length > 0 ? (
                  searchResults.map((section, idx) => (
                    <div key={section.title}>
                      {idx > 0 && <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />}
                      <div className="flex items-center justify-between px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>{section.title}</span>
                        {section.items.length > 0 && (
                          <span className="text-[.6875rem] font-mono text-muted-foreground">
                            {section.items.length}
                          </span>
                        )}
                      </div>
                      <div className="px-2">
                        {section.items.map((item) => {
                          const Icon = item.icon || IconBook
                          return (
                            <Link
                              key={item.url}
                              href={item.url}
                              onClick={handleLinkClick}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition-colors text-foreground hover:bg-muted"
                            >
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">{item.name}</span>
                              {renderBadge(item.badge)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            ) : drillTarget ? (
              /* ================= DRILLED VIEW ================= */
              <div className="py-2">
                {/* Back Button */}
                <div className="px-2 pb-2 border-b border-border/70">
                  <Button
                    onClick={() => setDrillTarget(null)}
                    variant="ghost"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium px-2 py-1.5 transition-colors cursor-pointer rounded-lg hover:bg-muted"
                  >
                    <IconArrowLeft className="size-4" />
                    Back
                  </Button>
                </div>

                {drillSections.length > 0 ? (
                  drillSections.map((section, idx) => (
                    <div key={section.title} className="mt-2">
                      {idx > 0 && <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />}
                      <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{section.title}</span>
                        {section.items.length > 0 && (
                          <span className="text-[.6875rem] font-mono text-muted-foreground">
                            {section.items.length}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 px-2">
                        {section.items.map((item) => {
                          const isActive = pathname === item.url || pathname === `${item.url}/`
                          const Icon = item.icon || IconBox
                          return (
                            <Link
                              key={item.url}
                              ref={isActive ? (activeItemRef as any) : undefined}
                              href={item.url}
                              onClick={handleLinkClick}
                              className={cn(
                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
                                isActive ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted',
                              )}
                            >
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">{item.name}</span>
                              {renderBadge(item.badge)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">No items available.</div>
                )}
              </div>
            ) : (
              /* ================= ROOT VIEW ================= */
              <div className="py-2">
                {NAV_GROUPS.map((group, groupIdx) => (
                  <div key={group.label}>
                    {groupIdx > 0 && <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />}
                    <div className="text-muted-foreground px-4 py-1.5 text-xs font-medium">{group.label}</div>
                    <div className="flex flex-col gap-0.5 px-2">
                      {group.items.map((item) => {
                        const Icon = getGroupIcon(item.group, item.title)
                        const isCurrent = pathname === item.href || pathname.startsWith(item.href + '/')
                        const count = categoryCounts[item.title]
                        const isComingSoon =
                          item.badge === 'coming-soon' || item.upcoming || (typeof count === 'number' && count === 0)
                        const displayBadge = item.badge ?? (isComingSoon ? 'coming-soon' : undefined)

                        const innerContent = (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">{item.title}</span>
                              {renderBadge(displayBadge)}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {typeof count === 'number' && count > 0 && (
                                <span className="text-[.6875rem] font-mono text-muted-foreground">{count}</span>
                              )}
                              {item.isDrillable ? (
                                <IconChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
                              ) : (
                                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80 shrink-0">
                                  {item.group}
                                </span>
                              )}
                            </div>
                          </>
                        )

                        const itemClassName = cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors cursor-pointer outline-none text-left',
                          isCurrent && !item.isDrillable
                            ? 'bg-muted text-foreground'
                            : 'text-foreground hover:bg-muted',
                        )

                        if (item.isDrillable) {
                          return (
                            <Button
                              key={`${group.label}-${item.title}`}
                              variant="ghost"
                              onClick={() => setDrillTarget(item)}
                              className={itemClassName}
                            >
                              {innerContent}
                            </Button>
                          )
                        }

                        const isExternal = item.href?.startsWith('http')
                        const isInactive = item.upcoming && (item.href === '#' || !item.href)

                        return (
                          <Link
                            key={`${group.label}-${item.title}`}
                            href={item.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            onClick={isInactive ? (e) => e.preventDefault() : handleLinkClick}
                            className={cn(
                              itemClassName,
                              isInactive && 'cursor-default opacity-85 hover:bg-transparent',
                            )}
                          >
                            {innerContent}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Get All-Access CTA */}
                <div className="bg-border/70 mx-2 my-1.5 h-px" aria-hidden="true" />
                <div className="px-2 pb-1">
                  <Link
                    href="#"
                    onClick={handleLinkClick}
                    className="group/cta flex w-full items-center justify-between rounded-xl px-3 py-2.5 border border-amber-500/25 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 hover:border-amber-500/45 transition-all duration-200 cursor-pointer outline-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex shrink-0 items-center justify-center size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <IconCrown className="size-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">Get All-Access</span>
                          <Badge variant="warning" size="sm">
                            Coming Soon
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          Every Pro block, template & update.
                        </span>
                      </div>
                    </div>
                    <IconArrowRight className="size-4 text-muted-foreground group-hover/cta:text-foreground group-hover/cta:translate-x-0.5 transition-all duration-200 shrink-0 ml-2" />
                  </Link>
                </div>
              </div>
            )}
          </DrawerPanel>
        </DrawerContent>
        {/* Footer — mirrors CommandFooter + site-header right side actions */}
        {/* <DrawerFooter className="shrink-0 flex-row items-center justify-between! border-none px-0.5 pb-2 pt-0">
          <ModeSwitcher className="bg-background" />
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              variant="secondary"
              asButton
              className="inline-flex size-8 items-center justify-center bg-background rounded-md"
              aria-label="Dashboard"
            >
              <IconLayoutDashboard className="size-4" />
            </Link>
            <Link
              href="/login"
              variant="secondary"
              onClick={handleLinkClick}
              className="flex h-8 gap-2 items-center justify-center bg-background rounded-md px-3 text-sm font-medium hover:bg-muted text-foreground"
            >
              <IconLogin className="size-3.5" />
              <span>Sign in</span>
            </Link>
          </div>
        </DrawerFooter> */}
      </DrawerPopup>
    </Drawer>
  )
}
