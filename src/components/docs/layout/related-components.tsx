import { IconArrowRight } from '@tabler/icons-react'
import type { RelatedComponent } from '@/lib/docs-metadata'
import { Badge } from '@/registry/primitives/badge'
import { Link } from '@/registry/primitives/link'
import { cn } from '@/registry/lib/utils'

export type RelatedGroup = {
  id?: string
  title: string
  items: RelatedComponent[]
}

interface RelatedComponentsProps {
  className?: string
  items?: RelatedComponent[]
  groups?: RelatedGroup[]
  title?: string
  id?: string
}

function RelatedCard({ item }: { item: RelatedComponent }) {
  return (
    <Link
      href={item.url}
      className="group relative flex flex-col justify-between rounded-2xl p-1 gap-1 bg-muted hover:bg-muted/80 transition-all duration-300"
    >
      <div className="flex w-full px-2.5 pt-2 pb-1 items-center justify-between gap-2">
        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
          {item.title}
        </span>
        <Badge variant={item.category === 'Primitive' ? 'outline' : 'secondary'} className="bg-background shrink-0">
          {item.category}
        </Badge>
      </div>

      <div className="flex w-full p-3 flex-col justify-between gap-3 bg-background rounded-lg flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>

        <Badge variant="secondary" className="place-self-end">
          View
          <IconArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Badge>
      </div>
    </Link>
  )
}

function RelatedGrid({ items }: { items: RelatedComponent[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 [html[data-layout-mode=split]_&]:grid-cols-1! [html[data-layout-mode=canvas]_&]:grid-cols-1!">
      {items.map((item, index) => (
        <RelatedCard key={item.name ? `${item.url}-${item.name}` : `${item.url}-${item.title}-${index}`} item={item} />
      ))}
    </div>
  )
}

export function RelatedComponents({
  className,
  items,
  groups,
  title = 'Related Components',
  id = 'related-components',
}: RelatedComponentsProps) {
  const sections = groups?.filter((group) => group.items.length) ?? (items?.length ? [{ title, items }] : [])
  if (sections.length === 0) return null

  const hasGroups = Boolean(groups && groups.length > 1)
  const showHeading = hasGroups || Boolean(!groups && title)

  return (
    <section
      id={id}
      className={cn(
        'mt-12 mb-6 not-prose w-full scroll-m-24',
        groups && 'mt-0 flex-1 prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-m-24',
        className,
      )}
    >
      {showHeading && !hasGroups && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
        </div>
      )}

      <div className={hasGroups ? 'flex flex-col gap-10' : undefined}>
        {sections.map((section) => (
          <div key={section.id ?? section.title} id={section.id} className="scroll-m-24">
            {hasGroups && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">{section.title}</h2>
              </div>
            )}
            <RelatedGrid items={section.items} />
          </div>
        ))}
      </div>
    </section>
  )
}
