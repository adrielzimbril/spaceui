import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/base-url'

/**
 * Configures the search crawler directives for Space UI.
 * Allows indexing of documentation and marketing pages while protecting API endpoints and raw registry JSON.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/', '/_next/', '/r/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
