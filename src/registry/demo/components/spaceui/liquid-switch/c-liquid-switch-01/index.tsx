'use client'

import * as React from 'react'
import { LiquidSwitch } from '@/registry/components/spaceui/liquid-switch'

export interface LiquidSwitchDemoProps {
  stretch?: number
  speed?: number
  disabled?: boolean
}

export default function Demo({ stretch = 36, speed = 50, disabled = false }: LiquidSwitchDemoProps) {
  const [checked, setChecked] = React.useState(false)

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[260px] select-none">
      <div className="flex flex-col items-center gap-5">
        <LiquidSwitch
          checked={checked}
          onCheckedChange={setChecked}
          stretch={Number(stretch)}
          speed={Number(speed)}
          disabled={Boolean(disabled)}
        />
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              checked ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-muted-foreground'
            }`}
          />
          <span>{checked ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  )
}
