import Link from 'next/link'
import { IconArrowRight, IconBox, IconAtom, IconFolderHeart, IconWebhook } from '@tabler/icons-react'
import { Surface } from './surface'

const KITS = [
  {
    title: 'Primitives',
    href: '/ui-kit/primitives',
    body: 'Buttons, dialogs, inputs, menus. Accessible Base UI, Space chrome.',
    icon: IconBox,
  },
  {
    title: 'Components',
    href: '/ui-kit/components',
    body: 'Orbs, accordions, calendars, data grids. The pieces that take a page.',
    icon: IconAtom,
  },
  {
    title: 'Hooks',
    href: '/ui-kit/hooks',
    body: 'Clipboard, debounce, media, scroll. Small utilities with live trays.',
    icon: IconWebhook,
  },
  {
    title: 'Blocks',
    href: '/ui-kit/blocks',
    body: 'Sign-in, mastermind, card-info. Sections you drop in, then own.',
    icon: IconFolderHeart,
  },
]

export function Catalog() {
  return (
    <section data-page-section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">The kit.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Open a family, copy a command, keep going. Named so you and your agent install the same file.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {KITS.map((kit) => (
            <Link key={kit.href} href={kit.href} className="group outline-none">
              <Surface
                innerClassName="flex min-h-40 flex-col p-5"
                header={
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-sm font-semibold">{kit.title}</span>
                    <span className="grid size-8 place-items-center rounded-sm bg-background text-muted-foreground">
                      <kit.icon className="size-4" />
                    </span>
                  </div>
                }
              >
                <p className="text-sm leading-6 text-muted-foreground">{kit.body}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
                  Open
                  <IconArrowRight className="size-4" />
                </span>
              </Surface>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
