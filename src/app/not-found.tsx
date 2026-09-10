import Link from 'next/link'
import { IconArrowLeft, IconLayoutGrid } from '@tabler/icons-react'
import { Button } from '@/registry/primitives/button'
import { Surface } from '@/components/marketing/landing/surface'
import { PageLayoutSync } from '@/components/docs/layout/page-layout-sync'
import { Mode } from '@/config/preview-config'

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-4 py-16 text-foreground">
      <PageLayoutSync mode={Mode.standard} defaultMode={Mode.standard} />
      <Surface className="w-full max-w-lg" innerClassName="px-6 py-10 sm:px-8 sm:py-12">
        <p className="font-mono text-sm tabular-nums text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">This page is not in the kit.</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The route is missing, renamed, or never shipped. Head home or open a family that exists.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href="/" />}>
            <IconArrowLeft />
            Home
          </Button>
          <Button variant="outline" render={<Link href="/components" />}>
            <IconLayoutGrid />
            Browse the kit
          </Button>
        </div>
      </Surface>
    </main>
  )
}
