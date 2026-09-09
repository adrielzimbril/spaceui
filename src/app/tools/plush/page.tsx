import type { Metadata } from 'next'
import { PlushPlayground } from '@/tools/plush/playground'

export const metadata: Metadata = {
  title: 'Plush — Interactive Tactile Fur & 3D Cushions',
  description:
    'Transform any static or animated image into an interactive 3D plush cushion with procedural fur, realistic grooming physics, and tactile petting.',
  openGraph: {
    title: 'Plush — Interactive Tactile Fur & 3D Cushions | Space UI',
    description:
      'Transform any static or animated image into an interactive 3D plush cushion with procedural fur, realistic grooming physics, and tactile petting.',
    type: 'website',
  },
}

export default function PlushResourcePage() {
  return <PlushPlayground />
}

export const instant = false
