import { source } from '@/lib/source'
import type { OramaDocument } from 'fumadocs-core/search/orama-cloud'
import { NextResponse } from 'next/server'

export async function GET(): Promise<Response> {
  const pages = source.getPages()
  const results = await Promise.all(
    pages
      .filter((page) => page.slugs[0] !== 'openapi')
      .map(async (page) => {
        const { structuredData } = page.data as any
        const structured =
          typeof structuredData === 'function'
            ? await structuredData()
            : (structuredData ?? { headings: [], contents: [] })

        return {
          id: page.url,
          structured,
          tag: page.slugs[0] ?? '',
          url: page.url,
          title: page.data.title ?? '',
          description: page.data.description ?? '',
        } satisfies OramaDocument
      }),
  )

  return NextResponse.json(results)
}
