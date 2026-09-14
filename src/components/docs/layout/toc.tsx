'use client'

import * as React from 'react'
import { IconMenu, IconBook } from '@tabler/icons-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/registry/lib/utils'

export type DocDependency = {
  name: string
  label: string
  url: string
  npmUrl?: string
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0% 0% -80% 0%' },
    )

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [itemIds])

  return activeId
}

function NpmBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('size-3.5 shrink-0', className)} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#cb3837" />
      <path d="M7 7.5h10v9h-5v-4.5h-2.5v4.5H7V7.5z" fill="#ffffff" />
    </svg>
  )
}

export function DocsTableOfContents({
  toc,
  dependencies = [],
  hasRelated = false,
  className,
}: {
  toc?: {
    title?: React.ReactNode
    url: string
    depth: number
  }[]
  dependencies?: DocDependency[]
  hasRelated?: boolean
  className?: string
}) {
  const pathname = usePathname()
  const [showcaseToc, setShowcaseToc] = React.useState<{ title?: React.ReactNode; url: string; depth: number }[]>([])

  // Reset TOC when path changes immediately to prevent showing old items
  React.useEffect(() => {
    setShowcaseToc([])
  }, [pathname])

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateShowcaseCards = () => {
      const cards = document.querySelectorAll<HTMLElement>('[data-slot="showcase-card"]')
      if (!cards || cards.length === 0) {
        setShowcaseToc((prev) => (prev.length === 0 ? prev : []))
        return
      }

      const items = Array.from(cards)
        .map((card) => {
          const id = card.id || card.getAttribute('data-toc-id') || ''
          const title = card.getAttribute('data-toc-title') || card.getAttribute('title') || ''
          if (!id || !title) return null
          return {
            title,
            url: `#${id}`,
            depth: 3,
          }
        })
        .filter((item): item is { title: string; url: string; depth: number } => Boolean(item))

      setShowcaseToc((prev) => {
        // Deep compare to avoid unnecessary re-renders
        if (JSON.stringify(prev) === JSON.stringify(items)) {
          return prev
        }
        return items
      })
    }

    // Allow DOM to settle before scanning
    timeoutId = setTimeout(updateShowcaseCards, 150)

    // Observe potential DOM changes for dynamic loading
    const observer = new MutationObserver(() => {
      updateShowcaseCards()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [toc, pathname])

  const fullToc = React.useMemo(() => {
    const base = toc ? [...toc] : []

    if (showcaseToc.length > 0) {
      // Find where #examples is located in the TOC
      const examplesIndex = base.findIndex(
        (item) => item.url.toLowerCase() === '#examples' || item.url.toLowerCase() === '#exemples',
      )

      // Filter out any items already present in base
      const newItems = showcaseToc.filter((sc) => !base.some((b) => b.url === sc.url))

      if (examplesIndex >= 0) {
        // Insert right after #examples
        base.splice(examplesIndex + 1, 0, ...newItems)
      } else {
        // Append at the end before related components
        base.push(...newItems)
      }
    }

    if (hasRelated && !base.some((item) => item.url === '#related-components')) {
      base.push({
        title: 'Related Components',
        url: '#related-components',
        depth: 2,
      })
    }
    return base
  }, [toc, showcaseToc, hasRelated])

  const itemIds = React.useMemo(() => fullToc.map((item) => item.url.replace('#', '')), [fullToc])
  const activeHeading = useActiveItem(itemIds)

  const hasToc = fullToc.length > 0
  const hasDeps = Boolean(dependencies && dependencies.length > 0)

  if (!hasToc && !hasDeps) {
    return null
  }

  return (
    <div className={cn('z-10 flex flex-col gap-6 py-0 pl-0 pr-4 text-sm', className)}>
      {/* TOC items */}
      {hasToc && (
        <div className="flex flex-col gap-1">
          <p className="flex h-7 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <IconMenu className="size-3.5 text-muted-foreground" />
            <span>On This Page</span>
          </p>
          <div className="relative ml-3.5 flex flex-col gap-0.5 before:absolute before:inset-y-0 before:-left-[13px] before:w-px before:bg-border">
            {fullToc.map((item) => (
              <a
                key={item.url}
                href={item.url}
                className="group relative py-1.5 text-[.6875rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6 outline-none"
                data-active={item.url === `#${activeHeading}`}
                data-depth={item.depth}
              >
                {/* Active Indicator Line */}
                {item.url === `#${activeHeading}` && (
                  <div className="absolute inset-y-0 -left-3.25 w-0.5 bg-primary rounded-full" />
                )}
                <span className="opacity-80 group-hover:opacity-100 transition-opacity">{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Powered by section */}
      {hasDeps && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
            <IconBook className="size-3.5 text-muted-foreground" />
            <span>Powered by</span>
          </div>

          <div className="flex flex-col gap-1.5 pl-1">
            {dependencies.map((dep) => (
              <div key={dep.name} className="flex items-center gap-2">
                <a
                  href={dep.npmUrl ?? `https://www.npmjs.com/package/${dep.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${dep.name} on npm`}
                  className="hover:scale-110 transition-transform shrink-0 outline-none"
                >
                  <NpmBadgeIcon />
                </a>
                <a
                  href={dep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors outline-none"
                >
                  <span className="decoration-transparent">
                    {/* {dep.label} */}
                    {dep.name}
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
