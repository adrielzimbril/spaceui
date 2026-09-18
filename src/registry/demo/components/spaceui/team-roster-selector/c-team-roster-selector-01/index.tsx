'use client'

import * as React from 'react'
import { TeamRosterSelector } from '@/registry/components/spaceui/team-roster-selector'
import { toastManager } from '@/registry/primitives/toast'

export interface TeamRosterDemoProps {
  corner?: number
  maxDisplay?: number
}

export default function Demo({ corner = 24, maxDisplay = 5 }: TeamRosterDemoProps) {
  const [selected, setSelected] = React.useState<string[]>(['guillermo'])

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
      <TeamRosterSelector
        corner={Number(corner)}
        maxDisplay={Number(maxDisplay)}
        selectedIds={selected}
        onSelectionChange={setSelected}
        onAction={(ids) => {
          toastManager.add({
            type: 'success',
            title: 'Members assigned',
            description: `Successfully assigned ${ids.length} member${ids.length > 1 ? 's' : ''} to the project.`,
          })
        }}
      />
    </div>
  )
}
