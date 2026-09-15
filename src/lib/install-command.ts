export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export type InstallCommands = {
  npm: string
  pnpm: string
  yarn: string
  bun: string
}

export const REGISTRY_NAMESPACE = '@spaceui'
export const REGISTRY_BASE_URL = 'https://www.spaceui.one/r'

/**
 * Registry installation command style:
 * - 'scoped': Uses the official validated registry namespace `@spaceui/<name>`
 *             Example: `pnpm dlx shadcn@latest add @spaceui/components-spaceui-morphing-text`
 * - 'url':    Uses direct registry JSON URLs
 *             Example: `pnpm dlx shadcn@latest add https://www.spaceui.one/r/components-spaceui-morphing-text.json`
 *
 * Switch to 'scoped' or 'url' whenever you want to toggle the command format across the entire site!
 */
export const REGISTRY_COMMAND_STYLE: 'scoped' | 'url' = 'scoped'

/**
 * Known short name mappings to exact registry item names
 */
const KNOWN_SHORT_MAPPINGS: Record<string, string> = {
  utils: 'lib-utils',
  // Primitives short names
  accordion: 'primitives-accordion',
  'alert-dialog': 'primitives-alert-dialog',
  alert: 'primitives-alert',
  'aspect-ratio': 'primitives-aspect-ratio',
  autocomplete: 'primitives-autocomplete',
  avatar: 'primitives-avatar',
  badge: 'primitives-badge',
  breadcrumb: 'primitives-breadcrumb',
  button: 'primitives-button',
  calendar: 'primitives-calendar',
  card: 'primitives-card',
  checkbox: 'primitives-checkbox',
  collapsible: 'primitives-collapsible',
  combobox: 'primitives-combobox',
  command: 'primitives-command',
  'context-menu': 'primitives-context-menu',
  'date-picker': 'primitives-date-picker',
  dialog: 'primitives-dialog',
  drawer: 'primitives-drawer',
  empty: 'primitives-empty',
  field: 'primitives-field',
  fieldset: 'primitives-fieldset',
  form: 'primitives-form',
  frame: 'primitives-frame',
  group: 'primitives-group',
  'input-group': 'primitives-input-group',
  input: 'primitives-input',
  kbd: 'primitives-kbd',
  label: 'primitives-label',
  link: 'primitives-link',
  menu: 'primitives-menu',
  menubar: 'primitives-menubar',
  meter: 'primitives-meter',
  'navigation-menu': 'primitives-navigation-menu',
  'number-field': 'primitives-number-field',
  'otp-field': 'primitives-otp-field',
  pagination: 'primitives-pagination',
  popover: 'primitives-popover',
  'preview-card': 'primitives-preview-card',
  'preview-link-card': 'primitives-preview-link-card',
  progress: 'primitives-progress',
  'radio-group': 'primitives-radio-group',
  'scroll-area': 'primitives-scroll-area',
  select: 'primitives-select',
  separator: 'primitives-separator',
  sheet: 'primitives-sheet',
  sidebar: 'primitives-sidebar',
  skeleton: 'primitives-skeleton',
  slider: 'primitives-slider',
  spinner: 'primitives-spinner',
  switch: 'primitives-switch',
  table: 'primitives-table',
  tabs: 'primitives-tabs',
  textarea: 'primitives-textarea',
  toast: 'primitives-toast',
  'toggle-group': 'primitives-toggle-group',
  toggle: 'primitives-toggle',
  toolbar: 'primitives-toolbar',
  tooltip: 'primitives-tooltip',
}

/**
 * Resolve an exact registry item identifier name (e.g. "components-spaceui-morphing-text", "primitives-button")
 */
export function resolveRegistryItemName(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()

  // Strip scopes, full URLs, and trailing .json
  const clean = trimmed
    .replace(/^https?:\/\/[^/]+\/r\//, '')
    .replace(/\.json$/, '')
    .replace(/^@[\w.-]+\//, '')
    .replace(/^@[\w.-]+\//, '')
    .trim()

  // 1. Direct short name mapping
  if (KNOWN_SHORT_MAPPINGS[clean]) {
    return KNOWN_SHORT_MAPPINGS[clean]
  }

  // 2. Already prefixed or exact (primitives-, components-, block-, template-, hooks-, lib-)
  if (
    clean.startsWith('primitives-') ||
    clean.startsWith('components-') ||
    clean.startsWith('block-') ||
    clean.startsWith('template-') ||
    clean.startsWith('hooks-') ||
    clean.startsWith('lib-')
  ) {
    return clean
  }

  // 3. Fallback to spaceui component prefix if not matched
  return `components-spaceui-${clean}`
}

/**
 * Resolve an exact registry item URL
 */
export function resolveRegistryItemUrl(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!trimmed.includes('spaceui.one')) {
      return trimmed.endsWith('.json') ? trimmed : `${trimmed}.json`
    }
  }

  const name = resolveRegistryItemName(trimmed)
  return `${REGISTRY_BASE_URL}/${name}.json`
}

/**
 * Format component or primitive names for shadcn CLI
 * Supports both scoped format (@spaceui/...) and direct URL format (https://www.spaceui.one/r/...)
 */
export function formatRegistryItem(name: string, style: 'scoped' | 'url' = REGISTRY_COMMAND_STYLE): string {
  if (!name) return ''
  if (name.includes(' ')) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((item) => formatRegistryItem(item, style))
      .join(' ')
  }

  // If already a third-party external URL, keep as-is
  if ((name.startsWith('http://') || name.startsWith('https://')) && !name.includes('spaceui.one')) {
    return name.endsWith('.json') ? name : `${name}.json`
  }

  if (style === 'scoped') {
    const itemName = resolveRegistryItemName(name)
    return `${REGISTRY_NAMESPACE}/${itemName}`
  }

  return resolveRegistryItemUrl(name)
}

/**
 * Clean up registry import paths for clean end-user code display and copy
 */
export function formatCodeForDisplay(inputCode?: string | null): string {
  if (!inputCode) return ''

  return inputCode.replace(/(['"])([\s\S]*?)\1/g, (match, quote, content) => {
    if (content.startsWith('@/registry/')) {
      const rest = content.slice('@/registry/'.length)
      if (rest.startsWith('lib/')) {
        return `${quote}@/${rest}${quote}`
      }
      if (rest.startsWith('hooks/')) {
        return `${quote}@/${rest}${quote}`
      }
      if (rest.startsWith('primitives/')) {
        const primitiveName = rest.slice('primitives/'.length)
        return `${quote}@/components/ui/${primitiveName}${quote}`
      }
      if (rest.startsWith('components/space/')) {
        const compName = rest.slice('components/space/'.length)
        return `${quote}@/components/spaceui/${compName}${quote}`
      }
      if (rest.startsWith('components/')) {
        const compName = rest.slice('components/'.length)
        return `${quote}@/components/spaceui/${compName}${quote}`
      }
      return `${quote}@/${rest}${quote}`
    } else if (content.startsWith('@workspace/ui/')) {
      const rest = content.slice('@workspace/ui/'.length)
      return `${quote}@/${rest}${quote}`
    }
    return match
  })
}

/**
 * Generate shadcn CLI add commands for all package managers
 */
export function getShadcnAddCommands(name: string, style: 'scoped' | 'url' = REGISTRY_COMMAND_STYLE): InstallCommands {
  const item = formatRegistryItem(name, style)
  return {
    npm: `npx shadcn@latest add ${item}`,
    pnpm: `pnpm dlx shadcn@latest add ${item}`,
    yarn: `npx shadcn@latest add ${item}`,
    bun: `bunx --bun shadcn@latest add ${item}`,
  }
}

/**
 * Generate package installation commands (npm, pnpm, yarn, bun)
 */
export function getPackageInstallCommands(packageName: string, isDev = false): InstallCommands {
  const devFlag = isDev ? ' -D' : ''
  const yarnDevFlag = isDev ? ' --dev' : ''
  return {
    npm: `npm install ${packageName}${devFlag}`,
    pnpm: `pnpm add ${packageName}${devFlag}`,
    yarn: `yarn add ${packageName}${yarnDevFlag}`,
    bun: `bun add ${packageName}${devFlag}`,
  }
}

/**
 * Get direct JSON URL for a component
 */
export function getRegistryJsonUrl(name: string): string {
  const clean = name
    .replace(/^https?:\/\/[^/]+\/r\//, '')
    .replace(/\.json$/, '')
    .replace(/^@[\w.-]+\//, '')
    .replace(/^@[\w.-]+\//, '')
    .trim()
  return `${REGISTRY_BASE_URL}/${clean}.json`
}
