import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import { remarkInclude } from 'fumadocs-mdx/config'
import type { Page } from '@/lib/source'
import fs from 'node:fs/promises'
import path from 'node:path'
import { siteConfig } from '@/lib/space-config'

const processor = remark()
  .use(remarkMdx)
  // needed for Fumadocs MDX
  .use(remarkInclude)
  .use(remarkGfm)

export async function getLLMText(page: Page | any) {
  if (!page) {
    throw new Error('Page is required')
  }

  const collection = page.url.startsWith('/ui-kit') ? 'ui-kit' : page.url.startsWith('/tools') ? 'resources' : 'docs'

  let fullPath = page.absolutePath

  if (page.absolutePath) {
    const normalized = page.absolutePath.replace(/\\/g, '/')
    const match = normalized.match(/(?:^|\/)src\/content\/(.+)$/)
    if (match) {
      fullPath = path.join(process.cwd(), 'src', 'content', match[1])
    }
  } else if (page.path) {
    fullPath = path.join(process.cwd(), 'src', 'content', collection, page.path)
  }

  if (!fullPath) {
    throw new Error(`Unable to resolve file path for page: ${page.url}`)
  }

  const content = await fs.readFile(fullPath, 'utf-8')

  const processed = await processor.process({
    path: fullPath,
    value: content,
  })

  // note: it doesn't escape frontmatter, it's up to you.
  return `# ${page.data.title}
URL: ${siteConfig.url}${page.url}

${processed.value}`
}
