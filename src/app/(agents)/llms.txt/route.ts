import { source, librarySource } from '@/lib/source'

export async function GET() {
  const docsPages = source.getPages()
  const libraryPages = librarySource.getPages()

  const lines = [
    '# Space UI',
    '',
    '> An open component distribution built with Tailwind CSS v4, Motion, and Base UI.',
    '',
    '## Documentation Index',
    '',
    ...docsPages.map((p) => `- [${p.data.title}](${p.url}): ${p.data.description || ''}`),
    '',
    '## Library (Primitives & Components)',
    '',
    ...libraryPages.map((p) => `- [${p.data.title}](${p.url}): ${p.data.description || ''}`),
    '',
    '## Full Corpus & LLM Endpoints',
    '',
    '- [Full Plaintext Dump](/llms-full.txt): Complete unpaginated documentation text stream.',
    '- [Per-page Markdown Endpoint](/llms.mdx/[path]): Append /llms.mdx/ to any page route to fetch raw Markdown.',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
