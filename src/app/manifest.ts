import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/space-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: siteConfig.appName,
    short_name: siteConfig.appName,
    description: siteConfig.description,
    lang: 'en',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'browser'],
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#09090b',
    categories: ['developer', 'design', 'productivity'],
    icons: [
      {
        src: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/android-chrome-192x192.png',
        type: 'image/png',
        sizes: '192x192',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      {
        src: '/logo-square.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        type: 'image/png',
        sizes: '180x180',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Components',
        short_name: 'Components',
        description: 'Browse the Space UI component registry',
        url: '/components',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Blocks',
        short_name: 'Blocks',
        description: 'Open-source UI blocks',
        url: '/blocks',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Templates',
        short_name: 'Templates',
        description: 'Full-page templates and showcases',
        url: '/templates',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Primitives',
        short_name: 'Primitives',
        description: 'Base UI primitives',
        url: '/primitives',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Avatars',
        short_name: 'Avatars',
        description: 'Avatar generator',
        url: '/tools/avatars',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
