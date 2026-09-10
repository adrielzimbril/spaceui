import type { NextConfig } from 'next'
import { createMDX } from 'fumadocs-mdx/next'

import fs from 'node:fs'
import path from 'node:path'

const withMDX = createMDX()

const isLocalMonorepo = !process.env.VERCEL && fs.existsSync(path.resolve(process.cwd(), '../../pnpm-workspace.yaml'))

const config: NextConfig = {
  ...(isLocalMonorepo
    ? {
        turbopack: {
          root: path.resolve(process.cwd(), '../../'),
        },
      }
    : {}),
  images: {
    remotePatterns: [
      {
        hostname: 'ui.spaceui.com',
      },
      {
        hostname: 'spaceui.one',
      },
      {
        hostname: 'cdn.spaceui.one',
      },
      {
        hostname: 'img.spaceui.one',
      },
      {
        hostname: 'images.pexels.com',
      },
      {
        hostname: 'ph-files.imgix.net',
      },
      {
        hostname: '30tools.com',
      },
      {
        hostname: 'cdn.aurthle.one',
      },
      {
        hostname: 'cdn.aurthle.com',
      },
      {
        hostname: 'fonts.gstatic.com',
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: false,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    useTypeScriptCli: true,
    turbopackRustReactCompiler: true,
    useOffline: true,
  },
  outputFileTracingIncludes: {
    '/llms.mdx/**': ['./src/content/**/*'],
  },
  async rewrites() {
    return {
      // Transparent proxy: /components/* → served by the ui-kit/[[...slug]] route
      beforeFiles: [
        { source: '/components/:path*', destination: '/ui-kit/components/:path*' },
        { source: '/primitives/:path*', destination: '/ui-kit/primitives/:path*' },
        { source: '/blocks/:path*', destination: '/ui-kit/blocks/:path*' },
        { source: '/hooks/:path*', destination: '/ui-kit/hooks/:path*' },
        { source: '/templates/:path*', destination: '/ui-kit/templates/:path*' },
      ],
      afterFiles: [
        { source: '/docs/:path*.mdx', destination: '/llms.mdx/docs/:path*' },
        { source: '/components/:path*.mdx', destination: '/llms.mdx/components/:path*' },
        { source: '/primitives/:path*.mdx', destination: '/llms.mdx/primitives/:path*' },
        { source: '/blocks/:path*.mdx', destination: '/llms.mdx/blocks/:path*' },
        { source: '/hooks/:path*.mdx', destination: '/llms.mdx/hooks/:path*' },
        { source: '/templates/:path*.mdx', destination: '/llms.mdx/templates/:path*' },
        { source: '/tools/:path*.mdx', destination: '/llms.mdx/tools/:path*' },
        { source: '/:path*.mdx', destination: '/llms.mdx/:path*' },
      ],
    }
  },
  async redirects() {
    return [
      {
        source: '/resources',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/resources/squishmoji',
        destination: '/tools/avatars?type=squishmoji',
        permanent: true,
      },
      {
        source: '/resources/:path*',
        destination: '/tools/:path*',
        permanent: true,
      },
      {
        source: '/tools/squishmoji',
        destination: '/tools/avatars?type=squishmoji',
        permanent: true,
      },
      {
        source: '/tools/squishmoji/:path*',
        destination: '/tools/avatars?type=squishmoji',
        permanent: true,
      },
      {
        source: '/tools/avatars/squish',
        destination: '/tools/avatars?type=squishmoji',
        permanent: true,
      },
      {
        source: '/og',
        destination: '/tools/og-image',
        permanent: true,
      },
      {
        source: '/tools/og',
        destination: '/tools/og-image',
        permanent: true,
      },
      // All old /ui-kit/* URLs → /* (covers groups, sections, everything)
      {
        source: '/ui-kit/:path*',
        destination: '/:path*',
        permanent: true,
      },
      // Flatten component group URLs → /ui-kit/components/:path*
      {
        source: '/components/backgrounds/:path*',
        destination: '/components/:path*',
        permanent: true,
      },
      {
        source: '/components/orb/:path*',
        destination: '/components/:path*',
        permanent: true,
      },
      {
        source: '/components/shader/:path*',
        destination: '/components/:path*',
        permanent: true,
      },
      {
        source: '/components/spaceui/:path*',
        destination: '/components/:path*',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
