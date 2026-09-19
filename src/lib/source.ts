import { docs, library, resources } from '../../.source/server'
import { LucideIcons } from '@/registry/icons/lucide-icons'
import { attachFile } from '@/lib/attach-file'
import SpaceUIIcon from '@/registry/icons/animateui-icon'
import { loader, type InferMetaType, type InferPageType } from 'fumadocs-core/source'
import { IconBox, IconLayout } from '@tabler/icons-react'
import { createElement } from 'react'

const TABLER_DOC_ICONS: Record<string, any> = {
  Layout: IconLayout,
  Cuboid: IconBox,
}

const commonLoaderOptions = {
  pageTree: {
    transformers: [
      {
        file: attachFile as any,
      },
    ],
  },
  icon(icon?: string) {
    if (!icon) return
    if (icon in TABLER_DOC_ICONS) return createElement(TABLER_DOC_ICONS[icon])
    if (icon === 'SpaceUIIcon') return createElement(SpaceUIIcon)
    if (icon === 'LucideIcons') return createElement(LucideIcons)
  },
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  ...commonLoaderOptions,
})

export const librarySource = loader({
  baseUrl: '',
  source: library.toFumadocsSource(),
  ...commonLoaderOptions,
})

export const resourcesSource = loader({
  baseUrl: '/tools',
  source: resources.toFumadocsSource(),
  ...commonLoaderOptions,
})

export type Page = InferPageType<typeof source>
export type Meta = InferMetaType<typeof source>
