import { exec } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { rimraf } from 'rimraf'

const REGISTRY_JSON_PATH = path.join(process.cwd(), 'public', 'r', 'registry.json')

const USE_CACHE = process.argv.includes('--use-cache')

const registryImportTargets = new Map<string, string>()

function registerImportTargets(item: { files?: any[] }) {
  if (!Array.isArray(item.files)) return
  for (const file of item.files) {
    const filePath = typeof file === 'string' ? file : file.path
    const target = typeof file === 'string' ? undefined : file.target
    if (!filePath || !target) continue
    const rest = String(filePath)
      .replace(/\\/g, '/')
      .replace(/^src\/registry\//, '')
      .replace(/\/index\.tsx?$/, '')
    const importTarget = String(target)
      .replace(/\\/g, '/')
      .replace(/\.(tsx?|jsx?)$/, '')
    registryImportTargets.set(`@/registry/${rest}`, importTarget)
  }
}

async function writeFileWithRetry(filePath: string, data: string | Buffer, maxAttempts = 30) {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const tempPath = `${filePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      await fs.writeFile(tempPath, data)
      await fs.rename(tempPath, filePath).catch(async () => {
        await fs.writeFile(filePath, data)
        await fs.unlink(tempPath).catch(() => {})
      })
      return
    } catch (error) {
      if (attempt >= maxAttempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
}

/**
 * Replace registry paths with component paths.
 * @param inputStr - The input string to process.
 * @returns The processed string with registry paths replaced.
 */
function replaceRegistryPaths(inputStr: string): string {
  return inputStr.replace(/(['"])([\s\S]*?)\1/g, (match, quote, content) => {
    if (content.startsWith('@/registry/')) {
      const mapped = registryImportTargets.get(content) || registryImportTargets.get(content.replace(/\/index$/, ''))
      if (mapped) {
        return `${quote}@/${mapped}${quote}`
      }
      const rest = content.slice('@/registry/'.length)
      if (rest.startsWith('lib/')) {
        return `${quote}@/${rest}${quote}`
      }
      if (rest.startsWith('hooks/')) {
        const hookName = rest.split('/').pop()
        return `${quote}@/hooks/${hookName}${quote}`
      }
      if (rest.startsWith('utils/')) {
        return `${quote}@/${rest}${quote}`
      }
      if (rest.startsWith('primitives/')) {
        const primitiveName = rest.slice('primitives/'.length)
        return `${quote}@/components/${primitiveName}${quote}`
      }
      if (rest.startsWith('components/space/')) {
        return `${quote}@/${rest}${quote}`
      }
      if (rest.startsWith('components/')) {
        return `${quote}@/${rest}${quote}`
      }
      return `${quote}@/components/${rest}${quote}`
    } else if (content.startsWith('@workspace/ui/')) {
      const rest = content.slice('@workspace/ui/'.length)
      return `${quote}@/${rest}${quote}`
    }
    return match
  })
}

/**
 * Ensure the registry files exist.
 */
async function ensureRegistry() {
  try {
    await fs.access(REGISTRY_JSON_PATH)
  } catch {
    await fs.mkdir(path.dirname(REGISTRY_JSON_PATH), { recursive: true })
    await fs.writeFile(
      REGISTRY_JSON_PATH,
      JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema/registry.json',
          name: 'spaceui',
          homepage: 'https://www.spaceui.one',
          items: [],
        },
        null,
        2,
      ),
    )
  }

  const indexPath = path.join(process.cwd(), 'src/__registry__/index.tsx')
  try {
    await fs.access(indexPath)
  } catch {
    await fs.mkdir(path.dirname(indexPath), { recursive: true })
    await fs.writeFile(indexPath, '')
  }
}

/**
 * Function to build the merged registry.json file.
 * It searches for all registry-item.json files in the registry directory,
 * removes the $schema property, and merges them into the base registry.json items array.
 */
async function buildRegistryFile() {
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, 'utf-8')
  const registryData = JSON.parse(registryJsonContent)
  const registryFolderPath = path.join(process.cwd(), 'src', 'registry')
  const newItems = await getRegistryItemsFromFolder(registryFolderPath)

  registryData.name = 'spaceui'
  registryData.items = [...newItems]

  await writeFileWithRetry(REGISTRY_JSON_PATH, JSON.stringify(registryData, null, 2))
  await writeFileWithRetry(path.join(process.cwd(), 'registry.json'), JSON.stringify(registryData, null, 2))

  await buildRegistryMetaGraph(newItems)
}

/**
 * Format bytes to human readable string (B, KB, MB)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1))
  return `${val} ${sizes[i]}`
}

/**
 * Build relational metadata graph mapping dependencies, dependents, related components, and code size.
 */
async function buildRegistryMetaGraph(items: any[]) {
  const metaMap: Record<string, any> = {}
  const allItemsMap: Record<string, any> = {}

  for (const it of items) {
    allItemsMap[it.name] = it
    const short = it.name.replace(
      /^(primitives-|components-spaceui-|components-spaceui-|components-reui-base-|components-backgrounds-|components-shader-|components-orb-|components-|lib-space-|lib-|hooks-space-|hooks-)/,
      '',
    )
    allItemsMap[short] = it
  }

  const fileSizeCache = new Map<string, number>()
  async function getFileSize(relPath: string): Promise<number> {
    if (fileSizeCache.has(relPath)) return fileSizeCache.get(relPath)!
    try {
      const full = path.join(process.cwd(), relPath)
      const stat = await fs.stat(full)
      fileSizeCache.set(relPath, stat.size)
      return stat.size
    } catch {
      return 0
    }
  }

  function getTransitiveFilePaths(itemName: string, visited = new Set<string>()): string[] {
    if (visited.has(itemName)) return []
    visited.add(itemName)

    const item =
      allItemsMap[itemName] ||
      allItemsMap[itemName.replace(/^@[^/]+\//, '')] ||
      allItemsMap[
        itemName
          .replace(/^@[^/]+\//, '')
          .replace(
            /^(primitives-|components-spaceui-|components-reui-base-|components-backgrounds-|components-shader-|components-orb-|components-|lib-space-|lib-|hooks-browser-|hooks-dom-|hooks-lifecycle-|hooks-animation-|hooks-form-|hooks-components-|hooks-utils-states-|hooks-utils-|hooks-space-|hooks-)/,
            '',
          )
      ]
    if (!item) return []

    const filePaths: string[] = []
    if (Array.isArray(item.files)) {
      for (const f of item.files) {
        if (typeof f === 'string') filePaths.push(f)
        else if (f?.path) filePaths.push(f.path)
      }
    }

    if (Array.isArray(item.registryDependencies)) {
      for (const dep of item.registryDependencies) {
        if (dep.includes('demo-')) continue
        const cleanDep = dep.replace(/^@[^/]+\//, '').replace(/\.json$/, '')
        filePaths.push(...getTransitiveFilePaths(cleanDep, visited))
      }
    }

    return filePaths
  }

  const uiItems = items.filter((item: any) => {
    if (item.name.startsWith('demo-')) return false
    if (item.type === 'registry:ui' || item.type === 'registry:component' || item.type === 'registry:primitive') {
      return true
    }
    if (item.type === 'registry:block') return true
    if (item.type === 'registry:hook') return true
    if (item.type === 'registry:lib' && item.name.startsWith('hooks-utils')) return true
    return false
  })

  // First pass: create index entries and calculate code sizes
  for (const item of uiItems) {
    const isBlock = item.type === 'registry:block'
    const isPrimitive =
      !isBlock &&
      (item.name.startsWith('primitives-') ||
        (!item.name.startsWith('components-') &&
          !item.name.startsWith('icons-') &&
          !item.name.startsWith('hooks-') &&
          !item.name.startsWith('lib-')))
    const shortName = item.name.replace(
      /^(primitives-|components-spaceui-|components-reui-base-|components-backgrounds-|components-shader-|components-orb-|components-|hooks-browser-|hooks-dom-|hooks-lifecycle-|hooks-animation-|hooks-form-|hooks-components-|hooks-utils-states-|hooks-utils-|hooks-|lib-|utils-)/,
      '',
    )
    const isSpaceComponent = item.name.includes('space') || item.name.startsWith('components-spaceui-')
    const isShaderComponent = item.name.startsWith('components-shader-')
    const isBackgroundComponent = item.name.startsWith('components-backgrounds-')
    const isOrbComponent = item.name.startsWith('components-orb-')
    const isHookDoc =
      item.type === 'registry:hook' || (item.type === 'registry:lib' && item.name.startsWith('hooks-utils'))
    const blockCategory =
      Array.isArray(item.categories) && item.categories[0] ? item.categories[0] : shortName.replace(/-\d+$/, '')
    const url = isHookDoc
      ? `/ui-kit/hooks/${shortName}`
      : isBlock
        ? `/ui-kit/blocks/${blockCategory}`
        : isPrimitive
          ? `/ui-kit/primitives/${shortName}`
          : isShaderComponent
            ? `/ui-kit/components/shader/${shortName}`
            : isBackgroundComponent
              ? `/ui-kit/components/backgrounds/${shortName}`
              : isOrbComponent
                ? `/ui-kit/components/orb/${shortName}`
                : `/ui-kit/components/${isSpaceComponent ? 'spaceui/' : ''}${shortName}`

    // Calculate total transitive code size
    const allFiles = Array.from(new Set(getTransitiveFilePaths(item.name)))
    let totalBytes = 0
    for (const f of allFiles) {
      totalBytes += await getFileSize(f)
    }

    const directFiles = Array.isArray(item.files)
      ? item.files.map((f: any) => (typeof f === 'string' ? f : f.path))
      : []
    let directBytes = 0
    for (const f of directFiles) {
      directBytes += await getFileSize(f)
    }

    // Read title & description from MDX if missing from item
    let docTitle: string | undefined
    let docDescription: string | undefined
    const possibleMdxPaths = [
      path.join(process.cwd(), `src/content/ui-kit/hooks/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/primitives/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/spaceui/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/space/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/backgrounds/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/shader/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/orb/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/components/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/ui-kit/blocks/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/docs/primitives/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/docs/components/spaceui/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/docs/components/space/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/docs/components/${shortName}.mdx`),
      path.join(process.cwd(), `src/content/docs/${shortName}.mdx`),
    ]

    for (const mdxPath of possibleMdxPaths) {
      try {
        const mdxContent = await fs.readFile(mdxPath, 'utf8')
        const titleMatch = mdxContent.match(/title:\s*["']?([^"'\n\r]+)["']?/)
        const descMatch = mdxContent.match(/description:\s*["']?([^"'\n\r]+)["']?/)
        if (titleMatch && !docTitle) docTitle = titleMatch[1].trim()
        if (descMatch && !docDescription) docDescription = descMatch[1].trim()
        if (docTitle && docDescription) break
      } catch {
        // try next path
      }
    }

    const itemCategories = Array.isArray(item.categories)
      ? item.categories.filter((c: string) => c !== 'ui' && c !== 'component')
      : []
    const fallbackCategory = isHookDoc
      ? item.type === 'registry:lib'
        ? 'Utility'
        : 'Hook'
      : isBlock
        ? 'Block'
        : isPrimitive
          ? 'Primitive'
          : 'Component'
    const mainCategory = itemCategories[0]
      ? itemCategories[0].charAt(0).toUpperCase() + itemCategories[0].slice(1)
      : fallbackCategory

    const entry = {
      name: item.name,
      shortName,
      title: item.title || docTitle || shortName.charAt(0).toUpperCase() + shortName.slice(1).replace(/-/g, ' '),
      description: item.description || docDescription,
      type: item.type,
      url,
      category: mainCategory,
      categories:
        itemCategories.length > 0
          ? itemCategories
          : [
              isHookDoc
                ? item.type === 'registry:lib'
                  ? 'utils'
                  : 'hooks'
                : isBlock
                  ? 'block'
                  : isPrimitive
                    ? 'primitive'
                    : 'component',
            ],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      size: formatBytes(totalBytes),
      rawSize: totalBytes,
      directSize: formatBytes(directBytes),
      fileCount: allFiles.length,
      dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
      registryDependencies: Array.isArray(item.registryDependencies) ? item.registryDependencies : [],
      dependents: [] as string[],
      related: [] as any[],
    }

    metaMap[shortName] = entry
    metaMap[item.name] = entry
    if (isBlock && blockCategory) {
      if (!metaMap[blockCategory]) {
        metaMap[blockCategory] = entry
      }
      if (!metaMap[`blocks-${blockCategory}`]) {
        metaMap[`blocks-${blockCategory}`] = entry
      }
    }
    if (isHookDoc && shortName.startsWith('use-')) {
      metaMap[shortName.replace(/^use-/, '')] = entry
    }
  }

  // Second pass: compute dependents
  for (const key of Object.keys(metaMap)) {
    const entry = metaMap[key]
    for (const regDep of entry.registryDependencies) {
      if (regDep.includes('demo-')) continue
      const depShortName = regDep
        .replace(/^@[^/]+\//, '')
        .replace(
          /^(primitives-|components-spaceui-|components-reui-base-|components-backgrounds-|components-shader-|components-orb-|components-|hooks-browser-|hooks-dom-|hooks-lifecycle-|hooks-animation-|hooks-form-|hooks-components-|hooks-utils-states-|hooks-utils-|hooks-)/,
          '',
        )
        .replace(/\.json$/, '')
      if (
        metaMap[depShortName] &&
        !metaMap[depShortName].dependents.includes(entry.shortName) &&
        depShortName !== entry.shortName
      ) {
        metaMap[depShortName].dependents.push(entry.shortName)
      }
    }
  }

  // Third pass: compute related components
  for (const key of Object.keys(metaMap)) {
    const entry = metaMap[key]
    const relatedSet = new Set<string>()

    // 1. Direct registry dependencies
    for (const regDep of entry.registryDependencies) {
      if (regDep.includes('demo-')) continue
      const depShortName = regDep
        .replace(/^@[^/]+\//, '')
        .replace(
          /^(primitives-|components-spaceui-|components-reui-base-|components-backgrounds-|components-shader-|components-orb-|components-|hooks-browser-|hooks-dom-|hooks-lifecycle-|hooks-animation-|hooks-form-|hooks-components-|hooks-utils-states-|hooks-utils-|hooks-)/,
          '',
        )
        .replace(/\.json$/, '')
      if (metaMap[depShortName] && depShortName !== entry.shortName) {
        relatedSet.add(depShortName)
      }
    }

    // 2. Dependents (components using this)
    for (const depShortName of entry.dependents) {
      if (metaMap[depShortName] && depShortName !== entry.shortName && !depShortName.startsWith('demo-')) {
        relatedSet.add(depShortName)
      }
    }

    // 3. Fallback to same category
    if (relatedSet.size < 3) {
      for (const otherKey of Object.keys(metaMap)) {
        if (relatedSet.size >= 3) break
        const other = metaMap[otherKey]
        if (
          other.shortName !== entry.shortName &&
          other.category === entry.category &&
          !other.shortName.startsWith('demo-')
        ) {
          relatedSet.add(other.shortName)
        }
      }
    }

    entry.related = Array.from(relatedSet)
      .slice(0, 3)
      .map((k) => {
        const rel = metaMap[k]
        return {
          name: rel.shortName,
          title: rel.title,
          description: rel.description,
          url: rel.url,
          category: rel.category,
          categories: rel.categories || [],
        }
      })
  }

  await writeFileWithRetry(
    path.join(process.cwd(), 'src', '__registry__', 'meta.json'),
    JSON.stringify(metaMap, null, 2),
  )
  await writeFileWithRetry(
    path.join(process.cwd(), 'public', 'r', 'registry-meta.json'),
    JSON.stringify(metaMap, null, 2),
  )
}

/**
 * Recursively search for registry-item.json files in a given directory.
 * @param dir - Directory to search in.
 * @returns An array of registry item objects.
 */
async function getRegistryItemsFromFolder(dir: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = []
  // Read directory entries with file type information
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const registryItemPath = path.join(fullPath, 'registry-item.json')
      try {
        const raw = await fs.readFile(registryItemPath, 'utf-8')
        const content = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
        const item = JSON.parse(content)
        if (item.$schema) {
          delete item.$schema
        }
        registerImportTargets(item)
        items.push(item)
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          console.error('Error loading registry item:', registryItemPath, err)
        }
      }

      const children = await fs.readdir(fullPath, { withFileTypes: true })
      const hasSubDirs = children.some((c) => c.isDirectory())
      if (hasSubDirs) {
        const subItems = await getRegistryItemsFromFolder(fullPath)
        items.push(...subItems)
      }
    }
  }
  return items
}

/**
 * Function to build the registry index file.
 * This function reads the registry.json items and builds a dynamic index file.
 */
async function buildRegistryIndex() {
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, 'utf-8')
  const registryItems = JSON.parse(registryJsonContent)

  let index = `/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
// Do not edit this file directly.
import * as React from "react"

export const index: Record<string, any> = {`

  // Remove duplicates: only keep the last item with a given name
  const uniqueItemsMap = new Map<string, (typeof registryItems.items)[0]>()
  // Use the base items from registry.json merged file
  for (const item of registryItems.items) {
    if (uniqueItemsMap.has(item.name)) {
      console.warn(`Duplicate item name detected: ${item.name}. Overwriting previous entry.`)
    }
    uniqueItemsMap.set(item.name, item)
  }

  // Process only unique items
  for (const item of uniqueItemsMap.values()) {
    // Skip items without files
    if (!item.files) continue

    console.log('Processing item:', item.name)
    // Define the component path from the first file if exists and is a JS/TS component
    const firstFile = typeof item.files[0] === 'string' ? item.files[0] : item.files[0]?.path
    const isCodeComponent =
      firstFile && /\.(?:tsx?|jsx?)$/.test(firstFile) && item.type !== 'registry:font' && item.type !== 'registry:file'
    const componentPath = isCodeComponent ? `@/${firstFile.replace(/^src\//, '')}` : ''

    // Read files and add content preserving newlines
    const filesWithContent = await Promise.all(
      item.files.map(async (file: any) => {
        const filePath = typeof file === 'string' ? file : file.path
        const resolvedFilePath = path.resolve(filePath)

        try {
          const isBinary = /\.(?:woff2?|ttf|otf|eot|png|jpe?g|webp|gif|ico)$/i.test(resolvedFilePath)
          let processedContent = ''
          if (!isBinary) {
            const content = await fs.readFile(resolvedFilePath, 'utf-8')
            processedContent = replaceRegistryPaths(content).trim()
          }

          return {
            path: filePath,
            type: file.type || 'unknown',
            target: file.target || '',
            content: processedContent,
          }
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error)
          return {
            path: filePath,
            type: file.type || 'unknown',
            target: file.target || '',
            content: '',
          }
        }
      }),
    )

    index += `
  "${item.name}": {
    name: ${JSON.stringify(item.name)},
    description: ${JSON.stringify(item.description ?? '')},
    type: "${item.type}",
    dependencies: ${JSON.stringify(item.dependencies)},
    devDependencies: ${JSON.stringify(item.devDependencies)},
    registryDependencies: ${JSON.stringify(item.registryDependencies)},
    files: ${JSON.stringify(
      filesWithContent.map((f) => ({ ...f, content: undefined })),
      null,
      2,
    )},
    keywords: ${JSON.stringify(item.meta?.keywords ?? [])},
    component: ${
      componentPath
        ? `(() => {
      const LazyComp = React.lazy(async () => {
        const mod = await import("${componentPath}");
        const exportName = Object.keys(mod).find(
          key => typeof mod[key] === 'function' || typeof mod[key] === 'object'
        ) || "${item.name}";
        const Comp = mod.default || mod[exportName];
        if (mod.animations) {
          (LazyComp as any).animations = mod.animations;
        }
        return { default: Comp };
      });
      LazyComp.demoProps = ${JSON.stringify(item?.meta?.demoProps ?? {})};
      return LazyComp;
    })()`
        : 'null'
    },
    command: '@spaceui/${item.name}',
  },`
  }

  index += `
  }`

  // Remove the previous registry index file and write the new one.
  await rimraf(path.join(process.cwd(), 'src/__registry__/index.tsx'))
  await fs.mkdir(path.join(process.cwd(), 'src/__registry__'), { recursive: true })
  await writeFileWithRetry(path.join(process.cwd(), 'src/__registry__/index.tsx'), index)
}

/**
 * Build the client-side component loaders separately from registry metadata.
 *
 * Next loads the MDX component map in its global compilation graph. Importing
 * the full registry index there forced it to parse every source-code string
 * before rendering even the home page. This generated file intentionally
 * contains only lazy loaders; metadata and source code are fetched from
 * public/r on demand.
 */
async function buildRegistryComponentIndex() {
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, 'utf-8')
  const registryItems = JSON.parse(registryJsonContent)
  const uniqueItems = new Map<string, (typeof registryItems.items)[0]>()

  for (const item of registryItems.items) {
    uniqueItems.set(item.name, item)
  }

  const componentGroups = new Map<string, Array<{ item: (typeof registryItems.items)[0]; componentPath: string }>>()

  const groupFor = (itemName: string, componentPath: string) => {
    const normalized = componentPath.replaceAll('\\\\', '/')

    if (normalized.startsWith('registry/icons/')) {
      const iconName = itemName.replace(/^icons-/, '')
      return `icons-${iconName.charAt(0).toLowerCase() || 'other'}`
    }

    let groupPath = path.posix.dirname(normalized)
    if (/\/index\.(?:tsx?|jsx?)$/.test(normalized)) {
      groupPath = path.posix.dirname(groupPath)
    }

    return groupPath
      .replace(/^src\/registry\//, '')
      .replace(/^registry\//, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
  }

  for (const item of uniqueItems.values()) {
    const componentPath = item.files?.[0]?.path
    if (
      !componentPath ||
      item.type === 'registry:font' ||
      item.type === 'registry:file' ||
      !/\.(?:tsx?|jsx?)$/.test(componentPath)
    ) {
      continue
    }

    const group = groupFor(item.name, componentPath)
    const entries = componentGroups.get(group) ?? []
    entries.push({ item, componentPath })
    componentGroups.set(group, entries)
  }

  const groupsDirectory = path.join(process.cwd(), 'src/__registry__', 'component-groups')
  if (!USE_CACHE) {
    await rimraf(groupsDirectory)
  }
  await fs.mkdir(groupsDirectory, { recursive: true })

  for (const [group, entries] of componentGroups) {
    let shard = `/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
import * as React from 'react';

type RegistryComponent = React.LazyExoticComponent<React.ComponentType<any>> & {
  animations?: Record<string, unknown>;
  demoProps?: Record<string, unknown>;
};

function lazyRegistryComponent(
  loader: () => Promise<Record<string, any>>,
  demoProps: Record<string, unknown>,
): RegistryComponent {
  const LazyComponent = React.lazy(async () => {
    const mod = await loader();
    const exportName = Object.keys(mod).find(
      (key) => typeof mod[key] === 'function' || typeof mod[key] === 'object',
    );
    const Component = mod.default || (exportName ? mod[exportName] : null);

    if (!Component) {
      throw new Error('Registry module has no React component export.');
    }

    if (mod.animations) LazyComponent.animations = mod.animations;
    return { default: Component };
  }) as RegistryComponent;

  LazyComponent.demoProps = demoProps;
  return LazyComponent;
}

export const registryComponents: Record<string, RegistryComponent> = {`

    for (const { item, componentPath } of entries) {
      shard += `
  ${JSON.stringify(item.name)}: lazyRegistryComponent(
    () => import(${JSON.stringify(`@/${componentPath.replace(/^src\//, '')}`)}),
    ${JSON.stringify(item.meta?.demoProps ?? {})},
  ),`
    }

    shard += `
};
`
    await writeFileWithRetry(path.join(groupsDirectory, `${group}.tsx`), shard)
  }

  let output = `// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
// Do not edit this file directly.
export const componentGroups: Record<string, string> = {`

  for (const [group, entries] of componentGroups) {
    for (const { item } of entries) {
      output += `
  ${JSON.stringify(item.name)}: ${JSON.stringify(group)},`
    }
  }

  output += `
};

export function hasRegistryComponent(name: string) {
  return name in componentGroups;
}

export function getRegistryComponentGroup(name: string) {
  return componentGroups[name] ?? null;
}
`

  await writeFileWithRetry(path.join(process.cwd(), 'src/__registry__/components.tsx'), output)

  let iconComponents = `/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
import * as React from 'react';

type RegistryIcon = React.LazyExoticComponent<React.ComponentType<any>> & {
  animations?: Record<string, unknown>;
};

function lazyRegistryIcon(loader: () => Promise<Record<string, any>>) {
  const LazyIcon = React.lazy(async () => {
    const mod = await loader();
    const exportName = Object.keys(mod).find(
      (key) => typeof mod[key] === 'function' || typeof mod[key] === 'object',
    );
    const Component = mod.default || (exportName ? mod[exportName] : null);
    if (!Component) throw new Error('Registry icon has no React export.');
    if (mod.animations) LazyIcon.animations = mod.animations;
    return { default: Component };
  }) as RegistryIcon;
  return LazyIcon;
}

export const iconComponents: Record<string, RegistryIcon> = {`

  for (const item of uniqueItems.values()) {
    if (!item.name.startsWith('icons-') || item.name === 'icons-icon') continue
    const componentPath = item.files?.[0]?.path
    if (!componentPath) continue
    iconComponents += `
  ${JSON.stringify(item.name)}: lazyRegistryIcon(
    () => import(${JSON.stringify(`@/${componentPath.replace(/^src\//, '')}`)}),
  ),`
  }

  iconComponents += `
};
`
  await writeFileWithRetry(path.join(process.cwd(), 'src/__registry__/icon-components.tsx'), iconComponents)

  // Clean up legacy generated examples directory
  const generatedExamples = path.join(process.cwd(), 'src', 'app', 'examples', 'generated')
  await rimraf(generatedExamples)

  // Ensure registry/view route directory and page exist
  const viewRouteDirectory = path.join(process.cwd(), 'src', 'app', 'registry', 'view', '[name]')
  await fs.mkdir(viewRouteDirectory, { recursive: true })
  await writeFileWithRetry(
    path.join(process.cwd(), 'src', 'app', 'registry', 'view', 'layout.tsx'),
    `import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex,nofollow',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`,
  )

  await writeFileWithRetry(
    path.join(viewRouteDirectory, 'page.tsx'),
    `'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { index } from '@/__registry__/index';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

function unwrapValues(value: any): any {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  if ('value' in value) return value.value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, unwrapValues(nested)]),
  );
}

export default async function RegistryViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ props?: string }>;
}) {
  const { name } = await params;
  const item = index[name];
  if (!item || !item.component) notFound();

  const Component = item.component;
  const defaults = unwrapValues(Component.demoProps ?? item.meta?.demoProps ?? {});
  let sharedProps = {};
  try {
    const encodedProps = (await searchParams).props;
    if (encodedProps) sharedProps = JSON.parse(encodedProps);
  } catch {
    // Invalid shared props fall back to the original demo defaults.
  }
  const props = { ...defaults, ...sharedProps };

  const isUncontained =
    item.type === 'registry:block' ||
    item.type === 'registry:template' ||
    name.startsWith('block-') ||
    name.startsWith('template-') ||
    name.includes('shader') ||
    name.includes('gradient');

  return (
    <main
      className={\`flex min-h-screen items-center justify-center \${
        isUncontained ? 'w-full p-0 overflow-x-hidden' : 'p-8'
      }\`}
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading preview...</div>}>
        <Component {...props} />
      </Suspense>
    </main>
  );
}
`,
  )

  const hookNames = [...uniqueItems.keys()].filter((name) => name.startsWith('hooks-') && !name.startsWith('demo-'))
  const hookComponents = hookNames.filter((name) => name.startsWith('hooks-components-')).length
  const hookUtils = hookNames.filter((name) => name.startsWith('hooks-utils-')).length
  const hooksOnly = hookNames.length - hookComponents - hookUtils

  const blockItems = [...uniqueItems.values()].filter(
    (item) => item.name.startsWith('block-') || (item.type === 'registry:block' && !item.name.startsWith('template-')),
  )
  const templateItems = [...uniqueItems.values()].filter(
    (item) => item.name.startsWith('template-') || item.type === 'registry:template',
  )

  const stats = {
    components: [...uniqueItems.keys()].filter((name) => name.startsWith('components-')).length,
    primitives: [...uniqueItems.keys()].filter((name) => name.startsWith('primitives-')).length,
    blocks: blockItems.length,
    templates: templateItems.length,
    hooks: hookNames.length,
    hooksOnly,
    hookComponents,
    hookUtils,
  }
  await writeFileWithRetry(
    path.join(process.cwd(), 'src/__registry__/stats.ts'),
    `// This file is autogenerated by scripts/build-registry.ts\nexport const registryStats = ${JSON.stringify(stats, null, 2)} as const;\n`,
  )
}

/**
 * Function to build the registry.
 * It clears the previous registry directory, builds the registry files,
 * and replaces specific path strings in the generated files.
 */
async function buildRegistry(postprocessOnly = false) {
  if (!postprocessOnly) {
    // 1. Ensure 'public/r' exists
    await fs.mkdir('public/r', { recursive: true })

    if (!USE_CACHE) {
      // 2. Remove everything except registry.json
      const entries = await fs.readdir('public/r')
      await Promise.all(
        entries.map(async (entry) => {
          if (entry === 'registry.json') return
          const entryPath = path.join('public/r', entry)
          await fs.rm(entryPath, { recursive: true, force: true })
        }),
      )
    }

    // 2. Build the registry using the shadcn build command
    await new Promise((resolve, reject) => {
      const proc = exec(`npx --yes shadcn@latest build public/r/registry.json --output ./public/r/`)

      proc.stdout?.on('data', (d) => console.log(d.toString()))
      proc.stderr?.on('data', (d) => console.error(d.toString()))

      proc.on('exit', (code) => {
        if (code === 0) {
          resolve(undefined)
        } else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })
    })
  }

  // 3. Replace `@/registry/space-ui/` with `@/components/space-ui/` and preserve `meta` in all files
  const registryJsonContent = await fs.readFile(REGISTRY_JSON_PATH, 'utf-8')
  const registryData = JSON.parse(registryJsonContent)
  const sourceItemsMap = new Map<string, any>(registryData.items?.map((it: any) => [it.name, it]))

  const files = await fs.readdir(path.join(process.cwd(), 'public/r'))

  for (const [index, file] of files.entries()) {
    if (file === 'registry.json' || file === 'registry-meta.json') continue
    const filePath = path.join(process.cwd(), 'public/r', file)
    const stat = await fs.stat(filePath)
    if (stat.isDirectory()) continue

    const content = await fs.readFile(filePath, 'utf-8')
    let registryItem: any
    try {
      registryItem = JSON.parse(content)
    } catch {
      continue
    }

    const sourceItem = sourceItemsMap.get(registryItem.name)
    let modified = false

    if (sourceItem?.meta) {
      registryItem.meta = sourceItem.meta
      modified = true
    }

    // Replace `@/registry` in file contents
    if (content.includes('@/registry') || content.includes('@workspace/ui/')) {
      registryItem.files = registryItem.files?.map((file: any) => {
        if (file.content?.includes('@/registry') || file.content?.includes('@workspace/ui/')) {
          file.content = replaceRegistryPaths(file.content)
        }
        return file
      })
      modified = true
    }

    // Normalize registryDependencies to direct URLs for universal CLI compatibility
    if (Array.isArray(registryItem.registryDependencies) && registryItem.registryDependencies.length > 0) {
      const updatedDeps = registryItem.registryDependencies.map((dep: string) => {
        if (typeof dep !== 'string') return dep
        if (dep.startsWith('http://') || dep.startsWith('https://')) return dep
        const cleanDep = dep
          .replace(/^@[^/]+\//, '')
          .replace(/\.json$/, '')
          .trim()
        return `https://www.spaceui.one/r/${cleanDep}.json`
      })
      if (JSON.stringify(updatedDeps) !== JSON.stringify(registryItem.registryDependencies)) {
        registryItem.registryDependencies = updatedDeps
        modified = true
      }
    }

    if (!modified) continue

    // Process sequentially and retry transient Windows handle-pressure errors.
    const destination = path.join(process.cwd(), 'public/r', file)
    for (let attempt = 0; ; attempt += 1) {
      try {
        await writeFileWithRetry(destination, JSON.stringify(registryItem, null, 2))
        break
      } catch (error) {
        if (
          attempt >= 50 ||
          !(error instanceof Error) ||
          !('code' in error) ||
          (error.code !== 'UNKNOWN' && error.code !== 'EBUSY' && error.code !== 'EPERM')
        ) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
    if (index % 25 === 24) {
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }
}

// Execute the build process in the following order:
// 1. Build the merged registry.json file with new items from registry-item.json files.
// 2. Build the registry index.
// 3. Build the registry.

async function ensureRegistryFiles() {
  const publicR = path.dirname(REGISTRY_JSON_PATH)
  await fs.mkdir(publicR, { recursive: true })
  try {
    await fs.access(REGISTRY_JSON_PATH)
  } catch {
    await fs.writeFile(
      REGISTRY_JSON_PATH,
      JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema/registry.json',
          name: 'spaceui',
          homepage: 'https://www.spaceui.one',
          items: [],
        },
        null,
        2,
      ),
    )
    console.log('Created missing public/r/registry.json')
  }

  const registryDir = path.join(process.cwd(), 'src/__registry__')
  await fs.mkdir(registryDir, { recursive: true })
  const indexPath = path.join(registryDir, 'index.tsx')
  try {
    await fs.access(indexPath)
  } catch {
    await fs.writeFile(indexPath, 'export const index: Record<string, any> = {};\\n')
    console.log('Created missing src/__registry__/index.tsx')
  }
}

async function main() {
  try {
    await ensureRegistryFiles()
    registryImportTargets.clear()
    await getRegistryItemsFromFolder(path.join(process.cwd(), 'src', 'registry'))
    const postprocessOnly = process.argv.includes('--postprocess-only')
    const componentsOnly = process.argv.includes('--components-only')
    if (componentsOnly) {
      await buildRegistryComponentIndex()
    } else if (!postprocessOnly) {
      console.log('🔨 Building merged registry file...')
      await buildRegistryFile()
      console.log('🗂️ Building registry/__index__.tsx...')
      await buildRegistryIndex()
      await buildRegistryComponentIndex()
      console.log('🏗️ Building registry almost finished...')
    }
    if (!componentsOnly) {
      await buildRegistry(postprocessOnly)
      const registryFolderPath = path.join(process.cwd(), 'src', 'registry')
      const allItems = await getRegistryItemsFromFolder(registryFolderPath)
      await buildRegistryMetaGraph(allItems)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
