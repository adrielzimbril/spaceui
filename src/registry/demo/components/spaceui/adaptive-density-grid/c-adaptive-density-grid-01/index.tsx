'use client'

import Image from 'next/image'
import { AdaptiveDensityGrid, type DensityOption } from '@/registry/components/spaceui/adaptive-density-grid'
import { Badge } from '@/registry/components/spaceui/badge-squircle'
import { IconLayoutGrid, IconGridDots, IconColumns, IconList } from '@tabler/icons-react'

const GALLERY_IMAGES = [
  {
    id: 'img-1',
    title: 'Aura Gradient 01',
    tag: 'Palette',
    url: 'https://avatars.spaceui.one/v1?name=aurora&variant=gradients',
  },
  {
    id: 'img-2',
    title: 'Solar Pulse 02',
    tag: 'Neon',
    url: 'https://avatars.spaceui.one/v1?name=solarpulse&variant=gradients',
  },
  {
    id: 'img-3',
    title: 'Cyber Mist 03',
    tag: 'Abstract',
    url: 'https://avatars.spaceui.one/v1?name=cybermist&variant=gradients',
  },
  {
    id: 'img-4',
    title: 'Hyperion Glow 04',
    tag: 'Vector',
    url: 'https://avatars.spaceui.one/v1?name=hyperion&variant=gradients',
  },
  {
    id: 'img-5',
    title: 'Deep Chroma 05',
    tag: 'Vibrant',
    url: 'https://avatars.spaceui.one/v1?name=chroma&variant=gradients',
  },
  {
    id: 'img-6',
    title: 'Prismatic Void 06',
    tag: 'Modern',
    url: 'https://avatars.spaceui.one/v1?name=prismatic&variant=gradients',
  },
  {
    id: 'img-7',
    title: 'Cosmic Drift 07',
    tag: 'Fluid',
    url: 'https://avatars.spaceui.one/v1?name=cosmic&variant=gradients',
  },
  {
    id: 'img-8',
    title: 'Velvet Horizon 08',
    tag: 'Editorial',
    url: 'https://avatars.spaceui.one/v1?name=velvet&variant=gradients',
  },
]

const DENSITY_OPTIONS: DensityOption[] = [
  {
    id: 'spacious',
    label: 'Spacious',
    icon: <IconList className="size-3.5" />,
    columns: { desktop: 1, tablet: 1, mobile: 1 },
    gap: 'clamp(1rem, 2vw, 1.5rem)',
  },
  {
    id: 'normal',
    label: 'Normal',
    icon: <IconLayoutGrid className="size-3.5" />,
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 'clamp(0.75rem, 1.5vw, 1.25rem)',
  },
  {
    id: 'compact',
    label: 'Compact',
    icon: <IconGridDots className="size-3.5" />,
    columns: { desktop: 4, tablet: 3, mobile: 2 },
    gap: 'clamp(0.5rem, 1vw, 0.875rem)',
  },
]

export default function AdaptiveDensityGridDemo01() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <AdaptiveDensityGrid
        items={GALLERY_IMAGES}
        options={DENSITY_OPTIONS}
        defaultActiveId="normal"
        renderItem={(item, idx, { isRearranging }) => (
          <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-muted aspect-4/3 shadow-xs">
            <Image
              src={item.url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                <Badge size="xs" variant="secondary" className="bg-white/20 text-white backdrop-blur-xs border-0">
                  {item.tag}
                </Badge>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}
