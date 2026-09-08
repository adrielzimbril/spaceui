import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/app/layout.config'
import { uiKitSource as source } from '@/lib/source'
import XIcon from '@/registry/icons/x-icon'
import { siteConfig } from '@/config/space-config'

export const UI_KIT_LAYOUT_PROPS: DocsLayoutProps = {
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
