'use client'

import * as React from 'react'
import { FluidCountdown } from '@/registry/components/spaceui/fluid-countdown'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'

type CountdownMode = 'sprint' | 'focus' | 'pomodoro'

interface CountdownConfig {
  label: string
  duration: number
  color: string
}

const MODES: Record<CountdownMode, CountdownConfig> = {
  sprint: {
    label: 'Sprint (30s)',
    duration: 30,
    color: '#ff3828',
  },
  focus: {
    label: 'Focus (5m)',
    duration: 300,
    color: '#6366f1',
  },
  pomodoro: {
    label: 'Pomodoro (25m)',
    duration: 1500,
    color: '#10b981',
  },
}

export default function Demo() {
  const [mode, setMode] = React.useState<CountdownMode>('sprint')
  const current = MODES[mode]

  return (
    <div className="relative flex h-full min-h-130 w-full flex-col items-center justify-center gap-8 md:gap-16 p-6 text-foreground">
      <Tabs value={mode} onValueChange={(val) => setMode(val as CountdownMode)} className="items-center">
        <TabsList variant="default" size="sm">
          <TabsTab value="sprint">Sprint (30s)</TabsTab>
          <TabsTab value="focus">Focus (5m)</TabsTab>
          <TabsTab value="pomodoro">Pomodoro (25m)</TabsTab>
        </TabsList>
      </Tabs>

      <div className="flex w-full items-center justify-center">
        <FluidCountdown
          key={mode}
          duration={current.duration}
          autoStart
          loop
          label={current.label}
          accentColor={current.color}
        />
      </div>
    </div>
  )
}
