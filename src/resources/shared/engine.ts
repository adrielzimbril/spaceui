export type AvatarEngine = 'avatars' | 'squishmoji'

export function engineFromType(type?: string | null): AvatarEngine {
  return type === 'squishmoji' || type === 'squish' ? 'squishmoji' : 'avatars'
}

export function enginePath(engine: AvatarEngine) {
  return engine === 'squishmoji' ? '/tools/avatars?type=squishmoji' : '/tools/avatars'
}

export function writeEngineUrl(engine: AvatarEngine) {
  const path = enginePath(engine)
  if (window.location.pathname + window.location.search === path) return
  window.history.replaceState(window.history.state, '', path)
}
