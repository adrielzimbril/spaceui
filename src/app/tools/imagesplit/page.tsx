import type { Metadata } from 'next'
import { ImageSplitPlayground } from '@/tools/imagesplit/playground'

export const metadata: Metadata = {
  title: 'Image Split — Split images into seamless columns & carousels',
  description:
    'Upload an image to slice into seamless Instagram carousels, panorama strips, and custom multi-part layouts with pixel-accurate framing.',
  openGraph: {
    title: 'Image Split — Split an image into perfect columns',
    description:
      'Upload an image to slice into seamless Instagram carousels, panorama strips, and custom multi-part layouts with pixel-accurate framing.',
    type: 'website',
  },
}

export default function ImageSplitResourcePage() {
  return <ImageSplitPlayground />
}

export const instant = false
