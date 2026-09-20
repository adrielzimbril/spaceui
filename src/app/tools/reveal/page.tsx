import type { Metadata } from 'next'
import { RevealPlayground } from '@/tools/reveal/playground'

export const metadata: Metadata = {
  title: '3D Reveal — Cinematic Brush-Reveal WebGL Tool',
  description:
    'Turn two images into a cinematic 3D brush-reveal — real-time WebGL depth parallax, right in your browser.',
  openGraph: {
    title: '3D Reveal | Space UI',
    description: 'Turn two images into a cinematic 3D brush-reveal in real-time WebGL.',
    type: 'website',
  },
}

export default function RevealResourcePage() {
  return <RevealPlayground />
}

export const instant = false
