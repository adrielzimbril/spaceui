import componentsMeta from '@/content/library/components/meta.json'
import hooksMeta from '@/content/library/hooks/meta.json'
import blocksMeta from '@/content/library/blocks/meta.json'
import templatesMeta from '@/content/library/templates/meta.json'
import primitivesMeta from '@/content/library/primitives/meta.json'

interface MetaManifest {
  title?: string
  pages?: string[]
}

/**
 * Dynamically parses section headers (e.g. "---Shader---") from a meta.json manifest
 * and maps each page slug to its section title.
 * This scales dynamically to thousands of items without manual slug lists.
 */
function buildSectionSlugMap(meta: MetaManifest): Map<string, string> {
  const map = new Map<string, string>()
  if (!meta.pages) return map

  let currentSection = meta.title || 'General'

  for (const entry of meta.pages) {
    if (entry.startsWith('---')) {
      currentSection = entry.replace(/^-+|-+$/g, '').trim()
      continue
    }
    if (entry && entry !== 'index') {
      map.set(entry, currentSection)
    }
  }

  return map
}

// Maps: slug -> category title (e.g. 'cloud' -> 'Shader', 'bubble' -> 'Backgrounds')
export const componentCategoryMap = buildSectionSlugMap(componentsMeta)
export const hookCategoryMap = buildSectionSlugMap(hooksMeta)
export const blockCategoryMap = buildSectionSlugMap(blocksMeta)
export const templateCategoryMap = buildSectionSlugMap(templatesMeta)
export const primitiveCategoryMap = buildSectionSlugMap(primitivesMeta)

/**
 * Dynamically retrieves all slugs belonging to a given category keyword
 * (e.g. "shader", "background", "orb") from the components manifest.
 */
export function getComponentSlugsByCategory(categoryKeyword: string): Set<string> {
  const target = categoryKeyword.toLowerCase()
  const matching = new Set<string>()

  for (const [slug, category] of componentCategoryMap.entries()) {
    if (category.toLowerCase().includes(target)) {
      matching.add(slug)
    }
  }

  return matching
}

/** Dynamic set of all shader slugs parsed directly from components/meta.json */
export const SHADER_SLUGS = getComponentSlugsByCategory('shader')

/** Dynamic set of all background slugs parsed directly from components/meta.json */
export const BACKGROUND_SLUGS = getComponentSlugsByCategory('background')

/** Dynamic set of all orb slugs parsed directly from components/meta.json */
export const ORB_SLUGS = getComponentSlugsByCategory('orb')

/**
 * Dynamic set of flow-control hook components parsed directly from hooks/meta.json
 * (e.g. 'class', 'for', 'if', 'image', 'in-view', 'render-after', 'show', 'switch')
 */
export function getHookComponentSlugs(): Set<string> {
  const matching = new Set<string>()
  for (const [slug, category] of hookCategoryMap.entries()) {
    if (category.toLowerCase().includes('control-flow')) {
      matching.add(slug)
    }
  }
  return matching
}

/**
 * Dynamic set of pure utility functions parsed directly from hooks/meta.json
 * (e.g. 'cache', 'cookie', 'event', 'format-bytes', etc.)
 */
export function getPureUtilSlugs(): Set<string> {
  const matching = new Set<string>()
  for (const [slug, category] of hookCategoryMap.entries()) {
    if (category.toLowerCase().includes('pure util') || category.toLowerCase().includes('utility')) {
      matching.add(slug)
    }
  }
  return matching
}

/**
 * Checks dynamically whether a given pathname or slug represents a shader.
 * - Matches against all shader slugs dynamically extracted from components/meta.json
 * - Matches generic URL/path patterns (/shader/, /shader, *-shader)
 */
export function isShader(pathnameOrSlug?: string | null): boolean {
  if (!pathnameOrSlug) return false
  const clean = pathnameOrSlug.split('?')[0].split('#')[0].replace(/\/+$/, '')
  const slug = clean.split('/').pop() || ''

  if (SHADER_SLUGS.has(slug)) return true
  if (clean.includes('/shader/') || clean.endsWith('/shader') || slug.endsWith('-shader')) return true

  return false
}
