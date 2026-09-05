import { RootProvider } from 'fumadocs-ui/provider/next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Inter, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { jsonLd } from '@/lib/json-ld'
import { GlobalLayoutWrapper } from '@/components/layout/global-layout-wrapper'
import { cn } from '@/registry/lib/utils'
import { siteConfig } from '@/lib/space-config'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata: Metadata = {
  title: {
    template: `%s - ${siteConfig.appName}`,
    default: siteConfig.title,
  },
  description: siteConfig.ogDescription,
  keywords: [
    'Space UI',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Motion',
    'Base UI',
    'Sensory UI',
    'Open-source components',
    'Animated UI components',
    'UI library',
  ],
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
  ],
  authors: [
    {
      name: siteConfig.appName,
      url: siteConfig.url,
    },
  ],
  publisher: siteConfig.appName,
  openGraph: {
    title: siteConfig.appName,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
    siteName: siteConfig.appName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.appName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    title: siteConfig.appName,
    description: siteConfig.ogDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.appName,
      },
    ],
  },
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

import { cookies } from 'next/headers'
import { Mode, type LayoutMode } from '@/components/providers/layout-mode-provider'

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const initialLayoutMode = (cookieStore.get('space-ui-layout-mode')?.value as LayoutMode) || Mode.standard

  return (
    <html
      lang="en"
      className={cn(inter.variable, geistMono.variable, inter.className)}
      data-layout-mode={initialLayoutMode}
      suppressHydrationWarning
    >
      <head>
        <script
          id="layout-mode-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:space-ui-layout-mode|space-ui-layout-mode)=([^;]+)/);var mode=m?m[1]:(localStorage.getItem('space-ui-layout-mode')||localStorage.getItem('space-ui-layout-mode')||'standard');document.documentElement.setAttribute('data-layout-mode',mode);}catch(e){}})();`,
          }}
        />
      </head>
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <body
        className={cn(
          'flex flex-col min-h-screen',
          // Allows to make more attractive video recordings
          // 'screenshot-mode',
        )}
      >
        <RootProvider search={{ enabled: false }}>
          <NuqsAdapter>
            <GlobalLayoutWrapper initialLayoutMode={initialLayoutMode}>{children}</GlobalLayoutWrapper>
          </NuqsAdapter>
        </RootProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
