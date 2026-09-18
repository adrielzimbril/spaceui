import { isComponentPro as isComponentProEdge, normalizeComponentSlug } from './pro-auth-edge'

export { verifyProAuthorization } from './pro-auth-edge'

const proStatusCache = new Map<string, boolean>()
const PRO_REGEX = /"isPro"\s*:\s*true|\bisPro\s*:\s*true|\bpro\s*:\s*true/

export function isComponentPro(slug: string): boolean {
  if (!slug) return false

  const { clean, direct } = normalizeComponentSlug(slug)

  if (proStatusCache.has(clean)) {
    return proStatusCache.get(clean)!
  }

  if (isComponentProEdge(slug)) {
    proStatusCache.set(clean, true)
    return true
  }

  // Dynamic check from files on server when running in Node.js environment
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    try {
      const fs = require('node:fs')
      const path = require('node:path')
      const appRoot = path.basename(process.cwd()) === 'www' ? process.cwd() : path.join(process.cwd(), 'apps', 'www')

      // Check public/r JSON files
      for (const c of [clean, `block-${direct}`, direct, `template-${direct}`]) {
        const publicPath = path.join(appRoot, 'public', 'r', `${c}.json`)
        if (fs.existsSync(publicPath)) {
          const content = fs.readFileSync(publicPath, 'utf8')
          if (PRO_REGEX.test(content)) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }

      // Check registry-item.json in any registry category
      const regCategories = ['blocks', 'primitives', 'components/spaceui', 'components/space', 'templates']
      for (const cat of regCategories) {
        const regFile = path.join(appRoot, 'src', 'registry', cat, direct, 'registry-item.json')
        if (fs.existsSync(regFile)) {
          const content = fs.readFileSync(regFile, 'utf8')
          if (PRO_REGEX.test(content)) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }

      // Check MDX documentation frontmatter
      const docCategories = ['blocks', 'primitives', 'components', 'templates']
      for (const cat of docCategories) {
        const mdxFile = path.join(appRoot, 'src', 'content', 'ui-kit', cat, `${direct}.mdx`)
        if (fs.existsSync(mdxFile)) {
          const content = fs.readFileSync(mdxFile, 'utf8')
          const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
          if (match && PRO_REGEX.test(match[1])) {
            proStatusCache.set(clean, true)
            return true
          }
        }
      }
    } catch {}
  }

  proStatusCache.set(clean, false)
  return false
}
