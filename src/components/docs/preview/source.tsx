import fs from 'node:fs/promises'
import path from 'node:path'
import type * as React from 'react'

import { ComponentSourceTabs, type ResolvedSource } from '@/components/docs/preview/source-tabs'
import { DynamicCodeBlock } from '@/components/docs/code/dynamic-codeblock'
import { cn } from '@/registry/lib/utils'
import { isComponentPro } from '@/lib/pro-auth'
import { InstallCommandBlock } from '@/components/docs/installation/install-command-block'

export type ComponentSourceProps = React.ComponentProps<'div'> & {
  name?: string
  sources?: string | string[]
  resolveDependencies?: boolean
  allowCopy?: boolean
  language?: string
}

function cleanImports(code: string): string {
  return code
    .replaceAll('@/registry/components/spaceui/', '@/components/spaceui/')
    .replaceAll('@/components/', '@/components/ui/')
    .replaceAll('@/registry/primitives/', '@/components/ui/')
    .replaceAll('@/registry/lib/utils', '@/lib/utils')
    .replaceAll('@/lib/space/utils', '@/lib/utils')
    .replaceAll('@/registry/lib/utils', '@/lib/utils')
    .replaceAll('@/registry/hooks/', '@/hooks/')
    .replaceAll('@/registry/utils/', '@/lib/')
}

function deduceTitleAndLabel(name: string, filePath?: string, targetPath?: string) {
  if (targetPath) {
    let cleanTarget = targetPath
      .replace(/^src\/registry\/components\/space\//, 'components/')
      .replace(/^src\/registry\/components\//, 'components/')
      .replace(/^src\/registry\//, '')
    if (cleanTarget.startsWith('primitives/')) {
      cleanTarget = cleanTarget.replace(/^primitives\//, 'components/ui/')
    }
    const tabLabel = cleanTarget.split('/').pop() || cleanTarget
    return { title: cleanTarget, tabLabel }
  }

  const cleanName = name
    .replace(/^components-spaceui-/, '')
    .replace(/^components-spaceui-base-/, '')
    .replace(/^primitives-/, '')
    .replace(/^demo-/, '')

  let title = `components/ui/${cleanName}.tsx`

  if (name.startsWith('components-spaceui-') || name.startsWith('components-spaceui-base-')) {
    title = `components/spaceui/${cleanName}.tsx`
  } else if (name.startsWith('hooks-') || name.startsWith('use-')) {
    title = `hooks/${cleanName}.ts`
  } else if (name.startsWith('lib-')) {
    title = `lib/${cleanName}.ts`
  } else if (name.startsWith('blocks-') || name.includes('/blocks/')) {
    title = `blocks/${cleanName}.tsx`
  }

  if (filePath && filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    title = title.replace(/\.tsx$/, '.ts')
  }

  const tabLabel = title.split('/').pop() || `${cleanName}.tsx`
  return { title, tabLabel }
}

async function resolveRegistryItem(
  name: string,
  visited: Set<string>,
  resolveDependencies = true,
  defaultLanguage?: string,
): Promise<ResolvedSource[]> {
  const cleanName = name
    .replace(/.*\/([^/]+)\.json$/i, '$1')
    .replace(/^@[^/]+\//, '')
    .replace(/\.json$/, '')

  if (!cleanName || visited.has(cleanName) || isComponentPro(cleanName)) {
    return []
  }
  visited.add(cleanName)

  let parsed: any = null

  // 1. Try reading from public/r/${cleanName}.json
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'r', `${cleanName}.json`)
    const fileData = await fs.readFile(jsonPath, 'utf8')
    parsed = JSON.parse(fileData)
  } catch {
    // Continue to filesystem lookup
  }

  if (parsed?.isPro || parsed?.meta?.isPro || isComponentPro(cleanName)) {
    return []
  }

  const results: ResolvedSource[] = []
  const registryDeps: string[] = []

  if (parsed?.files && Array.isArray(parsed.files) && parsed.files.length > 0) {
    for (const file of parsed.files) {
      const code: string = file.content || ''

      if (code) {
        const { title, tabLabel } = deduceTitleAndLabel(cleanName, file.path, file.target)
        const language = defaultLanguage ?? title.split('.').pop() ?? 'tsx'
        results.push({
          id: `${cleanName}-${title}`,
          title,
          tabLabel,
          code: cleanImports(code),
          language,
        })
      }
    }

    if (Array.isArray(parsed.registryDependencies)) {
      registryDeps.push(...parsed.registryDependencies)
    }
  } else {
    // 2. Direct filesystem candidate lookup
    const directName = cleanName
      .replace(/^components-spaceui-/, '')
      .replace(/^components-spaceui-base-/, '')
      .replace(/^primitives-/, '')
      .replace(/^demo-/, '')

    const candidates = [
      path.join(process.cwd(), 'src', 'registry', 'primitives', directName, 'index.tsx'),
      path.join(process.cwd(), 'src', 'registry', 'primitives', `${directName}.tsx`),
      path.join(process.cwd(), 'src', 'registry', 'primitives', directName, 'index.ts'),
      path.join(process.cwd(), 'src', 'registry', 'components', 'space', directName, 'index.tsx'),
      path.join(process.cwd(), 'src', 'registry', 'components', 'space', `${directName}.tsx`),
      path.join(process.cwd(), 'src', 'registry', 'hooks', directName, 'index.ts'),
      path.join(process.cwd(), 'src', 'registry', 'hooks', `${directName}.ts`),
      path.join(process.cwd(), 'src', 'registry', 'utils', directName, 'index.ts'),
      path.join(process.cwd(), 'src', 'registry', 'utils', `${directName}.ts`),
      path.join(process.cwd(), 'src', 'registry', 'lib', directName, 'index.ts'),
      path.join(process.cwd(), 'src', 'registry', 'lib', `${directName}.ts`),
      path.join(process.cwd(), 'src', 'registry', directName, 'index.tsx'),
      path.join(process.cwd(), 'src', 'registry', `${directName}.tsx`),
      path.join(process.cwd(), 'src', 'registry', directName.replaceAll('-', '/'), 'index.tsx'),
    ]

    for (const candidate of candidates) {
      try {
        const code = await fs.readFile(candidate, 'utf8')
        if (code) {
          const { title, tabLabel } = deduceTitleAndLabel(cleanName, candidate)
          const language = defaultLanguage ?? title.split('.').pop() ?? 'tsx'
          results.push({
            id: `${cleanName}-${title}`,
            title,
            tabLabel,
            code: cleanImports(code),
            language,
          })
          break
        }
      } catch {
        // try next
      }
    }
  }

  // 3. Resolve recursive dependencies if enabled
  if (resolveDependencies && registryDeps.length > 0) {
    for (const rawDep of registryDeps) {
      const depName = rawDep
        .replace(/.*\/([^/]+)\.json$/i, '$1')
        .replace(/^@[^/]+\//, '')
        .replace(/\.json$/, '')

      if (!depName || visited.has(depName) || isComponentPro(depName)) {
        continue
      }

      const depSources = await resolveRegistryItem(depName, visited, resolveDependencies, defaultLanguage)
      results.push(...depSources)
    }
  }

  return results
}

export async function ComponentSource({
  name,
  sources,
  resolveDependencies = true,
  language,
  allowCopy = true,
  className,
}: ComponentSourceProps) {
  const items: string[] = []

  if (name) {
    items.push(name)
  } else if (sources) {
    if (Array.isArray(sources)) {
      items.push(...sources)
    } else {
      items.push(sources)
    }
  }

  if (items.length === 0) {
    return null
  }

  const visited = new Set<string>()
  const resolvedNested = await Promise.all(
    items.map((item) => resolveRegistryItem(item, visited, resolveDependencies, language)),
  )

  const resolved = resolvedNested.flat()

  if (resolved.length === 0) {
    if (name && isComponentPro(name)) {
      const clean = name
        .replace(/.*\/([^/]+)\.json$/i, '$1')
        .replace(/^@[^/]+\//, '')
        .replace(/\.json$/, '')
      return (
        <div
          data-slot="component-source"
          className={cn(
            'rounded-xl border border-dashed border-border/80 bg-muted/30 p-5 my-3 text-center not-prose',
            className,
          )}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            Pro Component
          </div>
          <h4 className="text-sm font-semibold text-foreground">Source code is protected</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            This component requires Space UI Pro authorization. Install it via CLI with your authenticated token:
          </p>
          <InstallCommandBlock isShadcn packages={clean} />
        </div>
      )
    }
    return null
  }

  if (resolved.length === 1) {
    const single = resolved[0]
    return (
      <div data-slot="component-source" className={cn('relative', className)}>
        <DynamicCodeBlock code={single.code} lang={single.language} title={single.title} allowCopy={allowCopy} />
      </div>
    )
  }

  return (
    <div data-slot="component-source">
      <ComponentSourceTabs sources={resolved} allowCopy={allowCopy} className={className} />
    </div>
  )
}
