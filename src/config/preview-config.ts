export const Mode = {
  split: 'split',
  standard: 'standard',
  both: 'both',
} as const

export type Mode = (typeof Mode)[keyof typeof Mode]

export const LayoutMode = {
  split: Mode.split,
  standard: Mode.standard,
} as const

export type LayoutMode = (typeof LayoutMode)[keyof typeof LayoutMode]

export interface PageLayoutConstraint {
  mode?: Mode
  defaultMode?: LayoutMode
}

export interface PreviewOptions {
  name: string
  iframe?: boolean
  bigScreen?: boolean
  title?: string
  description?: string
  variant?: 'default' | 'showcase' | 'card'
  restart?: boolean
  open?: boolean
  allowCopy?: boolean
  contained?: boolean
  container?: boolean
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function normalizePreviewConfig(preview?: string | PreviewOptions | null): PreviewOptions | null {
  if (!preview) return null
  if (typeof preview === 'string') {
    return { name: preview }
  }
  return preview
}

export interface ComponentCategoryConfig {
  isUncontained: boolean
  defaultLayoutMode?: LayoutMode
  allowedMode?: Mode
}

/**
 * Checks if a component belongs to uncontained categories:
 * - Shaders
 * - Gradients (gradient backgrounds, liquid-metal, etc.)
 * - Blocks
 */
export function isUncontainedComponent(name?: string, componentGroup?: string | null): boolean {
  if (!name && !componentGroup) return false
  const lowerName = (name || '').toLowerCase()
  const lowerGroup = (componentGroup || '').toLowerCase()

  const isShader =
    lowerName.includes('shader') || lowerGroup.includes('shader') || lowerName.startsWith('demo-components-shader-')

  const isGradient = lowerName.includes('gradient') || lowerGroup.includes('gradient')

  const isBlock = lowerName.includes('block') || lowerGroup.includes('block')

  const isTemplate = lowerName.includes('templates') || lowerGroup.includes('templates')

  return isShader || isGradient || isBlock || isTemplate
}

/**
 * Returns the effective `contained` boolean for a component.
 * - If explicitly passed via `contained` or `container` prop, respects that value.
 * - Otherwise: ONLY shaders, gradients, and blocks are `false`. All other components are `true`.
 */
export function getEffectiveContained(
  containedProp?: boolean,
  containerProp?: boolean,
  name?: string,
  componentGroup?: string | null,
): boolean {
  const explicit = containedProp !== undefined ? containedProp : containerProp
  if (explicit !== undefined) return explicit

  return !isUncontainedComponent(name, componentGroup)
}

/**
 * Resolves the initial route-level layout constraint and default mode synchronously.
 * Prevents flashing in standard mode for split-preferred routes like shaders and blocks.
 *
 * Rules:
 * - Shaders (now flat: /components/cloud, /components/paper-shader): defaultMode 'split'
 * - Individual Block pages (/blocks/[slug]): defaultMode 'split', mode 'both' (not locked to dual)
 * - Catalog index pages (/blocks, /components): standard
 */
export function isDocsRoute(pathname?: string | null): boolean {
  if (!pathname) return false
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  const clean = normalized.split('?')[0].split('#')[0].replace(/\/+$/, '')
  return clean === '/docs' || clean.startsWith('/docs/')
}

export function isCatalogRoute(pathname?: string | null): boolean {
  if (!pathname) return false
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  const clean = normalized.split('?')[0].split('#')[0].replace(/\/+$/, '')

  if (clean === '/ui-kit') return true
  if (clean.endsWith('/index')) return true

  const catalogExactRoutes = ['/primitives', '/components', '/blocks', '/templates', '/hooks', '/showcase']

  return catalogExactRoutes.includes(clean)
}

/**
 * Resolves the initial route-level layout constraint and default mode synchronously.
 * Prevents flashing in standard mode for split-preferred routes like shaders and blocks.
 *
 * Rules:
 * - Docs pages (/docs, /docs/*): strictly locked to standard mode (no dual mode)
 * - Catalog index pages (/ui-kit, /blocks, /templates, /primitives, /components, /hooks, ...): strictly locked to standard mode (no dual mode)
 * - Shaders detail pages (now flat: /components/cloud, /components/paper-shader): defaultMode 'split'
 * - Individual Block pages (/blocks/[slug]): defaultMode 'split', mode 'split'
 * - Individual Template pages (/templates/[slug]): defaultMode 'split', mode 'split'
 */
export function getRouteLayoutDefaults(pathname?: string | null): {
  mode: LayoutMode
  constraint: PageLayoutConstraint
} | null {
  if (!pathname) return null

  // 1. All docs pages are strictly locked to standard mode (no dual mode)
  if (isDocsRoute(pathname)) {
    return {
      mode: Mode.standard,
      constraint: { mode: Mode.standard, defaultMode: Mode.standard },
    }
  }

  // 2. All catalog index pages (blocks, templates, primitives, components, hooks, etc.) are strictly locked to standard mode
  if (isCatalogRoute(pathname)) {
    return {
      mode: Mode.standard,
      constraint: { mode: Mode.standard, defaultMode: Mode.standard },
    }
  }

  // 3. Shaders detail pages (now flat: /components/cloud, /components/paper-shader)
  const SHADER_SLUGS = ['/components/cloud', '/components/paper-shader']
  if (SHADER_SLUGS.some((s) => pathname === s || pathname.startsWith(s + '/'))) {
    return {
      mode: Mode.split,
      constraint: { mode: Mode.both, defaultMode: Mode.split },
    }
  }

  // 4. Individual Blocks detail pages (/blocks/...)
  if (pathname.includes('/blocks/') || pathname.startsWith('/blocks/')) {
    return {
      mode: Mode.split,
      constraint: { mode: Mode.split, defaultMode: Mode.split },
    }
  }

  // 5. Individual Templates detail pages (/templates/...)
  if (pathname.includes('/templates/') || pathname.startsWith('/templates/')) {
    return {
      mode: Mode.split,
      constraint: { mode: Mode.split, defaultMode: Mode.split },
    }
  }

  return null
}

export type ThemeOverride = 'system' | 'light' | 'dark'

/**
 * Resolves the visual theme ('dark' | 'light') for a preview based on
 * its local override and the global site theme.
 */
export function getEffectivePreviewTheme(themeOverride?: ThemeOverride, siteResolvedTheme?: string): 'dark' | 'light' {
  if (themeOverride === 'dark') return 'dark'
  if (themeOverride === 'light') return 'light'
  return siteResolvedTheme === 'dark' ? 'dark' : 'light'
}
