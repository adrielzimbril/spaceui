import Link from 'next/link'

const groups = [
  {
    title: 'Product',
    links: [
      ['Components', '/docs/components'],
      ['Customize', '/customize'],
      ['Dashboard', '/dashboard'],
    ],
  },
  {
    title: 'Tools',
    links: [
      ['All tools', '/tools'],
      ['Image Split', '/tools/imagesplit'],
      ['Avatars', '/tools/avatars'],
      ['Emoji', '/tools/emoji'],
      ['Flags', '/tools/flags'],
      ['Plush', '/tools/plush'],
      ['Documentation', '/docs'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Sign in', '/login'],
      ['Create account', '/signup'],
      ['Dashboard', '/dashboard'],
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-[1670px] px-5 py-10">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-sm font-semibold">Space UI</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Motion-powered React components, sensory hooks, Base UI primitives, and complete design systems you own.
            </p>
            <span className="mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
              Space design system
            </span>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1670px] flex-col gap-2 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Space UI. Open source components.</p>
          <p>Base UI only · MIT License.</p>
        </div>
      </div>
    </footer>
  )
}
