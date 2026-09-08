import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import { MockupBadge, type MockupAvatarOptions } from './MockupPrimitives'
import { cn } from '@/registry/lib/utils'

interface ChatUser {
  name: string
  status?: boolean
  time: string
}

export default function ChatMockup({
  users,
  ...avatar
}: MockupAvatarOptions & { users: ChatUser[] }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="flex h-full flex-col gap-2.5">
      {users.map((user) => (
        <div key={user.name} className="flex items-center gap-3 rounded-2xl bg-muted p-3">
          <span className={cn('flex size-fit overflow-hidden bg-background p-0.5', avatar.circle && 'rounded-full')}>
            <Avatar name={user.name + (seed || '')} size={30} {...restAvatar} />{' '}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
            <p className="mt-0.5 truncate text-[0.625rem] text-muted-foreground">
              @{user.name.split(' ')[0].toLowerCase()}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[0.625rem] tabular-nums text-muted-foreground">{user.time}</span>
            {user.status && <MockupBadge>Active</MockupBadge>}
          </div>
        </div>
      ))}
    </div>
  )
}
