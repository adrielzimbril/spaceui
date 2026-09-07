'use client'

import React from 'react'
import { useSoundToggle, useUiSound } from '@/components/providers/sound-provider'
import { useLayoutMode, Mode } from '@/components/providers/layout-mode-provider'
import { IconVolume, IconVolumeOff, IconLayoutColumns, IconLayoutSidebarRight } from '@tabler/icons-react'
import { Group } from '@/registry/primitives/group'
import { Button } from '@/registry/primitives/button'
import { MorphIcon } from '@/registry/components/spaceui/morph-icon'
import { ModeSwitcher } from '@/registry/components/spaceui/mode-switcher'
import { ColorPickerNav } from '@/components/customizer/color-picker-nav'
import { PmNav } from '@/components/customizer/pm-nav'
import { BundleDrawer } from '@/components/customizer/bundle-drawer'
import { cn } from '@/registry/lib/utils'

function SoundToggle() {
  const { enabled, setEnabled, suppressed } = useSoundToggle()
  const { playSound } = useUiSound()

  if (suppressed) return null

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    if (next) {
      playSound('bloom')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
      aria-pressed={enabled}
      className="size-8 rounded-lg! bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors overflow-hidden"
      onClick={toggle}
    >
      <MorphIcon activeKey={enabled ? 'on' : 'off'} variant="blur-scale">
        {enabled ? (
          <IconVolume className="size-4 text-foreground font-bold" />
        ) : (
          <IconVolumeOff className="size-4 text-muted-foreground" />
        )}
      </MorphIcon>
    </Button>
  )
}

function LayoutModeToggle() {
  const { mode, cycleMode, canSwitchMode, isModeLocked } = useLayoutMode()

  if (isModeLocked) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        isModeLocked
          ? `Layout locked to ${mode === Mode.standard ? 'Standard' : 'Dual Studio'} on this page`
          : `Layout Mode: ${mode}`
      }
      className={cn(
        'size-8 rounded-lg! bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors overflow-hidden',
        isModeLocked && 'opacity-60 cursor-not-allowed',
      )}
      onClick={canSwitchMode ? cycleMode : undefined}
      disabled={!canSwitchMode}
      title={
        isModeLocked
          ? `Layout locked to ${mode === Mode.standard ? 'Standard' : 'Dual Studio'} for this page`
          : `Layout Mode: ${mode === Mode.standard ? 'Standard' : 'Dual Studio'}`
      }
    >
      <MorphIcon activeKey={mode} variant="blur-scale">
        {mode === Mode.standard ? (
          <IconLayoutColumns className="size-4" />
        ) : (
          <IconLayoutSidebarRight className="size-4" />
        )}
      </MorphIcon>
    </Button>
  )
}

export function FloatNav() {
  const { isImmersive } = useLayoutMode()
  if (isImmersive) return null

  return (
    <nav aria-label="Floating Dock Navigation" className="fixed bottom-22 md:bottom-5 left-1/2 -translate-x-1/2 z-50">
      <Group className="inline-flex items-center rounded-xl bg-muted p-0.5 gap-1 border-2 border-muted">
        {/* Site controls */}
        <ModeSwitcher
          variant="ghost"
          className="size-8 rounded-lg! bg-background hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors overflow-hidden"
        />
        <SoundToggle />
        <ColorPickerNav />
        <LayoutModeToggle />

        {/* Divider */}
        <div className="h-3.5 w-px bg-border" />

        {/* Package Manager & Bundle */}
        <PmNav />
        <BundleDrawer />
      </Group>
    </nav>
  )
}
