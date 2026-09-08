import { IconHeart, IconMessageCircle } from '@tabler/icons-react'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import type { MockupAvatarOptions } from './MockupPrimitives'
import { Button } from '@/registry/primitives/button'
import { cn } from '@/registry/lib/utils'

interface ConversationUser {
  handle: string
  name: string
  time: string
  tweet: string
}

export default function ConversationMockup({
  users,
  ...avatar
}: MockupAvatarOptions & { users: ConversationUser[] }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  const [firstUser, ...replies] = users
  if (!firstUser) return <div />

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-3">
        <span className={cn('flex size-fit overflow-hidden bg-muted p-0.5', avatar.circle && 'rounded-full')}>
          <Avatar name={firstUser.name + (seed || '')} size={32} {...restAvatar} />
        </span>
        <div className="min-w-0 flex-1 rounded-2xl bg-muted p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-foreground">{firstUser.name}</p>
            <span className="text-[0.625rem] text-muted-foreground">{firstUser.time}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{firstUser.tweet}</p>
        </div>
      </div>
      <div className="ms-11 mt-2 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="h-auto gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-[0.625rem] font-semibold text-muted-foreground hover:text-foreground"
        >
          <IconMessageCircle aria-hidden="true" size={14} className="size-auto" />
          Reply
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="h-auto gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-[0.625rem] font-semibold text-muted-foreground hover:text-foreground"
        >
          <IconHeart aria-hidden="true" size={14} className="size-auto" />
          React
        </Button>
      </div>
      <div className="ms-11 mt-4 flex flex-col gap-2">
        {replies.map((user) => (
          <div key={user.name} className="flex items-center gap-2 rounded-xl bg-muted p-2.5">
            <span className={cn('flex size-fit overflow-hidden bg-background p-0.5', avatar.circle && 'rounded-full')}>
              <Avatar name={user.name + (seed || '')} size={22} {...restAvatar} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.6875rem] font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[0.625rem] text-muted-foreground">{user.handle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
