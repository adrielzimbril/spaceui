import {
  menuConfig,
  megaMenuDocs,
  megaMenuUiKit,
  megaMenuTools,
  mobileNavGroups,
  searchNavShortcuts,
  searchStaticResources,
  type MegaMenuItem,
  type ResourceItem,
  type NavItem,
  type NavGroup,
  type SearchShortcutItem,
} from './menu-config'

export {
  menuConfig,
  megaMenuDocs,
  megaMenuUiKit,
  megaMenuTools,
  mobileNavGroups,
  searchNavShortcuts,
  searchStaticResources,
  type MegaMenuItem,
  type ResourceItem,
  type NavItem,
  type NavGroup,
  type SearchShortcutItem,
}

const appInfo = {
  site: 'https://www.spaceui.one',
  appName: 'Space UI',
  namespace: 'usespaceui',
  // repoPath: 'usespaceui/ui',
  repoPath: 'adrielzimbril/spaceui',
  twitterHandle: '@usespaceui',
}

export const siteConfig = {
  name: 'spaceui.one',
  appName: appInfo.appName,
  title: 'Space UI - Motion-Powered React & Tailwind Components',
  description:
    'Space UI - A modern, high-performance UI kit built with React, TypeScript, Tailwind CSS, Base UI, and Framer Motion. Explore sensory components, blocks, primitives, and full starter kits.',
  ogDescription:
    'Space UI - A modern, high-performance UI kit built with React, TypeScript, Tailwind CSS, Base UI, and Framer Motion.',
  links: {
    docs: `${appInfo.site}/docs`,
    // github: `https://github.com/${appInfo.repoPath}/`,
    github: `https://github.com/adrielzimbril/spaceui`,
    // twitter: `https://x.com/${appInfo.twitterHandle}`,
    x: 'https://x.com/adrielzimbril',
    authorTwitter: 'https://x.com/adrielzimbril',
  },
  author: {
    name: 'adrielzimbril',
    twitter: 'https://x.com/adrielzimbril',
    twitterHandle: '@adrielzimbril',
  },
  namespace: appInfo.namespace,
  twitterHandle: appInfo.twitterHandle,
  ogImage: `${appInfo.site}/og-image.png`,
  url: appInfo.site,
  megaMenu: menuConfig.megaMenu,
  mobileMenu: menuConfig.mobileMenu,
  search: menuConfig.search,
  tools: menuConfig.megaMenu.tools,
}
