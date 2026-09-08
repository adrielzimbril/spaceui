import type * as React from 'react'
import {
  IconBook,
  IconNetwork,
  IconCpu,
  IconBox,
  IconAtom,
  IconFolderHeart,
  IconSparkles,
  IconUserCircle,
  IconMoodSmile,
  IconPalette,
  IconIcons,
  IconFlag,
  IconPhoto,
  IconLayoutGrid,
  IconVolume,
  IconCut,
} from '@tabler/icons-react'
import { DEFAULT_COLOR_CODE } from '@/lib/theme-colors'

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

export interface MegaMenuItem {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: 'new' | 'beta' | 'updated' | 'coming-soon'
  color: string
}

export interface ResourceItem {
  title: string
  label?: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  upcoming: boolean
  release?: 'beta' | 'coming-soon' | 'new' | 'updated'
  color: string
}

export interface NavItem {
  title: string
  href: string
  group: string
  badge?: string
  isDrillable?: boolean
  upcoming?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface SearchShortcutItem {
  label: string
  href: string
  keywords?: string[]
}

// -----------------------------------------------------------------------------
// 1. Mega Menu Definitions (Desktop)
// -----------------------------------------------------------------------------

export const megaMenuDocs: MegaMenuItem[] = [
  {
    title: 'Getting Started',
    href: '/docs',
    description: 'Introduction and installation guide.',
    icon: IconBook,
    color: DEFAULT_COLOR_CODE.BLUE,
  },
  {
    title: 'Ecosystem',
    href: '/docs/changelog',
    description: 'Changelog and roadmap.',
    icon: IconNetwork,
    color: DEFAULT_COLOR_CODE.PURPLE,
  },
  {
    title: 'AI & Automation',
    href: '/docs/mcp',
    description: 'Agents and Model Context Protocol.',
    icon: IconCpu,
    badge: 'new',
    color: DEFAULT_COLOR_CODE.TURQUOISE,
  },
]

export const megaMenuUiKit: MegaMenuItem[] = [
  {
    title: 'Primitives',
    href: '/ui-kit/primitives',
    description: 'Basic accessible UI elements like Buttons, Inputs, Dialogs.',
    icon: IconBox,
    color: DEFAULT_COLOR_CODE.BLUE,
  },
  {
    title: 'Components',
    href: '/ui-kit/components',
    description: 'Complex components and animations to build interfaces.',
    icon: IconAtom,
    color: DEFAULT_COLOR_CODE.GREEN,
  },
  {
    title: 'Blocks',
    href: '/ui-kit/blocks',
    description: 'Ready-to-use section blocks and page sections.',
    icon: IconFolderHeart,
    color: DEFAULT_COLOR_CODE.PINKISH_PINK,
  },
  {
    title: 'Hooks & Utils',
    href: '/ui-kit/hooks',
    description: 'Sensory React hooks, flow-control and pure DX utilities.',
    icon: IconSparkles,
    color: DEFAULT_COLOR_CODE.PINKISH_PURPLE,
  },
]

export const megaMenuTools: ResourceItem[] = [
  {
    title: 'Image Split',
    label: 'imagesplit',
    description: 'Split images into seamless carousels, grids and columns.',
    href: '/tools/imagesplit',
    icon: IconCut,
    upcoming: false,
    release: 'new',
    color: DEFAULT_COLOR_CODE.TURQUOISE,
  },
  {
    title: 'UI Avatars',
    label: 'avatars',
    description: 'Customizable 3D & flat user profile avatars.',
    href: '/tools/avatars',
    icon: IconUserCircle,
    upcoming: false,
    release: 'updated',
    color: DEFAULT_COLOR_CODE.INDIGO,
  },
  {
    title: 'Squishmoji',
    label: 'squishmoji',
    description: 'Deterministic squishy SVG avatars and animated emojis.',
    href: '/tools/avatars?type=squishmoji',
    icon: IconMoodSmile,
    upcoming: false,
    release: 'updated',
    color: DEFAULT_COLOR_CODE.YELLOW,
  },
  {
    title: 'Sounds',
    label: 'sounds',
    description: 'Procedural Web Audio UI sounds with 3D spatial panning.',
    href: 'https://sounds.spaceui.one',
    icon: IconVolume,
    upcoming: false,
    release: 'new',
    color: DEFAULT_COLOR_CODE.VIOLET,
  },
  {
    title: 'Emoji',
    label: 'emoji',
    description: 'High-res 3D & animated fluent emoji sets.',
    href: '/tools/emoji',
    icon: IconMoodSmile,
    upcoming: false,
    release: 'beta',
    color: DEFAULT_COLOR_CODE.YELLOW,
  },
  {
    title: 'Gradients',
    label: 'gradients',
    description: 'Procedural mesh gradients and organic color palettes.',
    href: '#',
    icon: IconPalette,
    upcoming: true,
    release: 'coming-soon',
    color: DEFAULT_COLOR_CODE.CYAN,
  },
  {
    title: 'Icons',
    label: 'icons',
    description: 'App logos, brand marks & curated vector icons.',
    href: '#',
    icon: IconIcons,
    upcoming: true,
    release: 'coming-soon',
    color: DEFAULT_COLOR_CODE.ORANGE,
  },
  {
    title: 'Flags',
    label: 'flags',
    description: '430 country and 201 language flags in circle, square, and 4×3 SVG.',
    href: '#',
    icon: IconFlag,
    upcoming: true,
    release: 'coming-soon',
    color: DEFAULT_COLOR_CODE.RED,
  },
  {
    title: 'OG Image Generator',
    label: 'og-image',
    description: 'Generate dynamic social share images.',
    href: '#',
    icon: IconPhoto,
    upcoming: true,
    release: 'coming-soon',
    color: DEFAULT_COLOR_CODE.TEAL,
  },
  {
    title: 'Shader Generator',
    label: 'shaders',
    description: 'Interactive WebGL and canvas shaders.',
    href: '#',
    icon: IconAtom,
    upcoming: true,
    release: 'coming-soon',
    color: DEFAULT_COLOR_CODE.GOLD,
  },
  {
    title: 'View all tools',
    label: 'all-tools',
    description: 'Explore the complete suite of creative assets.',
    href: '/tools',
    icon: IconLayoutGrid,
    upcoming: false,
    color: DEFAULT_COLOR_CODE.PINKISH_GREEN,
  },
]

// -----------------------------------------------------------------------------
// 2. Mobile Nav Groups (Derived directly to avoid any duplication)
// -----------------------------------------------------------------------------

export const mobileNavGroups: NavGroup[] = [
  {
    label: 'Docs',
    items: [
      ...megaMenuDocs.map((item) => ({
        title: item.title,
        href: item.href,
        group: 'Docs',
        badge: item.badge,
        isDrillable: false,
      })),
      { title: 'Others', href: '/docs', group: 'Docs', isDrillable: true },
    ],
  },
  {
    label: 'UI Kit',
    items: [
      ...megaMenuUiKit.map((item) => ({
        title: item.title,
        href: item.href,
        group: item.title,
        badge: item.badge,
        isDrillable: true,
      })),
      { title: 'Templates', href: '/ui-kit/templates', group: 'Templates', isDrillable: true },
    ],
  },
  {
    label: 'Tools',
    items: megaMenuTools.map((item) => ({
      title: item.title,
      href: item.href,
      group: 'Tools',
      badge: item.upcoming ? 'coming-soon' : item.release,
      upcoming: item.upcoming,
      isDrillable: false,
    })),
  },
]

// -----------------------------------------------------------------------------
// 3. Search Bar / Command Menu Configuration
// -----------------------------------------------------------------------------

export const searchNavShortcuts: SearchShortcutItem[] = [
  { label: 'Components', href: '/ui-kit/components', keywords: ['components', 'ui', 'widgets'] },
  { label: 'Primitives', href: '/ui-kit/primitives', keywords: ['primitives', 'base', 'elements'] },
  { label: 'Hooks & Utils', href: '/ui-kit/hooks', keywords: ['hooks', 'utilities', 'react'] },
  { label: 'Blocks', href: '/ui-kit/blocks/sign-in', keywords: ['blocks', 'sections', 'pages'] },
  { label: 'Documentation', href: '/docs', keywords: ['docs', 'guide', 'getting started'] },
  {
    label: 'Tools',
    href: '/tools',
    keywords: ['tools', 'avatars', 'icons', 'sounds', 'gradients', 'flags', 'emoji'],
  },
]

/**
 * Static tools to index in the Command Menu search.
 */
export const searchStaticResources = megaMenuTools.map((tool) => ({
  value: `tools-${tool.label || tool.title.toLowerCase().replace(/\s+/g, '-')}`,
  label: tool.title,
  url: tool.href === '#' ? '/tools' : tool.href,
  group: 'Tools',
  isComponent: false,
  description: tool.description,
  badge: tool.upcoming ? 'coming-soon' : tool.release,
  keywords: ['tools', tool.title.toLowerCase(), tool.label || '', ...tool.title.toLowerCase().split(' ')].filter(
    Boolean,
  ),
}))

// -----------------------------------------------------------------------------
// 4. Central Menu Config Export
// -----------------------------------------------------------------------------

export const menuConfig = {
  megaMenu: {
    docs: megaMenuDocs,
    uiKit: megaMenuUiKit,
    tools: megaMenuTools,
  },
  mobileMenu: {
    groups: mobileNavGroups,
  },
  search: {
    shortcuts: searchNavShortcuts,
    staticResources: searchStaticResources,
  },
}
