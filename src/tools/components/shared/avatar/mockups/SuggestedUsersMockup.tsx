import { Button } from '@/registry/primitives/button'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import type { MockupAvatarOptions } from './MockupPrimitives'
import { cn } from '@/registry/lib/utils'

export default function SuggestedUsersMockup({
  users,
  ...avatar
}: MockupAvatarOptions & { users: Array<{ name: string }> }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="grid h-full grid-cols-2 gap-2">
      {users.map((user) => (
        <div key={user.name} className="flex min-w-0 flex-col items-center rounded-2xl bg-muted p-3 text-center">
          <span className={cn('flex size-fit overflow-hidden bg-background p-0.5', avatar.circle && 'rounded-full')}>
            <Avatar name={user.name + (seed || '')} size={38} {...restAvatar} />
          </span>
          <p className="mt-2 w-full truncate text-xs font-semibold text-foreground">{user.name.split(' ')[0]}</p>
          <p className="mt-0.5 text-[0.625rem] text-muted-foreground">12 mutuals</p>
          <Button variant="secondary" size="xs" className="mt-3 w-full rounded-lg border-0 bg-background">
            Follow
          </Button>
        </div>
      ))}
    </div>
  )
}
