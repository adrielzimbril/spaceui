import { IconStack2, IconClick, IconPackage } from '@tabler/icons-react'
import { Surface } from './surface'

const PRINCIPLES = [
  {
    title: 'Nest, don’t shade',
    icon: IconStack2,
    body: 'Every chrome well is a muted tray holding a brighter panel. The fill change is the structure.',
  },
  {
    title: 'One carbon fill',
    icon: IconClick,
    body: 'Primary actions are near-black. Signal blue is selection, never a CTA. Color stays semantic.',
  },
  {
    title: 'Install a piece',
    icon: IconPackage,
    body: 'Registry items land in your app. You and your agent hit the same @spaceui name. You own the file.',
  },
]

export function Principles() {
  return (
    <section data-page-section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
          A compact product dialect.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Inter at 500. Headings at 600 with −0.03em. Icons stay 16px outline. Dark mode inverts the tray.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <Surface
              key={item.title}
              innerClassName="flex min-h-52 flex-col p-5"
              header={
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="grid size-8 place-items-center rounded-sm bg-background text-muted-foreground">
                    <item.icon className="size-4" />
                  </span>
                </div>
              }
            >
              <p className="mt-auto text-sm leading-6 text-muted-foreground">{item.body}</p>
            </Surface>
          ))}
        </div>
      </div>
    </section>
  )
}
