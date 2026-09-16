import { getImageProps } from 'next/image'

/**
 * Gets the URL Next.js's own `<Image>` component would render (through
 * whichever `loader` the project has configured — the built-in `/_next/image`
 * optimizer by default, or a custom one), so raw `new Image()` / canvas /
 * WebGL texture loads can go through the same resize + format conversion
 * pipeline instead of downloading the original, unoptimized file.
 *
 * Requires the source host to be allowed in `next.config`'s
 * `images.remotePatterns` (local `/public` paths need no extra config).
 */
export interface OptimizedImageUrlOptions {
  /** Target width in px — should be one of Next's `deviceSizes`/`imageSizes`, or Next will still serve the closest allowed size. */
  width: number
  /** Only affects srcSet math for the default loader (which resizes by width and keeps the source aspect ratio) — defaults to `width`. */
  height?: number
  /** 1-100, defaults to Next's own default of 75. */
  quality?: number
  /** Unused visually (no `<img>` is ever rendered) but required by `getImageProps`. */
  alt?: string
}

export function getOptimizedImageUrl(
  src: string,
  { width, height, quality = 75, alt = 'Space UI resized image' }: OptimizedImageUrlOptions,
): string {
  const {
    props: { src: optimizedSrc },
  } = getImageProps({ src, alt, width, height: height ?? width, quality })
  return optimizedSrc
}
