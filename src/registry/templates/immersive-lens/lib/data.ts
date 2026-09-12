export interface CategoryItem {
  label: string
  image: string
  thumb: string
  colors: readonly string[]
}

export interface GalleryImage {
  url: string
  title: string
  category: string
  location?: string
  camera?: string
}

export type LayoutMode = 'vertical' | 'horizontal'
export type LightboxPhase = 'closed' | 'opening' | 'open' | 'closing'

export const ease = [0.104, 0.204, 0.492, 1] as const

export const glass =
  'bg-black/75 backdrop-blur-[4px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),inset_1.8px_3px_0_-2px_rgba(255,255,255,.45),inset_-2px_-2px_0_-2px_rgba(255,255,255,.4),inset_-3px_-8px_1px_-6px_rgba(255,255,255,.3),inset_-.3px_-1px_4px_rgba(0,0,0,.09),0_1px_5px_rgba(0,0,0,.08),0_6px_16px_rgba(0,0,0,.12),0_6px_12px_rgba(0,0,0,.12)]'

export const categories: readonly CategoryItem[] = [
  {
    label: 'Lens',
    image: 'https://cdn.spaceui.one/atom/samples/image-1.png',
    thumb: 'https://cdn.spaceui.one/atom/samples/image-1.png',
    colors: ['#F3ECF3', '#D9C6DB', '#D694AD', '#AD7092'],
  },
  {
    label: 'Fashion',
    image: 'https://cdn.spaceui.one/atom/samples/image-2.png',
    thumb: 'https://cdn.spaceui.one/atom/samples/image-2.png',
    colors: ['#DBD1D0', '#282824', '#E9C797', '#D0A975'],
  },
  {
    label: 'Journey',
    image: 'https://cdn.spaceui.one/atom/samples/image-3.png',
    thumb: 'https://cdn.spaceui.one/atom/samples/image-3.png',
    colors: ['#D7F3FD', '#B4D0E8', '#8DB5D9', '#6B99C5'],
  },
] as const

export const galleryImages = [
  'https://cdn.spaceui.one/atom/samples/image-1.png',
  'https://cdn.spaceui.one/atom/samples/image-2.png',
  'https://cdn.spaceui.one/atom/samples/image-3.png',
  'https://cdn.spaceui.one/atom/samples/image-4.png',
  'https://cdn.spaceui.one/atom/samples/image-5.png',
  'https://cdn.spaceui.one/atom/samples/image-6.png',
  'https://cdn.spaceui.one/atom/samples/image-7.png',
] as const
