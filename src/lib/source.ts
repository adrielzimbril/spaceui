import { docs, uiKit, resources } from '../../.source/server'
import { LucideIcons } from '@/registry/icons/lucide-icons'
import { attachFile } from '@/lib/attach-file'
import SpaceUIIcon from '@/registry/icons/animateui-icon'
import { loader, type InferMetaType, type InferPageType } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'

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
    if (icon in icons) return createElement(icons[icon as keyof typeof icons])
    if (icon === 'SpaceUIIcon') return createElement(SpaceUIIcon)
    if (icon === 'LucideIcons') return createElement(LucideIcons)
  },
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  ...commonLoaderOptions,
})

export const uiKitSource = loader({
  baseUrl: '/ui-kit',
  source: uiKit.toFumadocsSource(),
  ...commonLoaderOptions,
})

export const resourcesSource = loader({
  baseUrl: '/tools',
  source: resources.toFumadocsSource(),
  ...commonLoaderOptions,
})

export type Page = InferPageType<typeof source>
export type Meta = InferMetaType<typeof source>
