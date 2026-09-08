'use client'

import {
  IconAtom,
  IconBook2,
  IconBox,
  IconCode,
  IconCompass,
  IconCornerDownLeft,
  IconDeviceDesktop,
  IconFolderHeart,
  IconHierarchy2,
  IconLayout,
  IconMoodSmile,
  IconPointerSearch,
  IconSearch,
  IconSparkles,
  IconTool,
  IconTypography,
  IconWand,
  IconArrowBackUp,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import * as React from 'react'
import { useClipboard } from '@/registry/hooks/browser/use-clipboard'
import { useIsMac } from '@/registry/hooks/browser/use-is-mac'
import { useEventListener } from '@/registry/hooks/dom/use-event-listener'
import { Button } from '@/registry/primitives/button'
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandShortcut,
} from '@/registry/primitives/command'
import { Kbd, KbdGroup } from '@/registry/primitives/kbd'
import { useConfig } from '@/hooks/use-config'
import type { source } from '@/lib/source'
import { EmptyMedia } from '@/registry/primitives/empty'
import { cn } from '@/registry/lib/utils'
import { searchStaticResources, searchNavShortcuts } from '@/config/menu-config'

interface PageItem {
  value: string
  label: string
  url: string
  group: string
  isComponent: boolean
  keywords?: string[]
}

interface PageGroup {
  value: string
  items: PageItem[]
}

const HOOK_COMPONENTS = new Set(['class', 'for', 'if', 'image', 'in-view', 'render-after', 'show', 'switch'])

const PURE_UTILS = new Set([
  'cache',
  'cookie',
  'event',
  'format-bytes',
  'format-content',
  'format-date',
  'format-text',
  'is-negative',
  'logger',
  'range-map',
  'sleep',
])

const GROUP_ORDER = [
  'Navigation',
  'Documentation',
  'Primitives',
  'Components',
  'Backgrounds',
  'Effects',
  'Texts',
  'Hooks',
  'Hook Components',
  'Utils',
  'Blocks',
  'Templates',
  'Icons',
  'Tools',
]

function getGroupIcon(group: string, isComponent: boolean) {
  switch (group) {
    case 'Navigation':
      return IconCompass
    case 'Primitives':
      return IconBox
    case 'Components':
      return IconAtom
    case 'Backgrounds':
      return IconSparkles
    case 'Effects':
      return IconWand
    case 'Texts':
      return IconTypography
    case 'Hooks':
      return IconCode
    case 'Hook Components':
      return IconHierarchy2
    case 'Utils':
      return IconTool
    case 'Blocks':
      return IconLayout
    case 'Templates':
      return IconDeviceDesktop
    case 'Icons':
      return IconMoodSmile
    case 'Documentation':
      return IconBook2
    case 'Tools':
      return IconFolderHeart
    default:
      return isComponent ? IconAtom : IconBook2
  }
}

export function CommandMenu({
  tree,
  trees,
  navItems,
  ...props
}: ComponentProps<typeof CommandDialog> & {
  tree?: typeof source.pageTree | any
  trees?: Array<typeof source.pageTree | any>
  navItems?: { href: string; label: string }[]
}) {
  const isMac = useIsMac()
  const [config] = useConfig()
  const { copy: copyToClipboard } = useClipboard({ timeout: 2000 })
  const [open, setOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<'page' | 'component' | null>(null)
  const [copyPayload, setCopyPayload] = React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')

  // Convert tree structure(s) to categorized and grouped items
  const groupedItems = React.useMemo<PageGroup[]>(() => {
    const allItems: PageItem[] = []

    const formatSegment = (segment: string) => {
      return segment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }

    const collectPages = (node: any, defaultGroup = 'Documentation') => {
      if (!node) return

      if (node.type === 'page' && node.url) {
        const url = node.url as string
        const urlParts = url.split('/').filter(Boolean)
        const slug = urlParts[urlParts.length - 1] || ''

        let group = defaultGroup
        let isComponent = false

        if (url.startsWith('/ui-kit/primitives')) {
          group = 'Primitives'
          isComponent = true
        } else if (url.startsWith('/ui-kit/components/backgrounds') || url.includes('/backgrounds/')) {
          group = 'Backgrounds'
          isComponent = true
        } else if (
          url.startsWith('/ui-kit/components/effects') ||
          url.includes('/effects/') ||
          slug === 'motion-effect' ||
          slug === 'motion-highlight'
        ) {
          group = 'Effects'
          isComponent = true
        } else if (url.startsWith('/ui-kit/components/texts') || url.includes('/texts/') || slug === 'splitting') {
          group = 'Texts'
          isComponent = true
        } else if (url.startsWith('/ui-kit/components')) {
          group = 'Components'
          isComponent = true
        } else if (url.startsWith('/ui-kit/hooks')) {
          if (HOOK_COMPONENTS.has(slug)) {
            group = 'Hook Components'
            isComponent = true
          } else if (PURE_UTILS.has(slug)) {
            group = 'Utils'
            isComponent = false
          } else {
            group = 'Hooks'
            isComponent = false
          }
        } else if (url.startsWith('/ui-kit/blocks')) {
          group = 'Blocks'
          isComponent = true
        } else if (url.startsWith('/ui-kit/templates')) {
          group = 'Templates'
          isComponent = true
        } else if (url.startsWith('/docs/icons')) {
          group = 'Icons'
          isComponent = false
        } else if (url.startsWith('/docs')) {
          group = 'Documentation'
          isComponent = false
        } else if (url.startsWith('/tools')) {
          group = 'Tools'
          isComponent = false
        }

        const label = node.name || formatSegment(slug)

        if (!allItems.some((i) => i.url === url)) {
          allItems.push({
            value: `${group.toLowerCase()}-${slug}-${label.toLowerCase().replace(/\s+/g, '-')}`,
            label,
            url,
            group,
            isComponent,
            keywords: [group.toLowerCase(), slug, label.toLowerCase(), ...slug.split('-')],
          })
        }
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => collectPages(child, defaultGroup))
      }
    }

    // Process all trees provided
    const treeList = trees && trees.length > 0 ? trees : tree ? [tree] : []
    treeList.forEach((t) => {
      if (t && Array.isArray(t.children)) {
        t.children.forEach((child: any) => collectPages(child))
      } else if (t) {
        collectPages(t)
      }
    })

    // Add static resources from menu-config so tools like Icons, Emoji, etc. are searchable
    searchStaticResources.forEach((res) => {
      if (!allItems.some((i) => i.label.toLowerCase() === res.label.toLowerCase() || i.url === res.url)) {
        allItems.push({
          value: res.value,
          label: res.label,
          url: res.url,
          group: 'Tools',
          isComponent: false,
          keywords: res.keywords,
        })
      }
    })

    // Group items by category
    const groupMap = new Map<string, PageItem[]>()

    // Add navigation items first if provided or fallback to menu-config shortcuts
    const effectiveNavItems = navItems && navItems.length > 0 ? navItems : searchNavShortcuts
    if (effectiveNavItems && effectiveNavItems.length > 0) {
      groupMap.set(
        'Navigation',
        effectiveNavItems.map((item) => ({
          value: `nav-${item.href}-${item.label.toLowerCase()}`,
          label: item.label,
          url: item.href,
          group: 'Navigation',
          isComponent: false,
          keywords: ['nav', 'navigation', item.label.toLowerCase(), ...((item as any).keywords || [])],
        })),
      )
    }

    // Populate other groups
    allItems.forEach((item) => {
      const existing = groupMap.get(item.group) || []
      existing.push(item)
      groupMap.set(item.group, existing)
    })

    // Build ordered groups list
    const result: PageGroup[] = []

    GROUP_ORDER.forEach((groupName) => {
      const items = groupMap.get(groupName)
      if (items && items.length > 0) {
        items.sort((a, b) => a.label.localeCompare(b.label))
        result.push({
          value: groupName,
          items,
        })
        groupMap.delete(groupName)
      }
    })

    // Any remaining unlisted groups
    groupMap.forEach((items, groupName) => {
      if (items.length > 0) {
        items.sort((a, b) => a.label.localeCompare(b.label))
        result.push({
          value: groupName,
          items,
        })
      }
    })

    return result
  }, [tree, trees, navItems])

  const handlePageHighlight = (item: PageItem) => {
    if (item.isComponent) {
      const componentName = item.url.split('/').pop()
      setSelectedType('component')
      setCopyPayload(`npx space-ui add ${componentName}`)
    } else {
      setSelectedType('page')
      setCopyPayload(typeof window !== 'undefined' ? window.location.origin + item.url : item.url)
    }
  }

  // Keyboard shortcut (Cmd+K / Ctrl+K / slash)
  useEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }

      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        if (selectedType === 'page' || selectedType === 'component') {
          copyToClipboard(copyPayload)
        }
      }
    },
    typeof document !== 'undefined' ? document : undefined,
  )

  return (
    <CommandDialog onOpenChange={setOpen} open={open} {...props}>
      <CommandDialogTrigger render={<Button variant="outline" />} className="px-1 border-muted w-full">
        <span className="bg-muted aspect-square rounded-md px-1.5 py-0.5 inline-flex items-center justify-center">
          <IconSearch className="size-4 text-muted-foreground shrink-0" />
        </span>
        <span className="hidden sm:inline text-xs text-muted-foreground">Search…</span>
        <KbdGroup className="gap-1 ml-auto">
          <Kbd className={cn(isMac && 'aspect-square')}>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd className="aspect-square">K</Kbd>
        </KbdGroup>
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <Command
          items={groupedItems}
          onItemHighlighted={(highlightedValue) => {
            const item = highlightedValue as PageItem | null
            if (item) {
              handlePageHighlight(item)
            }
          }}
        >
          <CommandInput
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components, primitives, hooks, utils, docs…"
            className="bg-background! rounded-xl px-0 "
          />
          <CommandPanel>
            <CommandEmpty className="not-empty:py-12">
              {searchQuery.trim() && (
                <div className="wrap-break-word flex flex-col flex-wrap items-center gap-2">
                  <EmptyMedia variant="icon">
                    <IconPointerSearch />
                  </EmptyMedia>
                  <p>No results found.</p>
                  <p>
                    Press <Kbd>Enter</Kbd> to ask AI about:
                    <br /> <strong className="font-medium text-foreground">{searchQuery}</strong>
                  </p>
                </div>
              )}
            </CommandEmpty>
            <CommandList>
              {(group: PageGroup, _index: number) => (
                <CommandGroup items={group.items} key={group.value}>
                  <CommandGroupLabel>{group.value}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: PageItem) => {
                      const ItemIcon = getGroupIcon(item.group, item.isComponent)
                      const isExternal = item.url.startsWith('http')
                      return (
                        <CommandItem
                          className="flex w-full items-center justify-between"
                          key={item.value}
                          render={
                            <Link
                              href={item.url}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              onClick={() => setOpen(false)}
                            />
                          }
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ItemIcon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {/* {item.shortcut && (
                            <CommandShortcut>
                              {item.shortcut}
                            </CommandShortcut>
                          )} */}
                          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80 shrink-0 ml-2">
                            {item.group}
                          </span>
                        </CommandItem>
                      )
                    }}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>
                    <IconArrowUp />
                  </Kbd>
                  <Kbd>
                    <IconArrowDown />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <IconCornerDownLeft />
                </Kbd>
                <span>Open</span>
              </div>
            </div>
            {copyPayload && (
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <span className="truncate font-mono text-muted-foreground">{copyPayload}</span>
                <KbdGroup>
                  <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                  <Kbd>C</Kbd>
                </KbdGroup>
              </div>
            )}
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  )
}
