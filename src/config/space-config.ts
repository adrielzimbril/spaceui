import {
  menuConfig,
  megaMenuDocs,
  megaMenuLibrary,
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
  megaMenuLibrary,
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

export { REGISTRY_COMMAND_STYLE, REGISTRY_NAMESPACE, REGISTRY_BASE_URL } from '@/lib/install-command'

const appInfo = {
  site: 'https://www.spaceui.one',
  appName: 'Space UI',
  email: 'hello@spaceui.one',
  namespace: 'usespaceui',
  // repoPath: 'usespaceui/ui',
  repoPath: 'adrielzimbril/spaceui',
  twitterHandle: '@usespaceui',
}

export const siteConfig = {
  name: 'spaceui.one',
  appName: appInfo.appName,
  email: appInfo.email,
  title: 'Space UI - Open-source design library for humans and AI',
  headline: 'Ship your ideas faster with better UI',
  description:
    'An open-source design library built for humans and AI to create expressive, polished, and high-quality interfaces, helping you build better products, faster',
  ogDescription:
    'An open-source design library built for humans and AI to create expressive, polished, and high-quality interfaces, helping you build better products, faster',
  links: {
    docs: `${appInfo.site}/docs`,
    // github: `https://github.com/${appInfo.repoPath}/`,
    github: `https://github.com/adrielzimbril/spaceui`,
    // twitter: `https://x.com/${appInfo.twitterHandle}`,
    x: 'https://x.com/adrielzimbril',
    authorTwitter: 'https://x.com/adrielzimbril',
    email: `mailto:${appInfo.email}`,
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

// ── Global Bento Cycle & Interaction Settings ──
export const BENTO_CYCLE_INTERVAL = 5000
export const USER_INTERACTION_DEBOUNCE = 3000
