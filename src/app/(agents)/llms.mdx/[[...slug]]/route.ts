import { type NextRequest, NextResponse } from 'next/server'
import { getLLMText } from '@/lib/get-llm-text'
import { source, uiKitSource, resourcesSource } from '@/lib/source'
import { notFound } from 'next/navigation'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params

  const cleanSlug = [...slug]
  if (cleanSlug.length > 0 && cleanSlug[cleanSlug.length - 1].endsWith('.mdx')) {
    cleanSlug[cleanSlug.length - 1] = cleanSlug[cleanSlug.length - 1].replace(/\.mdx$/, '')
  }

  let page: any = null

  if (cleanSlug[0] === 'ui-kit') {
    page = uiKitSource.getPage(cleanSlug.slice(1))
  } else if (cleanSlug[0] === 'tools' || cleanSlug[0] === 'resources') {
    page = resourcesSource.getPage(cleanSlug.slice(1))
  } else if (cleanSlug[0] === 'docs') {
    page = source.getPage(cleanSlug.slice(1))
  } else {
    page = source.getPage(cleanSlug) || uiKitSource.getPage(cleanSlug) || resourcesSource.getPage(cleanSlug)
  }

  if (!page) notFound()

  try {
    const text = await getLLMText(page)
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    console.error(`[llms.mdx] Error reading ${cleanSlug.join('/')}:`, error)
    notFound()
  }
}

export function generateStaticParams() {
  return [
    ...source.generateParams().map((p) => ({ slug: ['docs', ...(p.slug || [])] })),
    ...uiKitSource.generateParams().map((p) => ({ slug: ['ui-kit', ...(p.slug || [])] })),
    ...resourcesSource.generateParams().map((p) => ({ slug: ['tools', ...(p.slug || [])] })),
  ]
}
