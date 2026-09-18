import type { MetadataRoute } from 'next'
import { source, uiKitSource, resourcesSource } from '@/lib/source'
import { getBaseUrl } from '@/lib/base-url'
import { getSitemapRoutes } from '@/config/routes'

/**
 * Generates the dynamic sitemap for Space UI.
 * Automatically crawls:
 * 1. Declarative routes from src/config/routes.ts (where inSitemap: true)
 * 2. Documentation pages from Fumadocs (/docs/...)
 * 3. UI Kit pages (/components/..., /blocks/..., /templates/..., etc.)
 * 4. Standalone tool hubs and utilities (/tools/...)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const now = new Date()

  // 1. Declarative static and marketing routes
  const baseRoutes: MetadataRoute.Sitemap = getSitemapRoutes().map((route) => ({
    url: `${baseUrl}${route.href === '/' ? '' : route.href}`,
    lastModified: now,
    changeFrequency: route.changeFrequency ?? 'weekly',
    priority: route.priority ?? 0.8,
  }))

  // 2. Fumadocs Docs Pages (/docs/...)
  const docsPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 0.9 : 0.8,
  }))

  // 3. Fumadocs UI Kit Pages (/components/..., /blocks/..., /templates/..., etc.)
  const uiKitPages: MetadataRoute.Sitemap = uiKitSource.getPages().map((page) => {
    const isCategoryRoot = page.url === '/components' || page.url === '/blocks' || page.url === '/templates'
    return {
      url: `${baseUrl}${page.url}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: isCategoryRoot ? 0.85 : 0.75,
    }
  })

  // 4. Fumadocs Tools / Resources Pages (/tools/...)
  const resourcesPages: MetadataRoute.Sitemap = resourcesSource.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/tools' ? 0.8 : 0.65,
  }))

  // 5. Standalone Tools in src/app/tools/
  const standaloneToolSlugs = ['avatars', 'emoji', 'flags', 'imagesplit', 'og-image', 'plush']
  const standaloneTools: MetadataRoute.Sitemap = standaloneToolSlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  // Deduplicate entries by URL
  const seenUrls = new Set<string>()
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const entry of [...baseRoutes, ...docsPages, ...uiKitPages, ...resourcesPages, ...standaloneTools]) {
    // Normalize URL: remove duplicate slashes except protocol
    const normalizedUrl = entry.url.replace(/([^:]\/)\/+/g, '$1')
    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl)
      sitemapEntries.push({
        ...entry,
        url: normalizedUrl,
      })
    }
  }

  return sitemapEntries
}
