import { Avatar } from '@/registry/primitives/avatar'
import { AvatarExtended, AvatarFallback } from '@/registry/components/spaceui/avatar-extended'

const VARIANTS = [
  { name: 'Lumina', variant: 'lumina' },
  { name: 'Shaula', variant: 'shaula' },
  { name: 'Titan', variant: 'titan' },
  { name: 'Glass', variant: 'glass' },
  { name: 'Splash', variant: 'splash' },
  { name: 'Astronaut', variant: 'astronaut' },
  { name: 'Ghost', variant: 'ghost' },
  { name: 'Bot', variant: 'bot' },
  { name: 'Pebble', variant: 'pebble' },
  { name: 'Invader', variant: 'invader' },
  { name: 'Grunge', variant: 'grunge' },
  { name: 'Bored', variant: 'bored' },
  { name: 'Critter', variant: 'critter' },
  { name: 'Kendo', variant: 'kendo' },
] as const

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {VARIANTS.map(({ name, variant }) => (
        <div key={variant} className="flex flex-col items-center gap-1.5">
          <AvatarExtended>
            <Avatar className="size-12">
              <AvatarFallback name={name} variant={variant} />
            </Avatar>
          </AvatarExtended>
          <span className="text-muted-foreground text-xs">{variant}</span>
        </div>
      ))}
    </div>
  )
}
