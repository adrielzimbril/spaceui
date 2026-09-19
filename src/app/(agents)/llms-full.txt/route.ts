import { source, librarySource, resourcesSource } from '@/lib/source'
import { getLLMText } from '@/lib/get-llm-text'

export async function GET() {
  const allPages = [...source.getPages(), ...librarySource.getPages(), ...resourcesSource.getPages()]
  const scan = allPages.map(getLLMText)
  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
