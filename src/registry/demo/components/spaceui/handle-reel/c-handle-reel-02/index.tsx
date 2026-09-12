'use client'

import * as React from 'react'
import { HandleReel } from '@/registry/components/spaceui/handle-reel'
import { Button } from '@/registry/components/spaceui/button-squircle'
import { IconRotateDot } from '@tabler/icons-react'

const CREATIVE_ROLES = ['engineer', 'designer', 'architect', 'builder', 'founder', 'creator', 'developer', 'maker']

export default function Demo() {
  const [trigger, setTrigger] = React.useState(0)
  const [finalRole, setFinalRole] = React.useState('creator')

  const handleRoll = () => {
    const nextRoles = CREATIVE_ROLES.filter((r) => r !== finalRole)
    const randomNext = nextRoles[Math.floor(Math.random() * nextRoles.length)]
    setFinalRole(randomNext)
    setTrigger((t) => t + 1)
  }

  return (
    <div className="flex h-full min-h-130 w-full flex-col items-center justify-center gap-8 bg-background p-6">
      <HandleReel
        prefix="ryna.me/"
        names={CREATIVE_ROLES}
        finalName={finalRole}
        trigger={trigger}
        highlightColor="oklch(0.7 0.2 150)"
      />

      <Button variant="default" size="sm" whileTap asPointer onClick={handleRoll} className="flex items-center gap-2">
        <IconRotateDot size={16} />
        <span>Roll Handle</span>
      </Button>
    </div>
  )
}
