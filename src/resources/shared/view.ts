import type { ResourceViewMode } from './types'

const ALIASES: Record<string, ResourceViewMode> = {
  gallery: 'gallery',
  grid: 'gallery',
  seed: 'seed',
  mockup: 'mockup',
  mock: 'mockup',
  mckup: 'mockup',
  video: 'video',
  vid: 'video',
}

export function viewFromQuery(
  value: string | null | undefined,
  allowed: readonly ResourceViewMode[],
  fallback: ResourceViewMode = 'gallery',
): ResourceViewMode {
  const next = ALIASES[value?.trim().toLowerCase() ?? '']
  if (next && allowed.includes(next)) return next
  return fallback
}

export function writeViewQuery(view: ResourceViewMode) {
  const url = new URL(window.location.href)
  url.searchParams.set('view', view)
  const next = url.pathname + url.search
  if (window.location.pathname + window.location.search === next) return
  window.history.replaceState(window.history.state, '', next)
}
