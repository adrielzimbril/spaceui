'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/registry/lib/utils'
import { source, librarySource } from '@/lib/source'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import { slideSound } from '@/components/providers/sound-provider'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/registry/primitives/menu'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { Button } from '@/registry/primitives/button'
import { MenuAvatarIcon } from '@/components/layout/mega-menu'
import { HUBS, resolvePathSections, getActiveHub, NavBadge, type SectionItem, type HubItem } from '@/lib/nav-registry'
import { ProBadge } from '@/components/shared/pro-badge'

function HubItemContent({
  hub,
  isSelected,
  isTrigger = false,
}: {
  hub: HubItem
  isSelected?: boolean
  isTrigger?: boolean
}) {
  return (
    <>
      <MenuAvatarIcon seed={hub.title || hub.id} />
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            'text-foreground truncate leading-tight',
            isTrigger ? 'text-[.8125rem] font-semibold' : 'text-xs font-medium',
          )}
        >
          {hub.title}
        </span>
        <span
          className={cn(
            'text-muted-foreground truncate leading-tight',
            isTrigger ? 'text-[.6875rem]' : 'text-[.625rem]',
          )}
        >
          {hub.description}
        </span>
      </div>
      {/* {isSelected && <IconCheck className="size-3.5 text-primary shrink-0 ml-1" />} */}
      {isTrigger && (
        <IconChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1 group-hover:text-foreground transition-colors" />
      )}
    </>
  )
}

function getScrollParent(el: HTMLElement): HTMLElement | null {
  const slotted = el.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null
  if (slotted) return slotted
  let node = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

function scrollSidebarTo(el: HTMLElement, block: 'start' | 'center' = 'center') {
  const scrollContainer = getScrollParent(el)
  if (!scrollContainer) {
    el.scrollIntoView({ behavior: 'auto', block, inline: 'nearest' })
    return
  }
  const containerRect = scrollContainer.getBoundingClientRect()
  const itemRect = el.getBoundingClientRect()
  const relativeTop = itemRect.top - containerRect.top + scrollContainer.scrollTop
  const offset = block === 'center' ? containerRect.height / 2 - itemRect.height / 2 : 8
  scrollContainer.scrollTo({
    top: Math.max(0, relativeTop - offset),
    behavior: 'auto',
  })
}

export function DocsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  // Determine active hub
  const activeHub = React.useMemo(() => getActiveHub(pathname), [pathname])

  // Determine sections to display
  const sections = React.useMemo<SectionItem[]>(() => {
    return resolvePathSections(pathname, source.pageTree.children ?? [], librarySource.pageTree.children ?? [])
  }, [pathname])

  const isItemActive = React.useCallback(
    (url: string) => {
      if (pathname === url || pathname === `${url}/`) return true
      const pathParts = pathname.split('/').filter(Boolean)
      const urlParts = url.split('/').filter(Boolean)
      const pathSlug = pathParts.at(-1)
      const urlSlug = urlParts.at(-1)
      return Boolean(pathSlug && urlSlug && pathSlug === urlSlug && pathParts.length === urlParts.length)
    },
    [pathname],
  )

  React.useLayoutEffect(() => {
    let cancelled = false
    let attempts = 0

    const scrollToActive = () => {
      if (cancelled) return
      const item = activeItemRef.current
      if (item) {
        scrollSidebarTo(item, 'center')
        return true
      }
      const pathChunk = pathname.split('/').filter(Boolean)[0]
      const section = sections.find((entry) => {
        if (entry.items.some((item) => isItemActive(item.url))) return true
        const title = entry.title.toLowerCase()
        return Boolean(pathChunk && title.includes(pathChunk))
      })
      const heading = section ? sectionRefs.current[section.title] : null
      if (heading) {
        scrollSidebarTo(heading, 'start')
        return true
      }
      return false
    }

    const tick = () => {
      if (cancelled || attempts > 20) return
      attempts += 1
      if (!scrollToActive()) {
        requestAnimationFrame(tick)
      }
    }

    tick()
    const timeoutId = window.setTimeout(scrollToActive, 320)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [pathname, sections, isItemActive])

  return (
    <aside className="border-none w-64 not-lg:hidden sticky top-0 z-30 h-screen pt-2 overflow-hidden bg-background text-sm flex flex-col">
      <ScrollArea scrollFade scrollbarGutter className="w-full flex-1">
        {/* Hub Selector */}
        <Menu>
          <div className="p-2 relative">
            <MenuTrigger className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-background border-2 border-muted transition-all duration-300 outline-none text-left cursor-pointer">
              <HubItemContent hub={activeHub} isTrigger />
            </MenuTrigger>

            <MenuPopup align="start" sideOffset={8} className="z-50 w-58 rounded-xl p-1.5">
              <div className="flex flex-col gap-1 mt-0.5">
                {HUBS.map((hub) => {
                  const isSelected = activeHub.id === hub.id

                  return (
                    <MenuItem
                      key={hub.id}
                      onClick={() => router.push(hub.url)}
                      className={cn(
                        'flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors w-full cursor-pointer outline-none select-none',
                        isSelected
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground',
                      )}
                    >
                      <HubItemContent hub={hub} isSelected={isSelected} />
                    </MenuItem>
                  )
                })}
              </div>
            </MenuPopup>
          </div>
        </Menu>

        {/* Sections List */}
        <div className="flex flex-col gap-4 w-full py-2">
          {sections.map((section) => (
            <div
              key={section.title}
              ref={(node) => {
                sectionRefs.current[section.title] = node
              }}
              className="flex flex-col gap-1 p-2 text-sm font-medium"
            >
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  const heading = sectionRefs.current[section.title]
                  if (heading) scrollSidebarTo(heading, 'start')
                }}
                className="h-auto w-full justify-between px-2 py-1 text-[.6875rem] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-transparent hover:text-muted-foreground data-pressed:bg-transparent focus-visible:ring-0"
              >
                <span>{section.title}</span>
                {section.items.length > 0 && (
                  <span className="text-[.625rem] font-normal text-muted-foreground">{section.items.length}</span>
                )}
              </Button>

              <ul className="relative flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = isItemActive(item.url)
                  const Icon = item.icon

                  return (
                    <li key={`${item.url}-${item.name}`} ref={isActive ? activeItemRef : null} className="relative">
                      <Link
                        href={item.url}
                        prefetch={false}
                        onClick={() => slideSound('in')}
                        className={cn(
                          'group relative flex min-h-8 w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-[.8125rem] text-foreground font medium transition-all duration-150 outline-none cursor-pointer',
                          'hover:bg-accent hover:text-foreground',
                          isActive && 'bg-accent text-foreground font-medium',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {Icon && (
                            <Icon
                              className={cn(
                                'size-4 shrink-0 transition-colors',
                                isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                              )}
                              aria-hidden="true"
                            />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          {item.isPro && <ProBadge size="2xs" />}
                          <NavBadge badge={item.badge} />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
