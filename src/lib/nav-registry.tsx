'use client'

import * as React from 'react'
import {
  IconBook,
  IconTerminal,
  IconEye,
  IconHelpCircle,
  IconFolderOpen,
  IconClock,
  IconFlag,
  IconCircle,
  IconLayoutGrid,
  IconSquare,
  IconCalendar,
  IconTable,
  IconFilter,
  IconBell,
  IconPin,
  IconStar,
  IconMaximize,
  IconChecklist,
  IconRoute,
  IconUsers,
  IconBox,
  IconFlame,
  IconPalette,
  IconSparkles,
  IconCpu,
  IconBrandNextjs,
  IconBrandVite,
  IconWand,
  IconFileCode,
  IconHandClick,
  IconTypography,
  IconIcons,
  IconRobot,
  IconPlug,
  IconFileDescription,
} from '@tabler/icons-react'
import { Badge } from '@/registry/primitives/badge'
import { DEFAULT_COLOR_CODE } from '@/lib/theme-colors'
import registryMeta from '@/__registry__/meta.json'
import { cn } from '@/registry/lib/utils'

export type BadgeType = 'new' | 'beta' | 'updated' | 'coming-soon'

export interface PageItem {
  name: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: BadgeType
}

export interface SectionItem {
  title: string
  items: PageItem[]
}

export interface HubItem {
  id: string
  title: string
  description: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  color: DEFAULT_COLOR_CODE | string
}

// ----------------- Hubs Configuration -----------------

export const HUBS: HubItem[] = [
  {
    id: 'docs-primitives',
    title: 'Docs & Primitives',
    description: 'Guides, ecosystem & core UI elements',
    url: '/docs',
    icon: IconBox,
    color: DEFAULT_COLOR_CODE.BLUE,
  },
  {
    id: 'hooks',
    title: 'React Hooks & Utils',
    description: 'Sensory hooks, control-flow & DX utilities',
    url: '/ui-kit/hooks',
    icon: IconSparkles,
    color: DEFAULT_COLOR_CODE.PURPLE,
  },
  {
    id: 'components',
    title: 'Components & Blocks',
    description: 'Complex components, animations & layouts',
    url: '/ui-kit/components',
    icon: IconLayoutGrid,
    color: DEFAULT_COLOR_CODE.LIME,
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Avatars, logos, flags & animated icons',
    url: '/tools',
    icon: IconPalette,
    color: DEFAULT_COLOR_CODE.ORANGE,
  },
]

// ----------------- Navigation Icons Map -----------------

export const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Docs - Overview / Getting Started
  '/docs': IconBook,
  '/docs/overview': IconBook,
  '/docs/accessibility': IconEye,
  '/docs/other-animated': IconFolderOpen,

  // Docs - Installation
  '/docs/installation': IconTerminal,
  '/docs/installation/nextjs': IconBrandNextjs,
  '/docs/installation/vite': IconBrandVite,
  '/docs/installation/lovable': IconWand,
  '/docs/installation/components-json': IconFileCode,
  '/docs/installation/manual': IconHandClick,

  // Docs - Fundamentals
  '/docs/fundamentals/colors': IconPalette,
  '/docs/fundamentals/typography': IconTypography,
  '/docs/fundamentals/iconography': IconIcons,

  // Docs - Ecosystem
  '/docs/ecosystem/changelog': IconClock,
  '/docs/ecosystem/roadmap': IconRoute,

  // Docs - AI & Automation
  '/docs/ai/agents': IconRobot,
  '/docs/ai/skills': IconFlame,
  '/docs/ai/mcp': IconPlug,
  '/docs/ai/llms': IconFileDescription,
}

// ----------------- Resolvers -----------------

export function resolveNavIcon(
  url: string,
  name: string,
  node?: any,
): React.ComponentType<{ className?: string }> | undefined {
  // 1. Check if an icon component is directly provided on the node
  if (node?.icon && typeof node.icon === 'function') {
    return node.icon
  }

  // 2. Check exact URL in central NAV_ICONS map
  if (NAV_ICONS[url]) {
    return NAV_ICONS[url]
  }

  const u = url.toLowerCase()
  const n = name.toLowerCase()

  // 3. Check slug match in NAV_ICONS
  const slug = u.split('/').filter(Boolean).pop()
  if (slug && NAV_ICONS[`/${slug}`]) {
    return NAV_ICONS[`/${slug}`]
  }

  // 4. Docs fallback rules
  if (u === '/docs' || n === 'introduction') return IconBook
  if (u.includes('accessibility') || n.includes('accessibility')) return IconEye
  if (u.includes('other-animated') || n.includes('other-animated')) return IconFolderOpen

  if (u.includes('nextjs') || n.includes('next.js')) return IconBrandNextjs
  if (u.includes('vite') || n.includes('vite')) return IconBrandVite
  if (u.includes('lovable') || n.includes('lovable') || n.includes('v0')) return IconWand
  if (u.includes('components-json') || n.includes('components.json')) return IconFileCode
  if (u.includes('manual') || n.includes('manual')) return IconHandClick
  if (u.endsWith('/installation') || u === '/docs/installation' || n === 'installation') return IconTerminal

  if (u.includes('colors') || n.includes('colors')) return IconPalette
  if (u.includes('typography') || n.includes('typography')) return IconTypography
  if (u.includes('iconography') || n.includes('iconography')) return IconIcons

  if (u.includes('changelog') || n.includes('changelog')) return IconClock
  if (u.includes('roadmap') || n.includes('roadmap')) return IconRoute

  if (u.includes('agents') || n.includes('agents')) return IconRobot
  if (u.includes('skills') || n.includes('skills')) return IconFlame
  if (u.includes('mcp') || n.includes('mcp')) return IconPlug
  if (u.includes('llms') || n.includes('llms')) return IconFileDescription

  if (u.startsWith('/docs')) return IconBook

  return undefined
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function resolveNavBadge(url: string, name: string, node?: any): BadgeType | null {
  const frontmatter = node?.frontmatter

  // 1. Content Frontmatter - Status: coming-soon or beta has highest precedence
  const explicitStatus = frontmatter?.status || node?.badge
  if (explicitStatus === 'coming-soon') return 'coming-soon'
  if (explicitStatus === 'beta' || frontmatter?.beta === true) return 'beta'
  if (explicitStatus === 'new') return 'new'
  if (explicitStatus === 'updated') return 'updated'

  // 2. Component registry date resolution (createdAt, updatedAt)
  const slug = url.split('/').filter(Boolean).pop()
  const registryEntry = slug ? (registryMeta as Record<string, any>)[slug] : undefined

  const now = Date.now()

  // Dates can come from frontmatter OR component registry-item.json
  const rawCreatedAt = frontmatter?.createdAt || frontmatter?.releaseDate || registryEntry?.createdAt
  const rawUpdatedAt = frontmatter?.updatedAt || registryEntry?.updatedAt

  const createdAt = rawCreatedAt ? new Date(rawCreatedAt).getTime() : undefined
  const updatedAt = rawUpdatedAt ? new Date(rawUpdatedAt).getTime() : undefined

  // If updated within 7 days and was updated after creation -> 'updated'
  if (updatedAt && !isNaN(updatedAt)) {
    if (now - updatedAt <= ONE_WEEK_MS && (!createdAt || updatedAt > createdAt)) {
      return 'updated'
    }
  }

  // If created within 7 days -> 'new'
  if (createdAt && !isNaN(createdAt)) {
    if (now - createdAt <= ONE_WEEK_MS) {
      return 'new'
    }
  }
  return null
}

// ----------------- PageTree Extraction -----------------

export function extractSectionsFromNode(nodes: any[]): SectionItem[] {
  const sections: SectionItem[] = []
  let currentSection: SectionItem = { title: 'Overview', items: [] }

  function process(items: any[]) {
    for (const item of items) {
      if (item.type === 'separator') {
        if (currentSection.items.length > 0) {
          sections.push(currentSection)
        }
        currentSection = {
          title: item.name || 'Overview',
          items: [],
        }
      } else if (item.type === 'folder') {
        if (currentSection.items.length > 0) {
          sections.push(currentSection)
        }
        currentSection = {
          title: item.name || 'Items',
          items: [],
        }
        process(item.children || [])
      } else if (item.type === 'page' || item.url) {
        const pageName = typeof item.name === 'string' ? item.name : item.title || 'Page'
        currentSection.items.push({
          name: pageName,
          url: item.url,
          icon: resolveNavIcon(item.url, pageName, item),
          badge: resolveNavBadge(item.url, pageName, item) ?? undefined,
        })
      }
    }
  }

  process(nodes)

  if (currentSection.items.length > 0) {
    sections.push(currentSection)
  }

  return sections.filter((s) => s.items.length > 0)
}

export function sortComponentsSections(sections: SectionItem[]): SectionItem[] {
  return [...sections].sort((a, b) => {
    const aTitle = typeof a?.title === 'string' ? a.title.toLowerCase() : String(a?.title ?? '').toLowerCase()
    const bTitle = typeof b?.title === 'string' ? b.title.toLowerCase() : String(b?.title ?? '').toLowerCase()
    const order = ['components', 'blocks', 'templates']
    const aIndex = order.findIndex((k) => aTitle.includes(k))
    const bIndex = order.findIndex((k) => bTitle.includes(k))
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return 0
  })
}

export function getActiveHub(pathname: string): HubItem {
  if (pathname.startsWith('/ui-kit/hooks')) {
    return HUBS[1]
  }
  if (
    pathname.startsWith('/ui-kit/components') ||
    pathname.startsWith('/ui-kit/blocks') ||
    pathname.startsWith('/ui-kit/templates')
  ) {
    return HUBS[2]
  }
  if (pathname.startsWith('/tools')) {
    return HUBS[3]
  }
  return HUBS[0]
}

export function resolvePathSections(pathname: string, docsTree: any[] = [], uiKitTree: any[] = []): SectionItem[] {
  if (pathname.startsWith('/ui-kit/hooks')) {
    const hooksFolder = uiKitTree.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('hook') || n.$id?.includes('hooks')),
    )
    return hooksFolder ? extractSectionsFromNode([hooksFolder]) : []
  }

  const isDocsOrPrimitives =
    (pathname.startsWith('/docs') && !pathname.startsWith('/docs/icons')) || pathname.startsWith('/ui-kit/primitives')

  const isComponents =
    pathname.startsWith('/ui-kit/components') ||
    pathname.startsWith('/ui-kit/blocks') ||
    pathname.startsWith('/ui-kit/templates')

  if (isDocsOrPrimitives) {
    const primitivesFolder = uiKitTree.find(
      (n: any) => n.type === 'folder' && (n.name?.toLowerCase().includes('primitive') || n.$id?.includes('primitives')),
    )

    const docsSections = extractSectionsFromNode(docsTree)
    const primitivesSections = primitivesFolder ? extractSectionsFromNode([primitivesFolder]) : []

    return [...docsSections, ...primitivesSections]
  }

  if (isComponents) {
    const nonPrimitives = uiKitTree.filter(
      (n: any) =>
        n.type === 'folder' &&
        !n.name?.toLowerCase().includes('primitive') &&
        !n.$id?.includes('primitives') &&
        !n.name?.toLowerCase().includes('hook') &&
        !n.$id?.includes('hooks'),
    )
    const sections = extractSectionsFromNode(nonPrimitives)
    return sortComponentsSections(sections)
  }

  return extractSectionsFromNode(docsTree)
}

// ----------------- UI Components -----------------

export function NavBadge({ badge, className }: { badge?: BadgeType; className?: string }) {
  if (!badge) return null

  switch (badge) {
    case 'coming-soon':
      return (
        <Badge variant="warning" size="sm" className={cn('rounded-sm ml-auto', className)}>
          Coming Soon
        </Badge>
      )
    case 'updated':
      return (
        <Badge variant="info" size="sm" className={cn('rounded-sm ml-auto', className)}>
          Updated
        </Badge>
      )
    case 'new':
      return (
        <Badge variant="success" size="sm" className={cn('rounded-sm ml-auto', className)}>
          New
        </Badge>
      )
    case 'beta':
      return (
        <Badge variant="secondary" size="sm" className={cn('rounded-sm ml-auto', className)}>
          Beta
        </Badge>
      )
    default:
      return null
  }
}
