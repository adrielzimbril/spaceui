'use client'

import * as React from 'react'
import { HandleReel } from '@/registry/components/spaceui/handle-reel'
import { Tabs, TabsList, TabsTab } from '@/registry/primitives/tabs'

interface OptionConfig {
  prefix: string
  finalName: string
  names: string[]
  highlightColor: string
  loop?: boolean
  spinDuration?: number
}

const TAB_OPTIONS: Record<string, OptionConfig> = {
  username: {
    prefix: 'ryna.me/',
    finalName: 'ryna',
    names: ['soren', 'elena', 'julian', 'maya', 'lucas', 'chloe', 'alex', 'theo', 'zack', 'olivia', 'leo'],
    highlightColor: '#6366f1',
    loop: true,
  },
  handle: {
    prefix: '@',
    finalName: 'spaceui',
    names: ['creator', 'developer', 'designer', 'engineer', 'architect', 'artist', 'founder', 'visionary', 'craftsman'],
    highlightColor: '#10b981',
    loop: true,
  },
  url: {
    prefix: 'spaceui.one/',
    finalName: 'showcase',
    names: ['components', 'primitives', 'blocks', 'templates', 'animations', 'canvas', 'shaders', 'craft'],
    highlightColor: '#f43f5e',
    loop: true,
  },
  manual: {
    prefix: 'ryna.me/',
    finalName: 'your-name',
    names: ['create', 'design', 'custom', 'handle', 'creative', 'explore', 'build', 'maker'],
    highlightColor: '#8b5cf6',
    loop: false,
    spinDuration: 2,
  },
}

export default function Demo() {
  const [selectedTab, setSelectedTab] = React.useState('username')
  const [trigger, setTrigger] = React.useState(0)

  const current = TAB_OPTIONS[selectedTab] || TAB_OPTIONS.username

  const handleTabChange = (val: string) => {
    setSelectedTab(val)
    setTrigger((prev) => prev + 1)
  }

  return (
    <div className="relative flex h-full min-h-130 w-full flex-col items-center justify-center gap-8 md:gap-16 p-6 text-foreground">
      <div className="z-10 flex w-full justify-center">
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="items-center">
          <TabsList variant="default" size="sm">
            <TabsTab value="username">Username (ryna.me/)</TabsTab>
            <TabsTab value="handle">Handle (@)</TabsTab>
            <TabsTab value="url">URL (spaceui.one/)</TabsTab>
            <TabsTab value="manual">Manual (Type)</TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex w-full items-center justify-center">
        <HandleReel
          key={selectedTab}
          prefix={current.prefix}
          finalName={current.finalName}
          names={current.names}
          highlightColor={current.highlightColor}
          spinDuration={current.spinDuration ?? 4.2}
          trigger={trigger}
          loop={current.loop ?? true}
          loopDelay={2500}
          editable
        />
      </div>
    </div>
  )
}
