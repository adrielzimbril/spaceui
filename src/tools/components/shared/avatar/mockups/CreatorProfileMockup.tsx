import { Button } from '@/registry/primitives/button'
import { Persona as Avatar } from '@/tools/components/shared/avatar/persona'
import Image from 'next/image'
import type { MockupAvatarOptions } from './MockupPrimitives'
import { cn } from '@/registry/lib/utils'

export default function CreatorProfileMockup({
  img,
  name,
  ...avatar
}: MockupAvatarOptions & { img?: string; name: string }): React.ReactElement {
  const { seed, ...restAvatar } = avatar
  return (
    <div className="flex h-full flex-col items-center text-center">
      <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-muted">
        {img && (
          <Image src={img} alt="" fill sizes="22rem" unoptimized className="object-cover opacity-35 saturate-50" />
        )}
      </div>
      <span className={cn('-mt-8 grid place-items-center bg-background p-1 z-10', avatar.circle && 'rounded-full')}>
        <Avatar name={name + (seed || '')} size={58} {...restAvatar} />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">1.2M followers · 451 following</p>
      <Button className="mt-auto rounded-xl border-0 bg-black px-6 text-white hover:bg-black/85" size="sm">
        Follow creator
      </Button>
    </div>
  )
}
