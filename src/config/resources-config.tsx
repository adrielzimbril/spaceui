import { DocsLayoutProps } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/app/layout.config'
import { resourcesSource as source } from '@/lib/source'
import XIcon from '@/registry/icons/x-icon'
import { SIDEBAR_TABS } from '@/config/navigation'
import { siteConfig } from '@/config/space-config'

export const RESOURCES_LAYOUT_PROPS: DocsLayoutProps = {
  tree: source.pageTree,
  sidebar: {
    tabs: SIDEBAR_TABS,
  },
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
