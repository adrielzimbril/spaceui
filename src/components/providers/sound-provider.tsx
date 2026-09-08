'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import * as spaceSounds from '@usespaceui/sounds'
import { useLocalStorage } from '@/registry/hooks/browser/use-local-storage'

const STORAGE_KEY = 'space-ui-sounds-enabled'

// Module-level state for zero-latency synchronous checks
let isSoundActive = true

export function isAudioEnabled() {
  return isSoundActive
}

export function bloomSound(...args: any[]) {
  if (!isSoundActive) return
  try {
    if (typeof spaceSounds.bloom === 'function') {
      spaceSounds.bloom(...args)
    }
  } catch (e) {
    // Ignore audio errors
  }
}

export function slideSound(...args: any[]) {
  if (!isSoundActive) return
  try {
    if (typeof spaceSounds.slide === 'function') {
      spaceSounds.slide(...(args.length ? args : ['in']))
    }
  } catch (e) {
    // Ignore audio errors
  }
}

export function tapSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.tap()
  } catch {}
}

export function tickSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.tick()
  } catch {}
}

export function toggleSound(state?: 'on' | 'off') {
  if (!isSoundActive) return
  try {
    spaceSounds.toggle(state ?? 'on')
  } catch {}
}

export function confirmSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.confirm()
  } catch {}
}

export function sparkleSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.sparkle()
  } catch {}
}

export function chimeSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.chime()
  } catch {}
}

export function dropletSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.droplet()
  } catch {}
}

export function readySound() {
  if (!isSoundActive) return
  try {
    spaceSounds.ready()
  } catch {}
}

export function openSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.open()
  } catch {}
}

export function closeSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.close()
  } catch {}
}

export function removeSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.remove()
  } catch {}
}

export function nudgeSound(dir: 'up' | 'down' = 'up') {
  if (!isSoundActive) return
  try {
    spaceSounds.nudge(dir)
  } catch {}
}

export function pageSound() {
  if (!isSoundActive) return
  try {
    spaceSounds.page()
  } catch {}
}

type SoundContextValue = {
  enabled: boolean
  setEnabled: (value: boolean) => void
  suppressed: boolean
  playSound: (name: 'bloom' | 'slide' | 'click' | 'toggle', ...args: any[]) => void
}

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  setEnabled: () => {},
  suppressed: false,
  playSound: () => {},
})

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useLocalStorage<boolean>(STORAGE_KEY, true)
  const [suppressed, setSuppressed] = useState(false)

  // Initialize Space UI sound bindings once on mount
  useEffect(() => {
    try {
      if (typeof spaceSounds.setVoice === 'function') {
        spaceSounds.setVoice('Space UI')
      }
      if (typeof spaceSounds.setVolume === 'function') {
        spaceSounds.setVolume(0.35)
      }
      if (typeof spaceSounds.bind === 'function') {
        spaceSounds.bind()
      }
    } catch {
      // Ignore audio init errors
    }
  }, [])

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (coarse || reducedMotion) {
      setSuppressed(true)
      isSoundActive = false
      try {
        if (typeof spaceSounds.setEnabled === 'function') {
          spaceSounds.setEnabled(false)
        }
      } catch {}
      return
    }

    isSoundActive = enabled
    try {
      if (typeof spaceSounds.setEnabled === 'function') {
        spaceSounds.setEnabled(enabled)
      }
    } catch {}
  }, [enabled])

  const updateEnabled = useCallback(
    (next: boolean) => {
      setEnabledState(next)
      isSoundActive = next
      try {
        if (typeof spaceSounds.setEnabled === 'function') {
          spaceSounds.setEnabled(next)
        }
      } catch {}
    },
    [setEnabledState],
  )

  const playSound = useCallback((name: 'bloom' | 'slide' | 'click' | 'toggle', ...args: any[]) => {
    if (name === 'bloom') bloomSound(...args)
    else if (name === 'slide') slideSound(...args)
    else bloomSound(...args)
  }, [])

  const value = useMemo(
    () => ({
      enabled: enabled && !suppressed,
      setEnabled: updateEnabled,
      suppressed,
      playSound,
    }),
    [enabled, suppressed, updateEnabled, playSound],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSoundToggle() {
  return useContext(SoundContext)
}

export function useUiSound() {
  const { playSound, enabled } = useContext(SoundContext)
  return { playSound, enabled, bloom: bloomSound, slide: slideSound }
}
