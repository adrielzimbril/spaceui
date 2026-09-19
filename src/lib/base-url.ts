import { siteConfig } from '@/config/space-config'

/**
 * Gets the base URL of the Space UI application.
 * Resolves intelligently across local, preview (Vercel), and production environments.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')
  }

  if (process.env.VERCEL_ENV === 'production') {
    return siteConfig.url.replace(/\/+$/, '')
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return siteConfig.url.replace(/\/+$/, '')
}

/**
 * Returns a fully-qualified URL for a given relative path.
 *
 * @param path - The relative path (e.g. '/showcase' or 'docs')
 * @returns Fully-qualified URL (e.g. 'https://www.spaceui.one/showcase')
 */
export function getPathUrl(path: string): string {
  const base = getBaseUrl()
  const cleanPath = path.replace(/^\/+/, '')
  return `${base}/${cleanPath}`
}

/**
 * Returns an absolute URL for assets or images.
 */
export function getImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return getPathUrl(path)
}
