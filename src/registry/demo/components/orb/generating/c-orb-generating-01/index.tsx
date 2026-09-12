'use client'

import * as React from 'react'
import {
  GeneratingOrb,
  type GeneratingOrbProps,
  type GeneratingOrbRenderer,
} from '@/registry/components/orb/generating'

export interface GeneratingOrbDemoProps extends GeneratingOrbProps {
  renderer?: GeneratingOrbRenderer
}

export default function Demo({
  renderer = 'css',
  size = 240,
  depth = 1.0,
  speed = 2.0,
  duration = 2000,
  stagger = 100,
  pop = 1.15,
  restOpacity = 0.4,
  textSize = 1.2,
  tracking = 0,
  text = 'Generating',
  showText = true,
  highlightColor = '#ffffff',
  haloColor = '#ad5fff',
  coreColor = '#471eec',
  haloColorAlt = '#d60a47',
  coreColorAlt = '#311e80',
  textColor = '#ffffff',
  playback = 'play',
}: GeneratingOrbDemoProps) {
  const [activeRenderer, setActiveRenderer] = React.useState<GeneratingOrbRenderer>(renderer)

  React.useEffect(() => {
    setActiveRenderer(renderer)
  }, [renderer])

  return (
    <div className="flex size-full min-h-[380px] flex-col items-center justify-center gap-6 p-6">
      {/* Renderer Switcher Pill */}
      <div className="flex items-center rounded-full bg-muted/70 p-1 text-xs backdrop-blur-sm border border-border/40 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveRenderer('css')}
          className={`rounded-full px-3.5 py-1 font-medium transition-all ${
            activeRenderer === 'css'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          CSS Engine
        </button>
        <button
          type="button"
          onClick={() => setActiveRenderer('canvas')}
          className={`rounded-full px-3.5 py-1 font-medium transition-all ${
            activeRenderer === 'canvas'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Canvas 2D Engine
        </button>
      </div>

      <div className="relative flex items-center justify-center p-4">
        <GeneratingOrb
          key={activeRenderer}
          renderer={activeRenderer}
          size={size}
          depth={depth}
          speed={speed}
          duration={duration}
          stagger={stagger}
          pop={pop}
          restOpacity={restOpacity}
          textSize={textSize}
          tracking={tracking}
          text={text}
          showText={showText}
          highlightColor={highlightColor}
          haloColor={haloColor}
          coreColor={coreColor}
          haloColorAlt={haloColorAlt}
          coreColorAlt={coreColorAlt}
          textColor={textColor}
          playback={playback}
        />
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Active Engine: <span className="font-semibold text-foreground uppercase">{activeRenderer}</span> &bull; Cycle: {duration}ms &bull; Depth: {depth}×
      </div>
    </div>
  )
}
