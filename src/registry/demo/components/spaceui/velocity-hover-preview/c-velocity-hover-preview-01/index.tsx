'use client'

import { VelocityHoverPreview } from '@/registry/components/spaceui/velocity-hover-preview'
import { logger } from '@/registry/utils/logger'

const sampleServices = [
  {
    id: '01',
    num: '01',
    title: 'Space UI Twilight Ring',
    subtitle: 'Luminous Coastal Horizon & Twilight Shaders',
    mediaUrl: 'https://cdn.spaceui.one/atom/samples/image-1.png',
  },
  {
    id: '02',
    num: '02',
    title: 'Flora Kinetic Portrait',
    subtitle: 'Botanical Florals & Reactive Micro-interactions',
    mediaUrl: 'https://cdn.spaceui.one/atom/samples/image-2.png',
  },
  {
    id: '03',
    num: '03',
    title: 'Forest Sanctum Architecture',
    subtitle: 'Timber Pavilion Amidst Misty Pines & Flows',
    mediaUrl: 'https://cdn.spaceui.one/atom/samples/image-3.png',
  },
  {
    id: '04',
    num: '04',
    title: 'Blossom Archway Portal',
    subtitle: 'Curved Stone Portals & Spatial Gateways',
    mediaUrl: 'https://cdn.spaceui.one/atom/samples/image-4.png',
  },
  {
    id: '05',
    num: '05',
    title: 'Space Botanical Slumber',
    subtitle: 'High-Octane Shaders & Dreamy Foliage Depth',
    mediaUrl: 'https://cdn.spaceui.one/atom/samples/image-5.png',
  },
]

export interface VelocityHoverPreviewDemoProps {
  accentColor?: string
}

export default function Demo({ accentColor = '#ffe9a8' }: VelocityHoverPreviewDemoProps) {
  return (
    <div className="w-full max-w-4xl px-4 py-8">
      <VelocityHoverPreview
        items={sampleServices}
        accentColor={accentColor}
        onItemSelect={(item) => logger.log('Selected:', item.title)}
      />
    </div>
  )
}
