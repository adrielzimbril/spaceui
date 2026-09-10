import { OgPlayground } from '@/tools/og-image/playground'

export const metadata = {
  title: 'OG Image Generator — Space UI',
  description:
    'Compose, animate and export Space UI social previews: 12 layouts, 12 styles, per-element chips, inline editing, PNG and MP4 export.',
}

export default function OgImagePage() {
  return <OgPlayground />
}

export const instant = false
