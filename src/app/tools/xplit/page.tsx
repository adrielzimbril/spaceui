import type { Metadata } from 'next'
import { XplitPlayground } from '@/resources/xplit/playground'

export const metadata: Metadata = {
  title: 'Xplit — Split images into perfect columns & carousels',
  description:
    'Upload a picture and split it into columns. Choose the aspect ratio, crop frame, spacing, border and export every slice at once.',
  openGraph: {
    title: 'Xplit — Split an image into perfect columns',
    description:
      'Upload a picture and split it into columns. Choose the aspect ratio, crop frame, spacing, border and export every slice at once.',
    type: 'website',
  },
}

export default function XplitResourcePage() {
  return <XplitPlayground />
}

export const instant = false
