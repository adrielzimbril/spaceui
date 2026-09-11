import { Avatar } from '@/registry/primitives/avatar'
import { AvatarExtended, AvatarFallback } from '@/registry/components/spaceui/avatar-extended'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <AvatarExtended>
        <Avatar className="size-8">
          <AvatarFallback name="Alice Martin" />
        </Avatar>
      </AvatarExtended>

      <AvatarExtended>
        <Avatar className="size-10">
          <AvatarFallback name="Bob Chen" />
        </Avatar>
      </AvatarExtended>

      <AvatarExtended>
        <Avatar className="size-12">
          <AvatarFallback name="Carol Davis" />
        </Avatar>
      </AvatarExtended>

      <AvatarExtended>
        <Avatar className="size-16">
          <AvatarFallback name="Dave Kim" />
        </Avatar>
      </AvatarExtended>

      <AvatarExtended>
        <Avatar className="size-20 rounded-xl">
          <AvatarFallback name="Eve Lopez" />
        </Avatar>
      </AvatarExtended>
    </div>
  )
}
