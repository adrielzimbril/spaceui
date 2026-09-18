export type RouteConfig = {
  key: string
  title: string
  href: string
  description?: string
  inHeader?: boolean
  inFooter?: boolean
  inSitemap?: boolean
  priority?: number
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

/**
 * Single source of truth for Space UI application routes.
 * Controls placement in header, footer, and automatic sitemap inclusion.
 */
export const routes = {
  home: {
    key: 'home',
    title: 'Home',
    href: '/',
    inHeader: true,
    inFooter: false,
    inSitemap: true,
    priority: 1.0,
    changeFrequency: 'daily',
  },
  showcase: {
    key: 'showcase',
    title: 'Showcase',
    href: '/showcase',
    description: 'Explore production templates and interactive animations in real-time',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.9,
    changeFrequency: 'daily',
  },
  pricing: {
    key: 'pricing',
    title: 'Pricing',
    href: '/pricing',
    description: 'Get all Pro components and templates with lifetime access',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  docs: {
    key: 'docs',
    title: 'Documentation',
    href: '/docs',
    description: 'Guides, CLI installation, and API documentation for Space UI',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  components: {
    key: 'components',
    title: 'Components',
    href: '/components',
    description: 'Interactive UI components built with React and Tailwind',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  blocks: {
    key: 'blocks',
    title: 'Blocks',
    href: '/blocks',
    description: 'Pre-assembled UI blocks and section layouts',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  templates: {
    key: 'templates',
    title: 'Templates',
    href: '/templates',
    description: 'Full-featured landing page templates',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  tools: {
    key: 'tools',
    title: 'Tools',
    href: '/tools',
    description: 'Developer tools, asset generators, and creative utilities',
    inHeader: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  community: {
    key: 'community',
    title: 'Community',
    href: '/community',
    description: 'Join the Space UI builder community',
    inHeader: false,
    inFooter: true,
    inSitemap: true,
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    href: '/privacy',
    inHeader: false,
    inFooter: true,
    inSitemap: true,
    priority: 0.4,
    changeFrequency: 'monthly',
  },
  terms: {
    key: 'terms',
    title: 'Terms of Service',
    href: '/terms',
    inHeader: false,
    inFooter: true,
    inSitemap: true,
    priority: 0.4,
    changeFrequency: 'monthly',
  },
} as const satisfies Record<string, RouteConfig>

export type RouteKey = keyof typeof routes

/**
 * Returns all routes marked for sitemap generation.
 */
export function getSitemapRoutes(): RouteConfig[] {
  return Object.values(routes).filter((route) => route.inSitemap)
}

/**
 * Returns all routes marked for the main site header.
 */
export function getHeaderRoutes(): RouteConfig[] {
  return Object.values(routes).filter((route) => route.inHeader)
}

/**
 * Returns all routes marked for the footer.
 */
export function getFooterRoutes(): RouteConfig[] {
  return Object.values(routes).filter((route) => route.inFooter)
}
