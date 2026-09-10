import hooksMeta from '@/content/ui-kit/hooks/meta.json'
import primitivesMeta from '@/content/ui-kit/primitives/meta.json'
import componentsMeta from '@/content/ui-kit/components/meta.json'
import blocksMeta from '@/content/ui-kit/blocks/meta.json'
import templatesMeta from '@/content/ui-kit/templates/meta.json'
import type { RelatedComponent } from '@/lib/docs-metadata'
import type { RelatedGroup } from '@/components/docs/layout/related-components'
import { uiKitSource } from '@/lib/source'

export const CATALOG_SECTIONS = ['hooks', 'primitives', 'components', 'blocks', 'templates'] as const
export type CatalogSection = (typeof CATALOG_SECTIONS)[number]

const META: Record<CatalogSection, { title: string; pages: string[] }> = {
  hooks: hooksMeta,
  primitives: primitivesMeta,
  components: componentsMeta,
  blocks: blocksMeta,
  templates: templatesMeta,
}

function categoryBadge(section: CatalogSection, groupTitle: string) {
  const title = groupTitle.toLowerCase()
  if (title === 'orb') return 'Orb'
  if (title.includes('shader')) return 'Shader'
  if (title.includes('background')) return 'Background'
  if (section === 'hooks') {
    if (title.includes('control-flow')) return 'Component'
    if (title.includes('utilit')) return 'Utility'
    return 'Hook'
  }
  if (section === 'primitives') return 'Primitive'
  if (section === 'components') return 'Component'
  if (section === 'templates') return 'Template'
  return 'Block'
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isCatalogSection(value: string | undefined): value is CatalogSection {
  return CATALOG_SECTIONS.includes(value as CatalogSection)
}

export function isCatalogIndex(slug: string[] | undefined) {
  if (!slug?.length) return false
  return isCatalogSection(slug[0]) && (slug.length === 1 || slug[1] === 'index')
}

function pageMap(section: CatalogSection) {
  return new Map(
    uiKitSource
      .getPages()
      .filter((page) => page.slugs[0] === section && page.slugs.length > 1)
      .map((page) => [page.slugs.slice(1).join('/'), page]),
  )
}

function toItem(
  entry: string,
  page: { data: { title: string; description?: string }; url: string },
  badge: string,
): RelatedComponent {
  return {
    name: entry,
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    category: badge,
  }
}

export function getUiKitCatalog(slug: string[] | undefined): RelatedGroup[] {
  const section = slug?.[0]
  if (!isCatalogSection(section)) return []
  return getSectionCatalog(section)
}

function getSectionCatalog(section: CatalogSection): RelatedGroup[] {
  const meta = META[section]
  const bySlug = pageMap(section)
  const groups: RelatedGroup[] = []
  let current: RelatedGroup | null = null

  const ensureGroup = (title: string) => {
    const group: RelatedGroup = {
      id: sectionId(title),
      title,
      items: [],
    }
    groups.push(group)
    current = group
    return group
  }

  for (const entry of meta.pages) {
    if (entry.startsWith('---')) {
      ensureGroup(entry.replace(/^-+/, '').replace(/-+$/, '').trim())
      continue
    }

    if (entry === 'index') continue
    const group = current ?? ensureGroup(meta.title)

    const page = bySlug.get(entry)
    if (!page) continue

    group.items.push(toItem(entry, page, categoryBadge(section, group.title)))
  }

  return groups.filter((group) => group.items.length > 0)
}
