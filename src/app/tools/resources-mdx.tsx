import { resourcesSource as source } from '@/lib/source'
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { getMDXComponents } from '@/mdx-components'
import { DocsAuthor } from '@/components/docs/layout/author'
import { PageActions } from '@/components/docs/layout/page-actions'
import { Button } from '@/registry/primitives/button'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import { getDocsNeighbours } from '@/lib/docs-nav'

export async function ResourcesMdx({ slug }: { slug?: string[] }) {
  const page = source.getPage(slug)
  if (!page) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageData = page.data as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MDXContent = pageData.body as any
  const { prev: prevNav, next: nextNav } = getDocsNeighbours(source, page.url)

  return (
    <DocsPage toc={pageData.toc as any} full={pageData.full}>
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <DocsTitle className="font-medium">{pageData.title}</DocsTitle>
        {(prevNav || nextNav) && (
          <div className="flex flex-row items-center gap-1.5 pt-0.5">
            <Link
              href={prevNav?.url ?? page.url}
              aria-disabled={!prevNav}
              className={!prevNav ? 'pointer-events-none opacity-50' : undefined}
              aria-label={prevNav ? `Aller à ${prevNav.name}` : 'Pas de page précédente'}
            >
              <Button variant="accent" size="icon-sm">
                <IconArrowLeft />
              </Button>
            </Link>
            <Link
              href={nextNav?.url ?? page.url}
              aria-disabled={!nextNav}
              className={!nextNav ? 'pointer-events-none opacity-50' : undefined}
              aria-label={nextNav ? `Aller à ${nextNav.name}` : 'Pas de page suivante'}
            >
              <Button variant="accent" size="icon-sm">
                <IconArrowRight />
              </Button>
            </Link>
          </div>
        )}
      </div>
      <DocsDescription className="mb-1 font-normal">{pageData.description}</DocsDescription>
      {pageData.author && <DocsAuthor name={pageData.author.name} url={pageData.author?.url} />}
      <div className="flex flex-row items-center gap-2">
        <PageActions path={`resources/${page.path}`} url={page.url} />
      </div>
      <DocsBody id="docs-body" className="pb-10 pt-4">
        <MDXContent components={getMDXComponents({ a: createRelativeLink(source, page) }) as any} />
      </DocsBody>
    </DocsPage>
  )
}
