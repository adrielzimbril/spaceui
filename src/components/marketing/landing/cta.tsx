import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'
import { Surface } from './surface'

export function Cta() {
  return (
    <section data-page-section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <Surface innerClassName="grid gap-10 bg-muted px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-center lg:px-12 lg:py-14">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Take a piece. Keep going.</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Start with a button, or open the full kit. Same command in the docs and in your agent.
            </p>
            <Button size="lg" className="mt-8" render={<Link href="/docs" />}>
              Read the docs
              <IconArrowRight />
            </Button>
          </div>
          <InstallCommandBlock className="my-0" title="Install" isShadcn packages="primitives-button" />
        </Surface>
      </div>
    </section>
  )
}
