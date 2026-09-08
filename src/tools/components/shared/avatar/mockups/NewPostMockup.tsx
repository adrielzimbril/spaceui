import { Button } from '@/registry/primitives/button'
import { IconHeart, IconMessageCircle } from '@tabler/icons-react'
import { cn } from '@/registry/lib/utils'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import Image from 'next/image'
import type { MockupAvatarOptions } from './MockupPrimitives'

export default function NewPostMockup({
  img,
  likes,
  name,
  ...avatar
}: MockupAvatarOptions & { img: string; likes: string[]; name: string }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <span className={cn('flex size-fit overflow-hidden bg-muted p-0.5', avatar.circle && 'rounded-full')}>
          <Avatar name={name + (seed || '')} size={34} {...restAvatar} />
        </span>
        <p className="min-w-0 text-xs leading-5 text-muted-foreground">
          <strong className="font-semibold text-foreground">{name}</strong> uploaded a new photo{' '}
          <span className="text-muted-foreground">2 hours ago</span>
        </p>
      </div>
      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        <Image alt="Abstract upload preview" src={img} fill sizes="22rem" unoptimized className="object-cover" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {likes.slice(0, 4).map((likeName) => (
            <span
              key={likeName}
              className={cn('flex size-fit overflow-hidden bg-muted p-0.5', avatar.circle && 'rounded-full')}
            >
              <Avatar name={likeName + (seed || '')} size={26} {...restAvatar} />
            </span>
          ))}
        </div>
        <span className="text-[0.6875rem] text-muted-foreground">5 friends liked this</span>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <Button variant="secondary" size="sm" className="rounded-xl border-0 bg-muted [&_svg]:size-auto">
          <IconHeart aria-hidden="true" size={15} className="size-auto" />
          Like
        </Button>
        <Button variant="secondary" size="sm" className="rounded-xl border-0 bg-muted [&_svg]:size-auto">
          <IconMessageCircle aria-hidden="true" size={15} className="size-auto" />
          Comment
        </Button>
      </div>
    </div>
  )
}
