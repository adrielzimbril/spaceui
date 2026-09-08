import { cn } from '@/registry/lib/utils'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import type { MockupAvatarOptions } from './MockupPrimitives'

export default function DashboardMockup({ ...avatar }: MockupAvatarOptions): React.ReactElement {
  const { seed, ...restAvatar } = avatar

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 text-left">
        <span className={cn('flex size-fit overflow-hidden bg-background p-1', avatar.circle && 'rounded-full')}>
          <Avatar name={'Latest activity' + (seed || '')} size={32} {...restAvatar} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Latest post</p>
          <p className="mt-1 text-xs text-muted-foreground">Published 2h ago</p>
        </div>
      </div>
    </div>
  )
}
