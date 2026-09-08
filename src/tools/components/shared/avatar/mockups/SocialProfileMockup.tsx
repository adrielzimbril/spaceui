import { cn } from '@/registry/lib/utils'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import { MockupMetric, type MockupAvatarOptions } from './MockupPrimitives'

export default function SocialProfileMockup({
  name,
  ...avatar
}: MockupAvatarOptions & { img: string; name: string }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-fit overflow-hidden place-items-center rounded-2xl bg-muted p-1',
            avatar.circle && 'rounded-full',
          )}
        >
          <Avatar name={name + (seed || '')} size={52} {...restAvatar} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="mt-1 text-xs text-muted-foreground">Designer · Frontend developer</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <MockupMetric label="Posts" value="143" />
        <MockupMetric label="Followers" value="1.2M" />
        <MockupMetric label="Following" value="452" />
      </div>
    </div>
  )
}
