/**
 * One-off generator: creates a permanent .mdx stub per showcase project so it also
 * appears in the Templates system (sidebar, /templates index, /templates/<slug> detail page
 * with a live iframe). Not wired into any build step — re-run by hand when projects.json
 * gains new entries: `npx tsx scripts/generate-showcase-templates.ts`
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import projectsData from '../src/data/projects.json'
import type { ProjectItem } from '../src/types/project'

const TEMPLATES_DIR = path.join(process.cwd(), 'src/content/ui-kit/templates')
const META_PATH = path.join(TEMPLATES_DIR, 'meta.json')

function slugify(name: string): string {
  return name.replace(/-landing$/, '')
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function buildMdx(project: ProjectItem, slug: string): string {
  return `---
title: "${escapeYaml(project.title)}"
description: "${escapeYaml(project.description)}"
showcase: true
preview:
  name: showcase-${slug}
  iframe: true
  open: true
  externalUrl: "${project.url}"
---
`
}

function main() {
  const projects = (projectsData as { projects: ProjectItem[] }).projects
  const seen = new Set<string>()
  const slugs: string[] = []

  for (const project of projects) {
    const slug = slugify(project.name)
    if (seen.has(slug)) {
      throw new Error(`Duplicate showcase slug after shortening: "${slug}" (from "${project.name}")`)
    }
    seen.add(slug)
    slugs.push(slug)

    const filePath = path.join(TEMPLATES_DIR, `${slug}.mdx`)
    fs.writeFileSync(filePath, buildMdx(project, slug))
    console.log(`Wrote ${path.relative(process.cwd(), filePath)}`)
  }

  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8')) as { pages: string[]; [key: string]: unknown }
  const pages = meta.pages.filter((entry) => !entry.startsWith('---Showcase---') && !slugs.includes(entry))
  pages.push('---Showcase---', ...slugs)
  meta.pages = pages
  fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`)
  console.log(`Updated ${path.relative(process.cwd(), META_PATH)} with ${slugs.length} showcase entries.`)
}

main()
