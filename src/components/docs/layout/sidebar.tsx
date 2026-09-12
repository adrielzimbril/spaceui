'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/registry/lib/utils'
import { source, uiKitSource } from '@/lib/source'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import { slideSound } from '@/components/providers/sound-provider'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/registry/primitives/menu'
import { ScrollArea } from '@/registry/primitives/scroll-area'
import { getColorForegroundClass } from '@/lib/theme-colors'
import { HUBS, resolvePathSections, getActiveHub, NavBadge, type SectionItem, type HubItem } from '@/lib/nav-registry'

function HubItemContent({
  hub,
  isSelected,
  isTrigger = false,
}: {
  hub: HubItem
  isSelected?: boolean
  isTrigger?: boolean
}) {
  const HubIcon = hub.icon

  return (
    <>
      <div
        className={cn(
          'aspect-square h-full! flex items-center justify-center shrink-0 p-0 overflow-hidden relative bg-muted!',
          isTrigger ? 'rounded-md size-8' : 'rounded-sm size-7',
        )}
        style={{ backgroundColor: hub.color }}
      >
        <div className={cn('flex items-center justify-center [&>svg]:size-4')}>
          <HubIcon className={isTrigger ? 'size-4' : 'size-3.5'} />
        </div>
      </div>
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
      {isSelected && <IconCheck className="size-3.5 text-primary shrink-0 ml-1" />}
      {isTrigger && (
        <IconChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1 group-hover:text-foreground transition-colors" />
      )}
    </>
  )
}

export function DocsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)

  // Determine active hub
  const activeHub = React.useMemo(() => getActiveHub(pathname), [pathname])

  // Determine sections to display
  const sections = React.useMemo<SectionItem[]>(() => {
    return resolvePathSections(pathname, source.pageTree.children ?? [], uiKitSource.pageTree.children ?? [])
  }, [pathname])

  // Auto-scroll to active item in sidebar viewport
  React.useEffect(() => {
    const scrollToActive = () => {
      const el = activeItemRef.current
      if (!el) return

      const scrollContainer = el.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const itemRect = el.getBoundingClientRect()

        const relativeTop = itemRect.top - containerRect.top + scrollContainer.scrollTop
        const targetScrollTop = relativeTop - containerRect.height / 2 + itemRect.height / 2

        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        })
      } else {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        })
      }
    }

    scrollToActive()
    const rafId = requestAnimationFrame(scrollToActive)
    const timeoutId = setTimeout(scrollToActive, 120)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
    }
  }, [pathname, sections])

  return (
    <aside className="border-none w-64 not-lg:hidden sticky top-[calc(var(--header-height,56px)+1px)] z-30 h-[calc(100vh-var(--header-height,56px)-1px)] overflow-hidden bg-background text-sm flex flex-col">
      <ScrollArea scrollFade scrollbarGutter className="w-full flex-1">
        {/* Hub Selector */}
        <Menu>
          <div className="p-3 relative">
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
            <div key={section.title} className="flex flex-col gap-1 px-3 py-2 text-sm font-medium">
              <div className="flex items-center justify-between px-2 py-1 text-[.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>{section.title}</span>
                {section.items.length > 0 && (
                  <span className="text-[.625rem] font-normal text-muted-foreground">{section.items.length}</span>
                )}
              </div>

              <ul className="relative flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.url || pathname === `${item.url}/`
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

                        {/* ReUI Soft Squircle Badges */}
                        <NavBadge badge={item.badge} />
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
