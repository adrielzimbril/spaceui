import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/app/layout.config'
import { librarySource as source } from '@/lib/source'
import XIcon from '@/registry/icons/x-icon'
import { siteConfig } from '@/config/space-config'

export const LIBRARY_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,
  githubUrl: siteConfig.links.github,
  ...baseOptions,
  links: [
    ...(baseOptions.links || []),
    {
      icon: <XIcon />,
      url: siteConfig.links.x,
      text: 'X',
      type: 'icon',
    },
  ],
}

// Backwards compatibility alias
export const UI_KIT_LAYOUT_PROPS = LIBRARY_LAYOUT_PROPS
