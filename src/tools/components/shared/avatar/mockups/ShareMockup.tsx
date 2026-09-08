import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import { MockupBadge, type MockupAvatarOptions } from './MockupPrimitives'
import { cn } from '@/registry/lib/utils'

interface SharedUser {
  name: string
  role: string
}

export default function ShareMockup({
  users,
  ...avatar
}: MockupAvatarOptions & { users: SharedUser[] }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="grid h-full grid-cols-2 gap-2 sm:grid-cols-4">
      {users.slice(0, 8).map((user) => (
        <div
          key={`${user.name}-${user.role}`}
          className="flex min-w-0 flex-col items-center rounded-2xl bg-muted p-3 text-center"
        >
          <span className={cn('flex size-fit overflow-hidden bg-background p-0.5', avatar.circle && 'rounded-full')}>
            <Avatar size={32} name={user.name + (seed || '')} {...restAvatar} />{' '}
          </span>

          <p className="mt-2 w-full truncate text-xs font-semibold text-foreground">{user.name}</p>
          <MockupBadge className="mt-1 max-w-full truncate">{user.role}</MockupBadge>
        </div>
      ))}
    </div>
  )
}
