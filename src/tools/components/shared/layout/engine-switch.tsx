'use client'

import { Avatar } from '@usespaceui/avatars/react'
import { Squishmoji } from '@usespaceui/squishmoji/react'
import { ToggleGroup, ToggleGroupItem } from '@/registry/primitives/toggle-group'
import { DEFAULT_SEEDS } from '@/tools/shared/seeds'
import type { AvatarEngine } from '@/tools/shared/engine'

const ENGINES = [
  { id: 'avatars' as const, label: 'Avatars' },
  { id: 'squishmoji' as const, label: 'Squishmoji' },
]

function EnginePreview({ engine }: { engine: AvatarEngine }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md">
      {engine === 'squishmoji' ? (
        <span className="flex size-full origin-center scale-[1.55] items-center justify-center">
          <Squishmoji seed={DEFAULT_SEEDS} size={20} animate={false} backgroundStyle="all" />
        </span>
      ) : (
        <Avatar
          name={DEFAULT_SEEDS}
          size={20}
          circle
          animate={false}
          className="size-5 [&_svg]:size-full [&_svg]:justify-self-center"
        />
      )}
    </span>
  )
}

export function AvatarEngineSwitch({
  engine,
  onEngineChange,
  expanded = false,
}: {
  engine: AvatarEngine
  onEngineChange: (engine: AvatarEngine) => void
  expanded?: boolean
}) {
  return (
    <ToggleGroup
      value={[engine]}
      onValueChange={(value) => {
        const next = value[0]
        if (next === 'avatars' || next === 'squishmoji') onEngineChange(next)
      }}
      aria-label="Avatar engine"
      size="sm"
      className="h-8 rounded-lg bg-muted"
    >
      {ENGINES.map((item) => (
        <ToggleGroupItem
          key={item.id}
          value={item.id}
          aria-label={item.label}
          className="h-full gap-1.5 px-1.5 text-[0.6875rem] md:px-2.5"
        >
          <EnginePreview engine={item.id} />
          <span className={expanded ? 'hidden' : 'hidden md:inline'}>{item.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
