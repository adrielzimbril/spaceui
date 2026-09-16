/**
 * Builds the URL Next.js's own `<Image>` component generates internally
 * (the `/_next/image` route), so raw `new Image()` / canvas / WebGL texture
 * loads can go through the same resize + format conversion pipeline instead
 * of downloading the original, unoptimized file.
 *
 * Requires the source host to be allowed in `next.config`'s
 * `images.remotePatterns` (local `/public` paths need no extra config).
 */
export interface OptimizedImageUrlOptions {
  /** Target width in px — should be one of Next's `deviceSizes`/`imageSizes`, or Next will still serve the closest allowed size. */
  width: number
  /** 1-100, defaults to Next's own default of 75. */
  quality?: number
}

export function getOptimizedImageUrl(src: string, { width, quality = 75 }: OptimizedImageUrlOptions): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}
