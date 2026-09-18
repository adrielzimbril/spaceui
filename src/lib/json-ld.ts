import { siteConfig } from '@/config/space-config'

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.appName,
      description: siteConfig.description,
      inLanguage: 'en',
      publisher: {
        '@id': `${siteConfig.url}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.appName,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo-square.png`,
        width: 512,
        height: 512,
      },
      sameAs: [siteConfig.links.github, siteConfig.links.x],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.url}/#software`,
      name: siteConfig.appName,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      description: siteConfig.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@id': `${siteConfig.url}/#organization`,
      },
    },
  ],
}

/**
 * Generates structured Schema.org JSON-LD for individual UI components or templates.
 */
export function getComponentJsonLd(item: {
  name: string
  description: string
  url: string
  category?: string
  isPro?: boolean
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: item.name,
    description: item.description,
    codeRepository: siteConfig.links.github,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React, Next.js, Tailwind CSS',
    isAccessibleForFree: !item.isPro,
    url: item.url,
  }
}
