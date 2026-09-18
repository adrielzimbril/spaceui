import { Badge } from '@/registry/components/spaceui/badge-squircle'

export function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-12 text-center">
      <Badge size="md" className="px-3.5 py-1.5 font-semibold text-xs tracking-tight">
        {badge}
      </Badge>
      <div className="max-w-2xl">
        <h2 className="text-[34px] font-semibold tracking-tight text-foreground sm:text-[46px] md:text-[54px]">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
